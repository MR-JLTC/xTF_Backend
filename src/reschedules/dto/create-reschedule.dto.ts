import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

export class CreateRescheduleDto {
  @IsNumber()
  @IsNotEmpty()
  booking_id: number;

  @IsString()
  @IsNotEmpty()
  proposedDate: string; // ISO date string (yyyy-mm-dd)

  @IsString()
  @IsNotEmpty()
  proposedTime: string; // e.g. '14:00'

  @IsNumber()
  @IsOptional()
  proposedDuration?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
