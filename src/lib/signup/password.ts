export function hasPasswordEdgeWhitespace(password: string): boolean {
  return password.length > 0 && password.trim() !== password;
}

export function getPasswordPolicyError(password: string): string | null {
  if (hasPasswordEdgeWhitespace(password)) {
    return "Password cannot start or end with a space.";
  }
  if (password.length > 0 && password.length < 6) {
    return "Must be at least 6 characters.";
  }
  return null;
}

export function isPasswordValid(password: string): boolean {
  return password.length >= 6 && !hasPasswordEdgeWhitespace(password);
}
