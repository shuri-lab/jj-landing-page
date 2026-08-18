const DOMAIN_FIXES: Record<string, string> = {
  "gmail.co": "gmail.com",
  "gmail.om": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "yahoo.co": "yahoo.com",
  "hotmail.co": "hotmail.com",
  "outlook.co": "outlook.com",
};

export function suggestEmail(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at >= trimmed.length - 1) return null;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1).replace(/\s+/g, "");
  if (!local || !domain.includes(".")) return null;
  const fixed = DOMAIN_FIXES[domain];
  return fixed ? `${local}@${fixed}` : null;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
