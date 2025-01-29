import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get('search')
  search(@Query('term') searchTerm: string) {
    return this.itemService.searchItems(searchTerm);
  }

  @Get('kit/:kitId')
  findByKitId(@Param('kitId') kitId: string) {
    return this.itemService.findByKitId(kitId);
  }

  @Get('expiring')
  findExpiringSoon(@Query('days') days: number = 30) {
    return this.itemService.findExpiringSoon(days);
  }

  @Get('low-stock')
  findLowStock() {
    return this.itemService.findLowStock();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(id, updateItemDto);
  }

  @Patch(':id/quantity')
  updateQuantity(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.itemService.updateQuantity(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(@Body() updates: { id: string; quantity: number }[]) {
    return this.itemService.bulkUpdateQuantities(updates);
  }

  @Post('template/:templateId')
  @HttpCode(HttpStatus.CREATED)
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body('kitId') kitId: string,
  ) {
    return this.itemService.createFromTemplate(templateId, kitId);
  }
}
