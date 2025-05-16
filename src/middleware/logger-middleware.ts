import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * LoggerMiddleware is used to log all incoming HTTP requests.
 * It captures the HTTP method, original URL, and optionally the request body.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  /**
   * Logs request details for debugging and monitoring purposes.
   *
   * @param req - The incoming HTTP request
   * @param res - The outgoing HTTP response
   * @param next - The next middleware or request handler
   */
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const logMessage = `[${method}] ${originalUrl}`;

    this.logger.log(logMessage);

    // Log the request body if it's not empty
    if (Object.keys(body).length > 0) {
      this.logger.log(`Body: ${JSON.stringify(body)}`);
    }

    next(); // Pass control to the next middleware or handler
  }
}
