import { Controller, Get, Param, Query } from '@nestjs/common';
import { InventoryHistoryService } from './inventory-history.service';

@Controller('inventory-history')
export class InventoryHistoryController {
  constructor(
    private readonly inventoryHistoryService: InventoryHistoryService,
  ) {}

  @Get('item/:itemId')
  getItemHistory(
    @Param('itemId') itemId: string,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryHistoryService.getItemHistory(itemId, limit);
  }

  @Get('kit/:kitId')
  getKitHistory(
    @Param('kitId') kitId: string,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
  ) {
    return this.inventoryHistoryService.getKitHistory(kitId, limit, action);
  }

  @Get('recent')
  getRecentChanges(@Query('limit') limit: number = 10) {
    return this.inventoryHistoryService.getRecentChanges(limit);
  }

  @Get('summary/kit/:kitId')
  getKitHistorySummary(
    @Param('kitId') kitId: string,
    @Query('days') days: number = 30,
  ) {
    return this.inventoryHistoryService.getKitHistorySummary(kitId, days);
  }

  @Get('report/expiration')
  getExpirationReport(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.inventoryHistoryService.getExpirationReport(startDate, endDate);
  }
}
