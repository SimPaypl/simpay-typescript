/**
 * Converts a scalar the way PHP's implode() does. SimPay signs notifications
 * with implode('|', ...), so null becomes "", true becomes "1" and false "".
 */
export function phpScalarToString(value: unknown): string {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (value === true) {
    return "1";
  }

  return String(value);
}
