import { PartialType } from '@nestjs/mapped-types';
import { CreateKitDto } from './create-kit.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateKitDto extends PartialType(CreateKitDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
