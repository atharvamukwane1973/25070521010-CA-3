/**
 * Currency utilities for Vaultly Client
 * Uses Indian numbering formatting with integer minor units (paise).
 */

export function toPaise(rupees) {
  if (rupees === null || rupees === undefined || rupees === '') return 0;
  const clean = String(rupees).trim().replace(/,/g, '');
  const val = parseFloat(clean);
  if (isNaN(val)) return 0;
  return Math.round(val * 100);
}

export function toRupees(paise) {
  const safe = Number(paise) || 0;
  return Number((safe / 100).toFixed(2));
}

export function formatINR(paise, includeDecimals = true) {
  const safePaise = Number(paise) || 0;
  const isNegative = safePaise < 0;
  const absPaise = Math.abs(safePaise);

  const rupees = Math.floor(absPaise / 100);
  const fraction = absPaise % 100;

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
