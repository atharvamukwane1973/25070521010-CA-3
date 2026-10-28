/**
 * Currency utility module
 * Enforces integer minor units (paise for INR) to prevent floating-point calculation errors.
 * 1 Rupee = 100 Paise.
 */

/**
 * Converts a decimal or string rupee amount into integer paise.
 * e.g., "1250.50" or 1250.5 -> 125050 paise
 */
export function toPaise(rupeesInput) {
  if (rupeesInput === null || rupeesInput === undefined || rupeesInput === '') {
    throw new Error('Amount is required');
  }

  const clean = String(rupeesInput).trim().replace(/,/g, '');
  const num = Number(clean);

  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid monetary amount');
  }

  if (num < 0) {
    throw new Error('Amount cannot be negative');
  }

  // Multiply by 100 and round to nearest integer to safely avoid float artifacts
  return Math.round(num * 100);
}

/**
 * Converts integer paise into rupees float (for display / JSON export)
 */
export function toRupees(paise) {
  const safePaise = Number(paise) || 0;
  return Number((safePaise / 100).toFixed(2));
}

/**
 * Formats integer paise into Indian numbering format (e.g., ₹1,23,456.00 or ₹50,000)
 */
export function formatINR(paise, includeDecimals = true) {
  const safePaise = Number(paise) || 0;
  const isNegative = safePaise < 0;
  const absPaise = Math.abs(safePaise);

  const rupees = Math.floor(absPaise / 100);
  const fraction = absPaise % 100;

  // Indian numbering pattern: last 3 digits, then groups of 2 digits
  const strRupees = String(rupees);
  let formatted = '';

  if (strRupees.length <= 3) {
    formatted = strRupees;
  } else {
    const last3 = strRupees.substring(strRupees.length - 3);
    const otherNumbers = strRupees.substring(0, strRupees.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${withCommas},${last3}`;
  }

  const sign = isNegative ? '-' : '';
  if (includeDecimals) {
    const decimalPart = String(fraction).padStart(2, '0');
    return `${sign}₹${formatted}.${decimalPart}`;
  }

  return `${sign}₹${formatted}`;
}
