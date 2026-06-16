"use client";

import type { ConfessionFont } from "@/lib/constants";
import { FONT_OPTIONS } from "@/lib/constants";

interface ConfessionPreviewProps {
  content: string;
  font: ConfessionFont;
  isPublic: boolean;
  allowReplies: boolean;
}

export default function ConfessionPreview({
  content,
  font,
  isPublic,
  allowReplies,
}: ConfessionPreviewProps) {
  const fontOption = FONT_OPTIONS.find((f) => f.id === font);
  const fontFamily = fontOption?.fontFamily || "'Inter', sans-serif";

  if (!content.trim()) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">
          visibility
        </span>
        <p className="text-on-surface-variant/60 font-label-sm text-label-sm">
          Mulai menulis untuk melihat pratinjau
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 soft-shadow border border-outline-variant/10">
      {/* Preview label */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-outline-variant/10">
        <span className="material-symbols-outlined text-primary text-sm">
          preview
        </span>
        <span className="font-label-sm text-label-sm text-primary font-medium">
          Pratinjau
        </span>
      </div>

      {/* Confession card preview */}
      <article className="rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-tertiary-container/30 text-on-tertiary-container px-3 py-1 rounded-full font-label-sm text-label-sm">
              Anonim
            </span>
            <span className="text-on-surface-variant/60 font-label-sm text-label-sm">
              Baru saja
            </span>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-lg">
            more_horiz
          </span>
        </div>

        <div
          className="text-on-surface mb-6 leading-relaxed whitespace-pre-line"
          style={{ fontFamily, fontSize: font === "handwriting" ? "24px" : font === "mono" ? "18px" : "20px", lineHeight: font === "handwriting" ? "32px" : font === "mono" ? "28px" : "30px" }}
        >
          {content || "Tulisanmu akan muncul di sini..."}
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-on-surface-variant/50" disabled>
            <span className="material-symbols-outlined text-lg">favorite</span>
            <span className="font-label-sm text-label-sm">0</span>
          </button>
          {allowReplies && (
            <button className="flex items-center gap-2 text-on-surface-variant/50" disabled>
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              <span className="font-label-sm text-label-sm">0</span>
            </button>
          )}
          <div className="ml-auto">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isPublic ? "bg-tertiary-container/20 text-tertiary" : "bg-primary-container/20 text-primary"
            }`}>
              {isPublic ? "Publik" : "Privat"}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}