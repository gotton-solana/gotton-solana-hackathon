import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { NftProcessor } from './nft.processor';
import { QUEUE_NAME } from '../utils/constants';

/**
 * NftModule manages NFT-related operations, including minting and reward processing.
 * Integrates with Bull for background job handling and queue management.
 */
@Module({
  imports: [
    ConfigModule, // Loads configuration such as environment variables
    BullModule.registerQueueAsync({
      name: QUEUE_NAME.NFT_REWARD, // Registers the NFT reward processing queue
    }),
  ],
  controllers: [NftController], // Handles incoming NFT-related HTTP requests
  providers: [NftService, NftProcessor], // Contains business logic and background job processor
})
export class NftModule {}
