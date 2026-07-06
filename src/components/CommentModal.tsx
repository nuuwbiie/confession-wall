"use client";

import { useState, useEffect, useRef } from "react";
import type { WallCardData } from "./WallCard";
import LoginModal from "./LoginModal";
import Toast from "./Toast";
import Icon from "./Icon";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

interface HrReply {
  id: string;
  content: string;
  admin_id: string | null;
  created_at: string;
}

interface CommentModalProps {
  confession: WallCardData;
  isOpen: boolean;
  onClose: () => void;
  user: { id: string } | null;
  onRequireLogin: () => void;
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

export default function CommentModal({ confession, isOpen, onClose, user, onRequireLogin }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // HR reply
  const [hrReplies, setHrReplies] = useState<HrReply[]>([]);
  const [hrLoading, setHrLoading] = useState(false);

  // Deleting comment loading state
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastVisible, setToastVisible] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Lock body scroll for mobile bottom sheet
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const contentEl = contentRef.current;
    if (!contentEl) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (contentEl.scrollTop > 0 && contentEl.scrollTop < contentEl.scrollHeight - contentEl.clientHeight) {
        return;
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => document.removeEventListener("touchmove", handleTouchMove);
  }, [isOpen, isMobile]);

  // Check admin status
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    fetch("/api/auth/check-admin")
      .then((res) => res.json())
      .then((data: { isAdmin: boolean }) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [user]);

  // Fetch comments
  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;

    const fetchData = async () => {
      // Fetch comments
      try {
        const res = await fetch(`/api/confessions/${confession.id}/comments`);
        const result = await res.json();
        if (!ignore) {
          setComments(result.data || []);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError("Gagal memuat komentar");
          setLoading(false);
        }
      }

      // Fetch HR replies (only if logged in - owner or admin)
      if (user) {
        setHrLoading(true);
        try {
          const res = await fetch(`/api/confessions/${confession.id}/hr-reply`);
          const result = await res.json();
          if (!ignore && result.data) {
            setHrReplies(result.data);
          }
        } catch {
          // Ignore
        } finally {
          if (!ignore) setHrLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [isOpen, confession.id, user]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      onRequireLogin();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/confessions/${confession.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        if (result.flagged) {
          // Moderation rejection → toast error
          setToastMessage(result.error || "Komentar ditolak.");
          setToastType("error");
          setToastVisible(true);
        } else {
          setError(result.error || "Gagal mengirim komentar");
        }
      } else {
        setComments((prev) => [...prev, result.data]);
        setNewComment("");
        // Success → toast
        setToastMessage("Komentar berhasil dikirim!");
        setToastType("success");
        setToastVisible(true);
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;

    setDeletingCommentId(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      // Ignore
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (!isOpen) return null;

  // Mobile bottom sheet version
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Bottom sheet */}
        <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl flex flex-col animate-slideUp">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-outline-variant/50" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Komentar
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container transition-colors"
            >
              <Icon name="close" size={24} className="text-on-surface-variant" />
            </button>
          </div>

          {/* Fixed height content area: h-[65vh] */}
          <div className="flex flex-col" style={{ height: "65vh" }}>
            {/* Scrollable comments */}
            <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Original confession card */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
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

              {/* HR Reply section (only for confession owner or admin) */}
              {user && hrReplies.length > 0 && (
                <div className="bg-primary-container/10 rounded-2xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="support_agent" size={14} className="text-primary shrink-0" />
                    <span className="text-xs font-bold text-primary">HR</span>
                  </div>
                  {hrReplies.map((reply) => (
                    <div key={reply.id} className="mb-2 last:mb-0">
                      <p className="text-on-surface font-body-md text-sm whitespace-pre-line">
                        {reply.content}
                      </p>
                      <span className="text-[10px] text-on-surface-variant/40 mt-1 block">
                        {getTimeAgo(reply.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="flex items-center gap-2 p-3 bg-error-container/30 text-on-error-container rounded-xl text-sm">
                  <Icon name="error" size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && comments.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="chat_bubble" size={24} className="text-outline-variant mb-2" />
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                        <span className="text-[10px] text-primary font-bold">
                          {comment.user_id ? "U" : "A"}
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant/60">
                        {comment.user_id ? "User" : "Anonim"} &middot; {getTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    {/* Admin delete button */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="p-1 rounded-full text-error hover:bg-error-container/20 transition-colors disabled:opacity-30"
                        title="Hapus komentar"
                      >
                        {deletingCommentId === comment.id ? (
                          <span className="w-3 h-3 border-2 border-error/30 border-t-error rounded-full animate-spin block" />
                        ) : (
                          <Icon name="delete" size={14} className="shrink-0" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-on-surface font-body-md text-sm whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Comment input - only show if logged in */}
            {user ? (
              <form
                onSubmit={handleSubmit}
                className="border-t border-outline-variant/10 px-5 py-3 space-y-2"
              >
                <div className="flex gap-2">
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
                    className="bg-primary text-on-primary px-4 py-2.5 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Icon name="send" size={14} className="shrink-0" />
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-outline-variant/10 px-5 py-3">
                <button
                  onClick={onRequireLogin}
                  className="w-full py-3 rounded-full border border-outline-variant/30 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  Login untuk berkomentar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toast notification */}
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
      </div>
    );
  }

  // Desktop modal version
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal with fixed height */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-2xl flex flex-col soft-shadow border border-outline-variant/10 animate-fadeIn mx-2 md:mx-0" style={{ height: "600px" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Komentar
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <Icon name="close" size={24} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Scrollable content with fixed remaining height */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 min-h-0">
          {/* Original confession card */}
          <div className="bg-surface-container-low rounded-2xl p-4 md:p-6 mb-6 border border-outline-variant/10">
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

          {/* HR Reply section (only for confession owner or admin) */}
          {user && hrReplies.length > 0 && (
            <div className="bg-primary-container/10 rounded-2xl p-4 md:p-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="support_agent" size={14} className="text-primary shrink-0" />
                <span className="text-xs font-bold text-primary">Balasan HR</span>
              </div>
              {hrReplies.map((reply) => (
                <div key={reply.id} className="mb-3 last:mb-0">
                  <p className="text-on-surface font-body-md whitespace-pre-line">
                    {reply.content}
                  </p>
                  <span className="text-[11px] text-on-surface-variant/40 mt-1 block">
                    {getTimeAgo(reply.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 text-on-error-container rounded-xl text-sm">
              <Icon name="error" size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && comments.length === 0 && (
            <div className="text-center py-8">
              <Icon name="chat_bubble" size={24} className="text-outline-variant mb-2" />
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="text-[10px] text-primary font-bold">
                      {comment.user_id ? "U" : "A"}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant/60">
                    {comment.user_id ? "User" : "Anonim"} &middot; {getTimeAgo(comment.created_at)}
                  </span>
                </div>
                {/* Admin delete button */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deletingCommentId === comment.id}
                    className="p-1 rounded-full text-error hover:bg-error-container/20 transition-colors disabled:opacity-30"
                    title="Hapus komentar"
                  >
                    {deletingCommentId === comment.id ? (
                      <span className="w-3 h-3 border-2 border-error/30 border-t-error rounded-full animate-spin block" />
                    ) : (
                      <Icon name="delete" size={14} className="shrink-0" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-on-surface font-body-md text-sm whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Comment input - only show if logged in */}
        {user ? (
          <form
            onSubmit={handleSubmit}
            className="border-t border-outline-variant/10 px-4 md:px-6 py-3 md:py-4 shrink-0"
          >
            <div className="flex gap-2 md:gap-3 items-start">
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
                className="bg-primary text-on-primary px-4 md:px-5 py-2.5 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="send" size={14} className="shrink-0" />
              )}
              <span className="hidden md:inline">Kirim</span>
            </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-outline-variant/10 px-4 md:px-6 py-3 shrink-0">
            <button
              onClick={onRequireLogin}
              className="w-full py-3 rounded-full border border-outline-variant/30 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Login untuk berkomentar
            </button>
          </div>
        )}
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}