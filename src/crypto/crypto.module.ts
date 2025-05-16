import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { ConfigModule } from '@nestjs/config';

/**
 * CryptoModule is responsible for handling all encryption and decryption operations.
 * It wires together the CryptoService and CryptoController, and loads configuration via ConfigModule.
 */
@Module({
  imports: [ConfigModule],
  controllers: [CryptoController],
  providers: [CryptoService],
})
export class CryptoModule {}
