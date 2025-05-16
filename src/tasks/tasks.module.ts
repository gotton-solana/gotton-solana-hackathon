import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAME } from 'src/utils/constants';

/**
 * TasksModule is responsible for background tasks related to NFT retrieval.
 * It registers a Bull queue for task processing and exposes the TasksService for use in other modules.
 */
@Module({
  imports: [
    // Registers the GET_NFT queue for processing background jobs asynchronously
    BullModule.registerQueueAsync({
      name: QUEUE_NAME.GET_NFT,
    }),
  ],
  providers: [TasksService, ConfigService],
  exports: [TasksService],
})
export class TasksModule {}
