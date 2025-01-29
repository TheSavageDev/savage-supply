import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  lowStockEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  expirationEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expirationWarningDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  lowStockThreshold?: number;
}
