/**
 * Formats a number (BigNumber or numeric value) to a string with a specified number of decimal places.
 * The number is rounded down if necessary.
 *
 * @param number - The value to format, can be a BigNumber or any numeric value.
 * @param decimals - The number of decimal places to round to.
 * @returns The formatted number as a string.
 */
export function formatNumber(number: BigNumber.Value, decimals: number) {
  return new BigNumber(number)
    .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
    .toString();
}

/**
 * Formats a number (BigNumber or numeric value) to a number with a specified number of decimal places.
 * The number is rounded down if necessary.
 *
 * @param number - The value to format, can be a BigNumber or any numeric value.
 * @param decimals - The number of decimal places to round to.
 * @returns The formatted number as a numeric value.
 */
export function formatToNumber(number: BigNumber.Value, decimals: number) {
  return new BigNumber(number)
    .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
    .toNumber();
}
