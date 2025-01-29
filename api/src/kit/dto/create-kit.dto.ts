import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKitDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
