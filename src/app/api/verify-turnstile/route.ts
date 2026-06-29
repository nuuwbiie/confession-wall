import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile-verify";

/**
 * POST /api/verify-turnstile
 * Verifies a Cloudflare Turnstile token server-side.
 * Used by client-side forms (login/register) before calling Supabase auth.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    const result = await verifyTurnstileToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Verifikasi keamanan gagal" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/verify-turnstile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
