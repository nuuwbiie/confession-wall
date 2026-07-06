"use client";

import { useState, useEffect } from "react";

import Icon from "./Icon";

interface HrReply {
  id: string;
  content: string;
  admin_id: string | null;
  created_at: string;
}

interface NotificationModalProps {
  confessionId: string;
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

export default function NotificationModal({ confessionId, isOpen, onClose }: NotificationModalProps) {
  const [hrReplies, setHrReplies] = useState<HrReply[]>([]);
  const [confessionSnippet, setConfessionSnippet] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch HR reply
        const hrRes = await fetch(`/api/confessions/${confessionId}/hr-reply`);
        const hrResult = await hrRes.json();
        if (!ignore) {
          setHrReplies(hrResult.data || []);
        }

        // Fetch confession snippet via admin API
        const confRes = await fetch(`/api/confessions?status=published,rejected&limit=1`);
        const confResult = await confRes.json();
        if (!ignore && confResult.data) {
          const confession = confResult.data.find((c: any) => c.id === confessionId);
          if (confession) {
            setConfessionSnippet(confession.content.slice(0, 200));
          }
        }
      } catch {
        if (!ignore) setError("Gagal memuat balasan");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, [isOpen, confessionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-lg soft-shadow border border-outline-variant/10 animate-fadeIn mx-2 md:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-outline-variant/10">
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <Icon name="support_agent" size={24} className="text-primary" />
            Balasan HR
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <Icon name="close" size={24} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 py-4 space-y-4">
          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 text-on-error-container rounded-xl text-sm">
              <Icon name="error" size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Confession snippet */}
          {!loading && confessionSnippet && (
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-tertiary-container/30 text-on-tertiary-container">
                  Confession Anda
                </span>
              </div>
              <p className="text-on-surface font-body-md text-sm whitespace-pre-line">
                &ldquo;{confessionSnippet}...&rdquo;
              </p>
            </div>
          )}

          {/* HR Replies */}
          {!loading && !error && hrReplies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-on-surface-variant/60 font-label-sm text-label-sm">
                Tidak ada balasan HR.
              </p>
            </div>
          )}

          {!loading && hrReplies.map((reply) => (
            <div
              key={reply.id}
              className="bg-primary-container/10 rounded-2xl p-4 md:p-5 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-on-primary text-xs font-bold">HR</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-primary">HR</span>
                  <span className="text-[11px] text-on-surface-variant/60 ml-2">
                    {getTimeAgo(reply.created_at)}
                  </span>
                </div>
              </div>
              <p className="text-on-surface font-body-md whitespace-pre-line">
                {reply.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 border-t border-outline-variant/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold hover:opacity-90 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}