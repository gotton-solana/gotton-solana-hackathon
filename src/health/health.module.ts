import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';

/**
 * HealthModule handles application health monitoring.
 * It currently provides a basic health check endpoint.
 * Can be extended to include detailed checks (e.g., DB, Redis, external services).
 */
@Module({
  imports: [ConfigModule], // Enables access to environment variables if needed in the future
  controllers: [HealthController], // Registers the controller exposing the /health endpoint
})
export class HealthModule {}
