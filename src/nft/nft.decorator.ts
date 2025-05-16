import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

/**
 * Custom validator to check if a string is a valid Ethereum address.
 * Uses ethers.js utility function under the hood.
 *
 * @param validationOptions - Optional configuration for the validation message or conditions.
 */
export function IsAddress(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsAddress',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          return ethers.utils.isAddress(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid address`;
        },
      },
    });
  };
}

/**
 * Custom validator to check if a value is a valid positive integer BigNumber.
 * Uses bignumber.js for precision-safe handling of large values.
 *
 * @param validationOptions - Optional configuration for the validation message or conditions.
 */
export function IsBigNumber(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsBigNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          try {
            const bigNumber = new BigNumber(value, 10);
            return bigNumber && bigNumber.isInteger() && bigNumber.isPositive();
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid BigNumber`;
        },
      },
    });
  };
}
