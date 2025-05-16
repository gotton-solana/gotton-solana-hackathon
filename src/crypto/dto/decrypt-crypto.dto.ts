import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object (DTO) for decrypting encrypted data.
 * This class is used to validate and transform the input data
 * required for decryption operations.
 */
export class DecryptDto {
  @ApiProperty({ description: 'Encrypted data.' })
  @Type(() => String)
  @IsNotEmpty()
  encryptedData: string;
}
