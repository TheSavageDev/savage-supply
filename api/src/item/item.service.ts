import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Between, In, LessThanOrEqual, Repository } from 'typeorm';
import { KitService } from '../kit/kit.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { NotificationService } from '../notification/notification.service';
import { InventoryHistoryService } from '../inventory-history/inventory-history.service';
import { HistoryActionType } from '../inventory-history/entities/inventory-history.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @Inject(forwardRef(() => KitService))
    private kitService: KitService,
    private notificationService: NotificationService,
    private inventoryHistoryService: InventoryHistoryService,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    await this.kitService.findOne(createItemDto.kitId);

    // Get Kit Name
    const kit = await this.kitService.findOne(createItemDto.kitId);

    const item = this.itemRepository.create({
      ...createItemDto,
      kitName: kit.name,
    });
    return await this.itemRepository.save(item);
  }

  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find({
      relations: ['kit'],
    });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['kit'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async findByKitId(kitId: string): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { kitId },
      relations: ['kit'],
    });
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);

    if (updateItemDto.kitId) {
      await this.kitService.findOne(updateItemDto.kitId);
    }

    Object.assign(item, updateItemDto);
    return await this.itemRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.itemRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
  }

  async findExpiringSoon(days: number = 30): Promise<Item[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    return await this.itemRepository.find({
      where: {
        expirationDate: LessThanOrEqual(expirationDate),
      },
      relations: ['kit'],
    });
  }

  async findLowStock(): Promise<Item[]> {
    return await this.itemRepository
      .createQueryBuilder('item')
      .where('item.quantity <= item.minimumQuantity')
      .leftJoinAndSelect('item.kit', 'kit')
      .getMany();
  }

  async findExpiringInRange(
    startDays: number,
    endDays: number,
  ): Promise<Item[]> {
    const startDate = new Date();
    const endDate = new Date();
    startDate.setDate(startDate.getDate() + startDays);
    endDate.setDate(endDate.getDate() + endDays);

    return await this.itemRepository.find({
      where: {
        expirationDate: Between(startDate, endDate),
      },
      relations: ['kit'],
    });
  }

  async updateQuantity(id: string, quantity: number): Promise<Item> {
    const item = await this.findOne(id);
    const oldQuantity = item.quantity;
    item.quantity = quantity;

    await this.inventoryHistoryService.logChange(
      id,
      item.kitId,
      HistoryActionType.QUANTITY_CHANGED,
      {
        oldQuantity,
        newQuantity: quantity,
      },
    );

    return await this.itemRepository.save(item);
  }

  async searchItems(searchTerm: string): Promise<Item[]> {
    return await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.kit', 'kit')
      .where('LOWER(item.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('item.category::text LIKE LOWER(:categoryTerm)', {
        categoryTerm: `%${searchTerm}%`,
      })
      .getMany();
  }

  async findExpiredItems(): Promise<Item[]> {
    const now = new Date();
    return this.itemRepository.find({
      where: {
        expirationDate: LessThanOrEqual(now),
      },
      relations: ['kit'],
    });
  }

  async bulkUpdateQuantities(
    updates: { id: string; quantity: number }[],
  ): Promise<Item[]> {
    const itemIds = updates.map((update) => update.id);
    const items = await this.itemRepository.find({
      where: { id: In(itemIds) },
    });

    if (items.length !== updates.length) {
      throw new NotFoundException('One or more items not found');
    }

    const updatedItems = await Promise.all(
      updates.map(async (update) => {
        const item = items.find((i) => i.id === update.id);
        const oldQuantity = item.quantity;
        item.quantity = update.quantity;

        await this.inventoryHistoryService.logChange(
          item.id,
          item.kitId,
          HistoryActionType.QUANTITY_CHANGED,
          {
            oldQuantity,
            newQuantity: update.quantity,
          },
        );

        return item;
      }),
    );

    return await this.itemRepository.save(updatedItems);
  }

  async createFromTemplate(templateId: string, kitId: string): Promise<Item[]> {
    const template = await this.kitService.findTemplateById(templateId);
    const items = template.items.map((templateItem) =>
      this.itemRepository.create({
        ...templateItem,
        kitId,
      }),
    );

    const savedItems = await this.itemRepository.save(items);

    // Log creation in history
    await Promise.all(
      savedItems.map((item) =>
        this.inventoryHistoryService.logChange(
          item.id,
          kitId,
          HistoryActionType.CREATED,
          { template: templateId },
        ),
      ),
    );

    return savedItems;
  }
}
