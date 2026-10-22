/** US ZIP Code: 5 digits, or ZIP+4 (9 digits / `#####-####`). */

export function usZipDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 9)
}

export function isValidUsZip(value: string): boolean {
  const digits = usZipDigits(value)
  return digits.length === 5 || digits.length === 9
}

/** Formats as `12345` or `12345-6789` while typing. */
export function formatUsZipInput(value: string): string {
  const digits = usZipDigits(value)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}
