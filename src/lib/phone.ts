import type { Country } from "./countries";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function toNationalDigits(value: string): string {
  return digitsOnly(value).replace(/^0+/, "");
}

export function toE164(country: Country, national: string): string {
  return `+${country.dial}${toNationalDigits(national)}`;
}

function digitRange(country: Country): [number, number] {
  return Array.isArray(country.digits)
    ? country.digits
    : [country.digits, country.digits];
}

export function formatNational(country: Country, value: string): string {
  const digits = digitsOnly(value);
  if (!digits) return "";

  const [, max] = digitRange(country);
  const groups = max >= 11 ? [3, 4, 4] : max >= 10 ? [4, 3, 3] : [3, 3, 3];

  const parts: string[] = [];
  let offset = 0;
  for (const size of groups) {
    if (offset >= digits.length) break;
    parts.push(digits.slice(offset, offset + size));
    offset += size;
  }
  if (offset < digits.length) parts.push(digits.slice(offset));

  return parts.join(" ");
}

export function validatePhone(country: Country, value: string): string | null {
  const digits = toNationalDigits(value);
  if (!digits) return "Enter your phone number.";

  const [min, max] = digitRange(country);
  if (digits.length < min) {
    return min === max
      ? `A ${country.name} number has ${min} digits.`
      : `A ${country.name} number has ${min}–${max} digits.`;
  }
  if (digits.length > max) {
    return min === max
      ? `That's too long — a ${country.name} number has ${min} digits.`
      : `That's too long — a ${country.name} number has ${min}–${max} digits.`;
  }

  // E.164 caps the whole number, dial code included, at 15 digits.
  if (country.dial.length + digits.length > 15)
    return "That number is too long.";

  return null;
}

export const NAME_MIN = 2;
export const NAME_MAX = 40;

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Enter the name you want to appear under.";
  if (name.length < NAME_MIN) return "That's too short to recognise you by.";
  if (name.length > NAME_MAX) return `Keep it under ${NAME_MAX} characters.`;
  return null;
}
