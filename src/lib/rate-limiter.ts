import { createClient } from "@supabase/supabase-js";

// Rate limit configuration per endpoint
export const RATE_LIMITS = {
  login: { max: 5, windowSeconds: 60 },           // 5 login attempts per minute
  register: { max: 3, windowSeconds: 60 },         // 3 registration attempts per minute
  create_confession: { max: 2, windowSeconds: 60 }, // 2 confessions per minute
  create_comment: { max: 5, windowSeconds: 60 },  // 5 comments per minute
  like: { max: 15, windowSeconds: 60 },            // 15 likes per minute
} as const;

export type RateLimitEndpoint = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds until the user can retry
  remaining: number;   // remaining requests in the current window
}

/**
 * Get the Supabase admin client for rate limit operations.
 */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Extract client IP from the request object.
 * Handles various proxy headers for Vercel/Cloudflare.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be "clientip, proxy1, proxy2" — take the first
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  return "127.0.0.1";
}

/**
 * Check if a request is within the rate limit for a given endpoint.
 * Uses a fixed-window algorithm stored in Supabase.
 *
 * @param ip - The client IP address
 * @param endpoint - The endpoint identifier (e.g. 'login', 'create_confession')
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  ip: string,
  endpoint: RateLimitEndpoint
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    // Unknown endpoint — allow by default
    return { allowed: true, remaining: Infinity };
  }

  const supabase = getAdminClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

  try {
    // Find existing rate limit record for this IP + endpoint in the current window
    const { data: existing, error: selectError } = await supabase
      .from("rate_limits")
      .select("id, request_count, window_start")
      .eq("ip_address", ip)
      .eq("endpoint", endpoint)
      .gte("window_start", windowStart.toISOString())
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error("Rate limit check error:", selectError);
      // On error, allow the request (fail open)
      return { allowed: true, remaining: config.max };
    }

    if (!existing) {
      // No record yet — create one with count = 1
      const { error: insertError } = await supabase.from("rate_limits").insert({
        ip_address: ip,
        endpoint,
        window_start: now.toISOString(),
        request_count: 1,
      });

      if (insertError) {
        console.error("Rate limit insert error:", insertError);
      }

      return { allowed: true, remaining: config.max - 1 };
    }

    // Record exists — check if we've exceeded the limit
    if (existing.request_count >= config.max) {
      // Calculate when the window will reset
      const windowEnd = new Date(
        new Date(existing.window_start).getTime() + config.windowSeconds * 1000
      );
      const retryAfter = Math.ceil(
        (windowEnd.getTime() - now.getTime()) / 1000
      );

      return {
        allowed: false,
        retryAfter: Math.max(1, retryAfter),
        remaining: 0,
      };
    }

    // Within limit — increment the counter
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({
        request_count: existing.request_count + 1,
        updated_at: now.toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Rate limit update error:", updateError);
    }

    return {
      allowed: true,
      remaining: config.max - existing.request_count - 1,
    };
  } catch (err) {
    console.error("Rate limit exception:", err);
    // Fail open on unexpected errors
    return { allowed: true, remaining: config.max };
  }
}

/**
 * Create a standard rate limit error response.
 */
export function rateLimitErrorResponse(retryAfter?: number): Response {
  const headers = new Headers({
    "Retry-After": String(retryAfter ?? 60),
    "Content-Type": "application/json",
  });

  return new Response(
    JSON.stringify({
      error: "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.",
      retryAfter: retryAfter ?? 60,
    }),
    {
      status: 429,
      headers,
    }
  );
}
