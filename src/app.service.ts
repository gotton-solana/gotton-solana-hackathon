import { Injectable } from '@nestjs/common';

/**
 * AppService provides basic application-level functionality.
 * Currently contains a simple health check or test method.
 */
@Injectable()
export class AppService {
  /**
   * Returns a simple greeting message.
   * Can be used to verify the application is running.
   *
   * @returns A static "Hello World!" string.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
