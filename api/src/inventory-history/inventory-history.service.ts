import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import {
  InventoryHistory,
  HistoryActionType,
} from './entities/inventory-history.entity';

@Injectable()
export class InventoryHistoryService {
  constructor(
    @InjectRepository(InventoryHistory)
    private historyRepository: Repository<InventoryHistory>,
  ) {}

  async logChange(
    itemId: string,
    kitId: string,
    action: HistoryActionType,
    changes: Record<string, any>,
  ): Promise<InventoryHistory> {
    const history = this.historyRepository.create({
      itemId,
      kitId,
      action,
      changes,
    });
    return await this.historyRepository.save(history);
  }

  async getItemHistory(
    itemId: string,
    limit?: number,
    startDate?: Date,
    endDate?: Date,
    action?: HistoryActionType,
  ): Promise<InventoryHistory[]> {
    const query = this.historyRepository
      .createQueryBuilder('history')
      .where('history.itemId = :itemId', { itemId })
      .leftJoinAndSelect('history.item', 'item')
      .orderBy('history.timestamp', 'DESC');

    if (startDate && endDate) {
      query.andWhere('history.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (action) {
      query.andWhere('history.action = :action', { action });
    }

    if (limit) {
      query.take(limit);
    }

    return await query.getMany();
  }

  async getKitHistory(
    kitId: string,
    limit?: number,
    action?: string,
  ): Promise<InventoryHistory[]> {
    const query = this.historyRepository
      .createQueryBuilder('history')
      .where('history.kitId = :kitId', { kitId })
      .leftJoinAndSelect('history.item', 'item')
      .orderBy('history.timestamp', 'DESC');

    if (action) {
      query.andWhere('history.action = :action', { action });
    }

    if (limit) {
      query.take(limit);
    }

    return await query.getMany();
  }

  async getRecentChanges(limit: number = 10): Promise<InventoryHistory[]> {
    return await this.historyRepository.find({
      relations: ['item'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getKitHistorySummary(kitId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await this.historyRepository
      .createQueryBuilder('history')
      .where('history.kitId = :kitId', { kitId })
      .andWhere('history.timestamp >= :startDate', { startDate })
      .leftJoinAndSelect('history.item', 'item')
      .getMany();

    return {
      totalChanges: history.length,
      quantityChanges: history.filter(
        (h) => h.action === HistoryActionType.QUANTITY_CHANGED,
      ).length,
      expirations: history.filter((h) => h.action === HistoryActionType.EXPIRED)
        .length,
      newItems: history.filter((h) => h.action === HistoryActionType.CREATED)
        .length,
      removedItems: history.filter(
        (h) => h.action === HistoryActionType.DELETED,
      ).length,
      mostChangedItems: this.getMostChangedItems(history),
    };
  }

  async getExpirationReport(startDate: Date, endDate: Date) {
    const history = await this.historyRepository.find({
      where: {
        action: HistoryActionType.EXPIRED,
        timestamp: Between(startDate, endDate),
      },
      relations: ['item'],
      order: { timestamp: 'DESC' },
    });

    return {
      totalExpired: history.length,
      items: history.map((h) => ({
        itemId: h.itemId,
        itemName: h.item.name,
        expirationDate: h.changes.expirationDate,
        kitId: h.kitId,
      })),
    };
  }

  async deleteByItemIds(itemIds: string[]) {
    return this.historyRepository.delete({ itemId: In(itemIds) });
  }

  private getMostChangedItems(history: InventoryHistory[]) {
    const itemChanges = history.reduce(
      (acc, h) => {
        acc[h.itemId] = (acc[h.itemId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(itemChanges)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([itemId, changes]) => ({
        itemId,
        changes,
        itemName: history.find((h) => h.itemId === itemId)?.item.name,
      }));
  }
}
