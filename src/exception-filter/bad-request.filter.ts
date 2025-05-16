import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Exception filter specifically for handling BadRequestExceptions.
 * This allows custom formatting of 400 Bad Request responses,
 * typically thrown during validation failures or invalid inputs.
 */
@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  /**
   * Handles BadRequestExceptions and structures the response.
   *
   * @param exception - The BadRequestException thrown by the app.
   * @param host - Provides access to the HTTP layer of the request pipeline.
   */
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Destructure the standard error response structure
    const { statusCode, message, error } = exceptionResponse as any;

    // Normalize the error key to a machine-readable format
    const customMessage = error.replace(/\s/g, '_').toLowerCase();

    // Send a structured and consistent error response to the client
    response.status(status).json({
      status: statusCode,
      message: customMessage,
      data: message,
    });
  }
}
