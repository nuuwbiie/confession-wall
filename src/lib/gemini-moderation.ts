/**
 * Gemini AI moderation service for content filtering.
 * Analyzes text for profanity, hate speech, excessive negativity, and harmful content.
 * Uses Gemini 2.0 Flash for fast, cost-effective moderation.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface ModerationResult {
  is_flagged: boolean;
  reason: string | null;
  categories: string[];
  confidence: number;
}

/**
 * Moderates content using Gemini AI.
 * Returns the moderation result if successful.
 * Throws an error if the API call fails (block behavior).
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `Anda adalah sistem moderasi konten. Analisis teks berikut dan tentukan apakah perlu ditolak.

Periksa apakah teks mengandung:
1. **Kata kasar / profanity** — termasuk dalam Bahasa Indonesia dan Bahasa Inggris
2. **Ujaran kebencian / hate speech** — berdasarkan SARA, gender, agama, diskriminasi
3. **Sentimen negatif berlebihan / toxic** — ancaman, bullying, pelecehan
4. **Konten berbahaya** — spam, promosi ilegal, konten dewasa, doxing

Teks:
"""${content}"""

Berikan response dalam format JSON SAJA (tanpa markdown, tanpa teks lain):
{
  "is_flagged": true/false,
  "reason": "jelaskan alasan penolakan jika di-flag dalam Bahasa Indonesia, atau null jika aman",
  "categories": ["kata_kasar"] atau [] jika aman,
  "confidence": 0.0-1.0
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini API returned empty response");
  }

  // Parse JSON response — handle potential markdown code blocks
  let jsonStr = text.trim();
  // Remove markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const result: ModerationResult = JSON.parse(jsonStr);

    // Validate the result has the expected fields
    if (typeof result.is_flagged !== "boolean") {
      throw new Error("Invalid response format: is_flagged must be boolean");
    }

    return {
      is_flagged: result.is_flagged,
      reason: result.reason || null,
      categories: Array.isArray(result.categories) ? result.categories : [],
      confidence: typeof result.confidence === "number" ? result.confidence : 0,
    };
  } catch (parseError) {
    throw new Error(
      `Failed to parse Gemini response: ${parseError instanceof Error ? parseError.message : "Unknown error"}. Raw: ${text.slice(0, 200)}`
    );
  }
}