/**
 * Formats a number or string amount as a currency string with commas and decimal points.
 * @param amount - The amount to format
 * @param symbol - The currency symbol (e.g., ₦, $, €)
 * @returns Formatted currency string
 */
export const formatPrice = (amount: number | string, symbol: string = '₦'): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return `${symbol}0.00`;

  return `${symbol}${numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
