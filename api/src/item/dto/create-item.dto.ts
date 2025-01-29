import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCategory } from '../entities/item.entity';

export class CreateItemDto {
  @IsNotEmpty()
  @IsUUID()
  kitId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minimumQuantity: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: Date;
}
