import {
  BadRequestException,
  Optional,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { snakeCase } from 'lodash';

/**
 * MainValidationPipe extends NestJS's built-in ValidationPipe to provide:
 * - Auto-transformation of payloads
 * - Whitelisting of properties
 * - Custom error formatting for validation failures
 */
export class MainValidationPipe extends ValidationPipe {
  constructor(@Optional() options: ValidationPipeOptions = {}) {
    super({
      whitelist: true, // Removes non-whitelisted properties
      transformOptions: { enableImplicitConversion: true }, // Enables automatic type conversion
      ...options,
    });
  }

  /**
   * Custom exception factory that transforms validation errors into a consistent, readable format.
   * Each error includes: field name, error code (snake_case), and message.
   */
  exceptionFactory: any = (errors: ValidationError[]) => {
    const transformedErrors = errors
      .map((error) => this.mapChildren(error)) // Recursively flatten nested errors
      .reduce(
        (previousErrors, currentError) => [...previousErrors, ...currentError],
        [],
      )
      .filter((error) => !!Object.keys(error.constraints).length) // Keep only errors with constraints
      .map((error) => {
        const [key, message] = Object.entries(error.constraints)[0];
        const field = error.property;
        const code = snakeCase(key).toLowerCase(); // Convert constraint key to snake_case

        return { field, code, message };
      });

    throw new BadRequestException(transformedErrors);
  };

  /**
   * Recursively traverses child validation errors to flatten the error structure.
   */
  private mapChildren(error: ValidationError): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error];
    }

    const validationErrors = [];

    for (const item of error.children) {
      if (item.children && item.children.length) {
        validationErrors.push(...this.mapChildren(item));
      }

      validationErrors.push(MainValidationPipe.prependConstraints(item));
    }

    return validationErrors;
  }

  /**
   * Ensures that constraints are properly assigned to the error object.
   */
  private static prependConstraints(error: ValidationError): ValidationError {
    const constraints = {};
    for (const key in error.constraints) {
      constraints[key] = error.constraints[key];
    }
    return { ...error, constraints };
  }
}
