import { Controller, Post, Body, UsePipes, UseGuards } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { EncryptDto } from './dto/encrypt-crypto.dto';
import {
  ApiBadGatewayResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MainValidationPipe } from 'src/pipes/validation.pipe';
import { AppAuthGuard } from 'src/auth/guards/app-auth.guard';
import { DecryptDto } from './dto/decrypt-crypto.dto';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  /**
   * Encrypts the input data using the specified parameters in the EncryptDto.
   * Protected by AppAuthGuard and validated by MainValidationPipe.
   *
   * @param encryptDto - DTO containing plaintext and optional encryption settings.
   * @returns Encrypted result or error response.
   */
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @UsePipes(new MainValidationPipe())
  @UseGuards(AppAuthGuard)
  @ApiOkResponse({ description: 'Encryption successful.' })
  @ApiBadGatewayResponse({
    description: 'Bad gateway. Encryption failed due to service error.',
  })
  @Post('encrypt')
  encrypt(@Body() encryptDto: EncryptDto) {
    return this.cryptoService.encrypt(encryptDto);
  }

  /**
   * Decrypts the input data using the specified parameters in the DecryptDto.
   * Protected by AppAuthGuard and validated by MainValidationPipe.
   *
   * @param decryptDto - DTO containing encrypted data and decryption settings.
   * @returns Decrypted plaintext or error response.
   */
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @UsePipes(new MainValidationPipe())
  @UseGuards(AppAuthGuard)
  @ApiOkResponse({ description: 'Decryption successful.' })
  @ApiBadGatewayResponse({
    description: 'Bad gateway. Decryption failed due to service error.',
  })
  @Post('decrypt')
  decrypt(@Body() decryptDto: DecryptDto) {
    return this.cryptoService.decrypt(decryptDto);
  }
}
