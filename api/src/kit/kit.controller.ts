import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KitService } from './kit.service';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';

@Controller('kit')
export class KitController {
  constructor(private readonly kitService: KitService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createKitDto: CreateKitDto) {
    return this.kitService.create(createKitDto);
  }

  @Get()
  findAll() {
    return this.kitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kitService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKitDto: UpdateKitDto) {
    return this.kitService.update(id, updateKitDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.kitService.remove(id);
  }

  @Delete(':id/items/history')
  async clearItemHistory(@Param('id') id: string) {
    return this.kitService.clearItemHistory(id);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.kitService.getKitStatus(id);
  }

  @Post(':id/duplicate')
  async duplicateKit(@Param('id') id: string, @Body('name') newName: string) {
    return this.kitService.duplicateKit(id, newName);
  }

  @Post('template')
  async createFromTemplate(
    @Body('templateId') templateId: string,
    @Body('name') name: string,
    @Body('location') location: string,
    @Body('ownerId') ownerId: string,
  ) {
    return this.kitService.createFromTemplate(
      templateId,
      name,
      location,
      ownerId,
    );
  }

  @Post('templates')
  async saveAsTemplate(
    @Body('kitId') kitId: string,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    return this.kitService.saveAsTemplate(kitId, name, description);
  }
}
