import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { NftModule } from './nft/nft.module';
import { BullModule } from '@nestjs/bull';
import { CryptoModule } from '../crypto.module';
import { HealthModule } from './health/health.module';
import { LoggerMiddleware } from './middleware/logger-middleware';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    /**
     * Asynchronously registers Bull (queueing system) with Redis configuration.
     * Uses environment variables via ConfigService.
     */
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    /**
     * Loads environment variables and makes them accessible throughout the application.
     */
    ConfigModule.forRoot(),

    /**
     * Enables support for scheduled tasks (e.g. cron jobs).
     */
    ScheduleModule.forRoot(),

    /**
     * Enables making HTTP requests using Axios.
     */
    HttpModule,

    // Application feature modules
    NftModule, // Handles NFT-related functionality
    CryptoModule, // Handles encryption/decryption services
    HealthModule, // Health check and status endpoints
    TasksModule, // Scheduled or background task handlers
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  /**
   * Applies middleware globally to all routes.
   * LoggerMiddleware is used to log request details.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
