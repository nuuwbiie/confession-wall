import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitErrorResponse } from "@/lib/rate-limiter";

/**
 * POST /api/check-rate-limit
 * Check if the client IP is within rate limits for a given endpoint.
 * Used by client-side forms before making auth requests directly to Supabase.
 *
 * Body: { endpoint: "login" | "register" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint || !["login", "register", "create_confession", "create_comment", "like"].includes(endpoint)) {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const result = await checkRateLimit(ip, endpoint as any);

    if (!result.allowed) {
      return rateLimitErrorResponse(result.retryAfter);
    }

    return NextResponse.json({
      allowed: true,
      remaining: result.remaining,
    });
  } catch (err) {
    console.error("POST /api/check-rate-limit error:", err);
    return NextResponse.json({ allowed: true, remaining: 999 }, { status: 200 });
  }
}
