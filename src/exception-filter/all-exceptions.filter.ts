import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter to handle all thrown HttpExceptions.
 * Formats the error response in a consistent structure for the client.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Handles caught HttpExceptions and formats the response.
   *
   * @param exception - The thrown HttpException.
   * @param host - Provides details about the current request pipeline.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;

    // Convert the exception message to a lowercase, underscore-separated string
    const customMessage = message.replace(/\s/g, '_').toLowerCase();

    const exceptionResponse = exception.getResponse();

    // Return a structured JSON response
    response.status(status).json({
      status: status,
      message: customMessage,
      data: exceptionResponse['message'],
    });
  }
}
