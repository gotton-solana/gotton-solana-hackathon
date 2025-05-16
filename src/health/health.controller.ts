import { Controller, Get } from '@nestjs/common';

/**
 * HealthController provides a simple health check endpoint
 * to verify that the application is up and running.
 */
@Controller('health')
export class HealthController {
  /**
   * GET /health
   * Returns `true` to indicate the service is healthy.
   * This can be extended to include DB, cache, or other dependency checks.
   */
  @Get()
  check() {
    return true;
  }
}
