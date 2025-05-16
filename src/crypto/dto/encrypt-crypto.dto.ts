import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object (DTO) for encryption operations.
 * This class is used to encapsulate the data required for encryption.
 */
export class EncryptDto {
  @ApiProperty({ description: 'Data.' })
  @Type(() => String)
  @IsNotEmpty()
  data: string;
}
