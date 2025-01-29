import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Kit } from './entities/kit.entity';
import { Repository } from 'typeorm';
import { Item, ItemCategory } from '../item/entities/item.entity';
import { NotificationService } from '../notification/notification.service';
import { ItemService } from '../item/item.service';
import { KitTemplate } from './entities/kit-template.entity';
import { InventoryHistoryService } from '../inventory-history/inventory-history.service';

@Injectable()
export class KitService {
  constructor(
    @InjectRepository(Kit)
    private kitRepository: Repository<Kit>,
    private notificationService: NotificationService,
    @Inject(forwardRef(() => ItemService))
    private itemService: ItemService,
    @InjectRepository(KitTemplate)
    private templateRepository: Repository<KitTemplate>,
    private inventoryHistoryService: InventoryHistoryService,
  ) {}

  async create(createKitDto: CreateKitDto): Promise<Kit> {
    const kit = this.kitRepository.create(createKitDto);
    return await this.kitRepository.save(kit);
  }

  async findAll(): Promise<Kit[]> {
    return await this.kitRepository.find({
      relations: ['items'],
    });
  }

  async findOne(id: string): Promise<Kit> {
    const kit = await this.kitRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!kit) {
      throw new NotFoundException(`Kit with ID ${id} not found`);
    }
    return kit;
  }

  async update(id: string, updateKitDto: UpdateKitDto): Promise<Kit> {
    const kit = await this.findOne(id);
    Object.assign(kit, updateKitDto);
    return await this.kitRepository.save(kit);
  }

  async remove(id: string): Promise<void> {
    const result = await this.kitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Kit with ID ${id} not found`);
    }
  }

  async getKitStatus(id: string): Promise<{
    id: string;
    name: string;
    location: string;
    status: {
      totalItems: number;
      lowStockItems: Item[];
      expiringItems: Item[];
      missingEssentials: { category: ItemCategory; name: string }[];
    };
  }> {
    const kit = await this.kitRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!kit) {
      throw new NotFoundException(`Kit with ID ${id} not found`);
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    return {
      id: kit.id,
      name: kit.name,
      location: kit.location,
      status: {
        totalItems: kit.items.length,
        lowStockItems: kit.items.filter(
          (item) => item.quantity <= item.minimumQuantity,
        ),
        expiringItems: kit.items.filter(
          (item) =>
            item.expirationDate && item.expirationDate <= thirtyDaysFromNow,
        ),
        missingEssentials: this.checkMissingEssentials(kit.items),
      },
    };
  }

  async clearItemHistory(id: string) {
    const kit = await this.kitRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!kit) {
      throw new NotFoundException('Kit not found');
    }

    const itemIds = kit.items.map((item) => item.id);
    await this.inventoryHistoryService.deleteByItemIds(itemIds);

    return { success: true };
  }

  private checkMissingEssentials(items: Item[]) {
    const essentials = [
      { category: ItemCategory.BANDAGE, name: 'adhesive bandages' },
      { category: ItemCategory.TOOL, name: 'scissors' },
      { category: ItemCategory.TOPICAL, name: 'antiseptic' },
      // Add more essential items as needed
    ];

    return essentials.filter(
      (essential) =>
        !items.some(
          (item) =>
            item.category === essential.category &&
            item.name.toLowerCase().includes(essential.name.toLowerCase()),
        ),
    );
  }

  async searchKits(searchTerm: string) {
    return this.kitRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.items', 'items')
      .where('LOWER(kit.name) LIKE LOWER(:term)', { term: `%${searchTerm}%` })
      .orWhere('LOWER(kit.location) LIKE LOWER(:term)', {
        term: `%${searchTerm}%`,
      })
      .getMany();
  }

  async getKitsByLocation(location: string) {
    return this.kitRepository.find({
      where: { location },
      relations: ['items'],
    });
  }

  async checkKitStatus(id: string): Promise<void> {
    const kit = await this.kitRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!kit) {
      throw new NotFoundException(`Kit with ID ${id} not found`);
    }

    const lowStockItems = kit.items.filter(
      (item) => item.quantity <= item.minimumQuantity,
    );
    const expiringItems = kit.items.filter((item) => {
      if (!item.expirationDate) {
        return false;
      }
      const daysUntilExpiration = Math.ceil(
        (item.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiration <= 30;
    });

    if (lowStockItems.length > 0) {
      await this.notificationService.sendLowStockAlert(
        kit.id,
        kit.name,
        lowStockItems,
      );
    }

    if (expiringItems.length > 0) {
      await this.notificationService.sendExpiringAlert(
        kit.id,
        kit.name,
        expiringItems,
      );
    }
  }

  async duplicateKit(id: string, newName: string): Promise<Kit> {
    const originalKit = await this.kitRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!originalKit) {
      throw new NotFoundException(`Kit with ID ${id} not found`);
    }

    const newKit = this.kitRepository.create({
      name: newName,
      location: originalKit.location,
      ownerId: originalKit.ownerId,
      description: `Copy of ${originalKit.name}`,
    });

    const savedKit = await this.kitRepository.save(newKit);

    // Duplicate all items
    const itemPromises = originalKit.items.map((item) => {
      const newItem = {
        kitId: savedKit.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minimumQuantity: item.minimumQuantity,
        expirationDate: item.expirationDate,
      };
      return this.itemService.create(newItem);
    });

    await Promise.all(itemPromises);

    return this.findOne(savedKit.id);
  }

  async createFromTemplate(
    templateId: string,
    name: string,
    location: string,
    ownerId: string,
  ): Promise<Kit> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    const kit = await this.create({
      name,
      ownerId,
      location,
      description: `Created from template: ${template.name}`,
    });

    // Create items from template
    for (const templateItem of template.items) {
      await this.itemService.create({
        ...templateItem,
        kitId: kit.id,
      });
    }

    return this.findOne(kit.id);
  }

  async saveAsTemplate(
    kitId: string,
    name: string,
    description: string,
  ): Promise<KitTemplate> {
    const items = await this.itemService.findByKitId(kitId);

    const template = this.templateRepository.create({
      name,
      description,
      items: items.map((item) => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minimumQuantity: item.minimumQuantity,
      })),
    });

    return await this.templateRepository.save(template);
  }

  async findTemplateById(templateId: string): Promise<KitTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return template;
  }
}
