import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ManageTokenDto {
  @IsNotEmpty()
  @IsString()
  fcmToken: string;

  @IsNotEmpty()
  @IsUUID()
  kitId: string;
}
