"use client";

import Icon from "./Icon";
import type { ConfessionFont, CardTheme } from "@/lib/constants";
import { FONT_OPTIONS, CARD_THEME_OPTIONS } from "@/lib/constants";

interface ConfessionPreviewProps {
  content: string;
  font: ConfessionFont;
  cardTheme?: CardTheme;
  isPublic: boolean;
  allowReplies: boolean;
}

export default function ConfessionPreview({
  content,
  font,
  cardTheme = "default",
  isPublic,
  allowReplies,
}: ConfessionPreviewProps) {
  const fontOption = FONT_OPTIONS.find((f) => f.id === font);
  const fontFamily = fontOption?.fontFamily || "'Inter', sans-serif";

  const themeOption = CARD_THEME_OPTIONS.find((t) => t.id === cardTheme);
  const previewBg = themeOption?.bg || "#ffffff";
  const previewBorder = themeOption?.border || "#d0d0d0";

  if (!content.trim()) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-8 text-center">
        <Icon name="visibility" size={36} className="text-outline-variant mb-3" />
        <p className="text-on-surface-variant/60 font-label-sm text-label-sm">
          Mulai menulis untuk melihat pratinjau
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 md:p-8 soft-shadow border-2" style={{ backgroundColor: previewBg, borderColor: previewBorder }}>
      {/* Preview label */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-outline-variant/10">
        <Icon name="preview" size={14} className="text-primary" />
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
          <Icon name="more_horiz" size={20} className="text-outline-variant" />
        </div>

        <div
          className="text-on-surface mb-6 leading-relaxed whitespace-pre-line"
          style={{ fontFamily, fontSize: font === "handwriting" ? "24px" : font === "mono" ? "18px" : "20px", lineHeight: font === "handwriting" ? "32px" : font === "mono" ? "28px" : "30px" }}
        >
          {content || "Tulisanmu akan muncul di sini..."}
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-on-surface-variant/50" disabled>
            <Icon name="favorite" size={20} className="text-on-surface-variant/50" />
            <span className="font-label-sm text-label-sm">0</span>
          </button>
          {allowReplies && (
            <button className="flex items-center gap-2 text-on-surface-variant/50" disabled>
              <Icon name="chat_bubble" size={20} className="text-on-surface-variant/50" />
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