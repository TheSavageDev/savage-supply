import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import {
  IsOptional,
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCategory } from '../entities/item.entity';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsOptional()
  @IsUUID()
  kitId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumQuantity?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: Date;
}
