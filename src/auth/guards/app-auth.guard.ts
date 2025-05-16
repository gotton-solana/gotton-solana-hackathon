import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Guard to protect routes using an API key-based authentication mechanism.
 * Compares the incoming `x-api-key` header with the expected value from environment variables.
 */
@Injectable()
export class AppAuthGuard implements CanActivate {
  /**
   * Determines whether the current request is authorized based on the x-api-key header.
   *
   * @param context - Provides details about the current execution context (e.g., request).
   * @returns `true` if the API key is valid; otherwise, `false`.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const appId = process.env.X_API_KEY;
    const request = context.switchToHttp().getRequest();

    // Check if the provided API key matches the expected value
    return request.headers['x-api-key'] === appId;
  }
}
