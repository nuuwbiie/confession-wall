/**
 * Username rules: lowercase only, alphanumeric + underscore, min 3 chars
 * Email mapping for Supabase Auth (internal only, users never see this)
 */

const EMAIL_DOMAIN = "email.com";

/**
 * Validate and normalize username:
 * - lowercase
 * - only allow a-z, 0-9, underscore
 * - min 3 chars, max 30 chars
 */
export function validateUsername(username: string): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  const normalized = username.toLowerCase().trim();

  if (normalized.length < 3) {
    return {
      valid: false,
      normalized,
      error: "Username minimal 3 karakter",
    };
  }

  if (normalized.length > 30) {
    return {
      valid: false,
      normalized,
      error: "Username maksimal 30 karakter",
    };
  }

  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "Hanya boleh huruf kecil, angka, dan underscore (_)",
    };
  }

  if (/^[0-9_]/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "Username tidak boleh diawali angka atau underscore",
    };
  }

  return { valid: true, normalized };
}

export function usernameToEmail(username: string): string {
  const clean = username.toLowerCase().replace(/\s+/g, "");
  return `${clean}@${EMAIL_DOMAIN}`;
}