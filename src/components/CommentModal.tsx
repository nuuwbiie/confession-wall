"use client";

import { useState, useEffect, useRef } from "react";
import type { WallCardData } from "./WallCard";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

interface CommentModalProps {
  confession: WallCardData;
  isOpen: boolean;
  onClose: () => void;
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString("id-ID");
}

export default function CommentModal({ confession, isOpen, onClose }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync state when confession or open state changes during render
  const [prevConfessionId, setPrevConfessionId] = useState(confession.id);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (confession.id !== prevConfessionId || isOpen !== prevIsOpen) {
    setPrevConfessionId(confession.id);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setComments([]);
      setLoading(true);
      setError(null);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    fetch(`/api/confessions/${confession.id}/comments`)
      .then((res) => res.json())
      .then((result) => {
        if (!ignore) {
          setComments(result.data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Gagal memuat komentar");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, confession.id]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/confessions/${confession.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Gagal mengirim komentar");
      } else {
        setComments((prev) => [...prev, result.data]);
        setNewComment("");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col soft-shadow border border-outline-variant/10 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Komentar
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Original confession card */}
          <div className="bg-surface-container-low rounded-2xl p-6 mb-6 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-tertiary-container/30 text-on-tertiary-container">
                Anonim
              </span>
              <span className="text-[11px] text-on-surface-variant/60">
                {getTimeAgo(confession.created_at)}
              </span>
            </div>
            <p className="text-on-surface font-body-md whitespace-pre-line">
              {confession.content}
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 text-on-error-container rounded-xl text-sm">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && comments.length === 0 && !error && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-outline-variant mb-2">
                chat_bubble_outline
              </span>
              <p className="text-on-surface-variant/60 font-label-sm text-label-sm">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            </div>
          )}

          {/* Comments list */}
          {!loading && comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-surface-container-low rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="text-[10px] text-primary font-bold">
                    {comment.user_id ? "U" : "A"}
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant/60">
                  {comment.user_id ? "User" : "Anonim"} &middot; {getTimeAgo(comment.created_at)}
                </span>
              </div>
              <p className="text-on-surface font-body-md text-sm whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Comment input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-outline-variant/10 px-6 py-4 flex gap-3"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar..."
            maxLength={500}
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-sm">send</span>
            )}
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}