import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Intercepts and transforms all HTTP responses into a consistent format.
 * Standardizes successful responses and handles specific error object patterns.
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    let { statusCode } = res;
    let message = 'SUCCESS';

    return next.handle().pipe(
      map((data: any) => {
        const error = data?.error;

        // If the response contains an error object, override the status and message
        if (error) {
          statusCode = error.statusCode;
          message = error.message;
          res.status(statusCode);
          return { statusCode, message };
        }

        // Wrap all successful responses in a standard structure
        return {
          status_code: statusCode,
          message,
          data,
        };
      }),
    );
  }
}
