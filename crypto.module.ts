import { Module } from '@nestjs/common';
import { CryptoService } from './src/crypto/crypto.service';
import { CryptoController } from './src/crypto/crypto.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CryptoController],
  providers: [CryptoService],
})
export class CryptoModule {}
