"use client";

import { useState, useEffect } from "react";

import Icon from "./Icon";

export interface WallCardData {
  id: string;
  content: string;
  font: string;
  card_theme?: string;
  is_public: boolean;
  allow_replies: boolean;
  status: string;
  likes: number;
  comments?: number;
  created_at: string;
  author_username?: string | null;
  user_id?: string | null;
}

const FONT_CLASS_MAP: Record<string, string> = {
  sans: "font-confession-sans text-confession-sans",
  serif: "font-confession-serif text-confession-serif",
  mono: "font-confession-mono text-confession-mono",
  handwriting: "font-confession-handwriting text-confession-handwriting",
};

const STATUS_BADGE_MAP: Record<string, { bg: string; text: string }> = {
  published: { bg: "bg-primary-container/30", text: "text-on-primary-container" },
  pending: { bg: "bg-secondary-container/30", text: "text-on-secondary-container" },
  private: { bg: "bg-tertiary-container/30", text: "text-on-tertiary-container" },
  rejected: { bg: "bg-error-container/30", text: "text-on-error-container" },
};

const THEME_BG_MAP: Record<string, string> = {
  default: "bg-surface-container-lowest",
  pink:    "bg-[#ffe4ec]",
  blue:    "bg-[#e3f2fd]",
  green:   "bg-[#e8f5e9]",
  yellow:  "bg-[#fffde7]",
  orange:  "bg-[#fff3e0]",
  purple:  "bg-[#f3e5f5]",
};

const THEME_BORDER_MAP: Record<string, string> = {
  default: "border-outline-variant/10",
  pink:    "border-[#f06292]/40",
  blue:    "border-[#42a5f5]/40",
  green:   "border-[#66bb6a]/40",
  yellow:  "border-[#fdd835]/40",
  orange:  "border-[#ff9800]/40",
  purple:  "border-[#ab47bc]/40",
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString("id-ID");
}

export default function WallCard({
  data,
  showStatus = false,
  onCommentClick,
  user,
  onRequireLogin,
}: {
  data: WallCardData;
  showStatus?: boolean;
  onCommentClick?: () => void;
  user?: { id: string } | null;
  onRequireLogin?: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(data.likes || 0);

  // Fetch initial liked state from server on mount (count already comes from props via API)
  useEffect(() => {
    const fetchLikeState = async () => {
      try {
        const res = await fetch(`/api/confessions/${data.id}/like`);
        const result = await res.json();
        if (result.liked !== undefined) {
          setLiked(result.liked);
          // Only override count if the server returns a different value (e.g. race condition)
          if (result.likes !== undefined && result.likes !== likeCount) {
            setLikeCount(result.likes);
          }
        }
      } catch {
        // Use defaults from props
      }
    };
    fetchLikeState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  const handleLike = async () => {
    // Require login for liking
    if (!user) {
      onRequireLogin?.();
      return;
    }

    const newLiked = !liked;
    const action = newLiked ? "like" : "unlike";

    // Optimistic update
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));

    try {
      const res = await fetch(`/api/confessions/${data.id}/like?action=${action}`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.likes !== undefined) {
        setLikeCount(result.likes);
        setLiked(result.liked);
      }
    } catch {
      // Revert on error
      setLiked(!newLiked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  const fontClass =
    FONT_CLASS_MAP[data.font] || FONT_CLASS_MAP.sans;
  const statusBadge = STATUS_BADGE_MAP[data.status];
  const theme = data.card_theme || "default";
  const themeBg = THEME_BG_MAP[theme] || THEME_BG_MAP.default;
  const themeBorder = THEME_BORDER_MAP[theme] || THEME_BORDER_MAP.default;

  return (
    <article className={`masonry-item ${themeBg} rounded-2xl p-5 md:p-8 soft-shadow soft-shadow-hover transition-all duration-300 ${themeBorder} group border-2`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${
              statusBadge?.bg || "bg-tertiary-container/30"
            } ${statusBadge?.text || "text-on-tertiary-container"}`}
          >
            {showStatus
              ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
              : data.author_username && !showStatus
                ? data.author_username
                : "Anonim"}
          </span>
          <span className="text-on-surface-variant/60 font-label-sm text-label-sm">
            {getTimeAgo(data.created_at)}
          </span>
        </div>
        <Icon name="more_horiz" size={24} className="text-outline-variant group-hover:text-tertiary transition-colors" />
      </div>

      {/* Content with font styling */}
      <div
        className={`${fontClass} text-on-surface mb-8 leading-relaxed whitespace-pre-line`}
      >
        {data.content}
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            liked ? "text-error" : "text-on-surface-variant hover:text-error"
          }`}
        >
            <Icon
            name={liked ? "favorite" : "favorite_border"}
            size={24}
            style={{ color: liked ? "var(--color-error)" : undefined }}
          />
          <span className="font-label-sm text-label-sm">{likeCount}</span>
        </button>

        {data.allow_replies !== false && (
          <button
            onClick={onCommentClick}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="chat_bubble" size={24} />
            <span className="font-label-sm text-label-sm">
              {data.comments || 0}
            </span>
          </button>
        )}
      </div>
    </article>
  );
}