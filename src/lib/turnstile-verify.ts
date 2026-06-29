/**
 * Server-side Cloudflare Turnstile token verification.
 * Call this from API routes or Server Actions.
 */

interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
}

/**
 * Verify a Turnstile token with Cloudflare's API.
 *
 * @param token - The token from the client-side Turnstile widget
 * @returns Result indicating whether the token is valid
 */
export async function verifyTurnstileToken(
  token: string | undefined | null
): Promise<TurnstileVerifyResult> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return { success: false, error: "Token Turnstile tidak valid" };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY not configured — skipping verification");
    return { success: true }; // Allow if not configured (dev mode)
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();

    if (data.success === true) {
      return { success: true };
    }

    return {
      success: false,
      error: "Verifikasi keamanan gagal. Silakan muat ulang halaman dan coba lagi.",
    };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return {
      success: false,
      error: "Gagal memverifikasi keamanan. Silakan coba lagi.",
    };
  }
}
