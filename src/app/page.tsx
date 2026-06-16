"use client";

import { useEffect, useState } from "react";
import WallCard, { type WallCardData } from "@/components/WallCard";
import MasonryGrid from "@/components/MasonryGrid";
import CommentModal from "@/components/CommentModal";
import { SkeletonGrid } from "@/components/SkeletonCard";
import Link from "next/link";

export default function HomePage() {
  const [confessions, setConfessions] = useState<WallCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment modal state
  const [selectedConfession, setSelectedConfession] = useState<WallCardData | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  // Pending count
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchConfessions();
    fetchPendingCount();
  }, []);

  const fetchConfessions = async () => {
    try {
      const res = await fetch("/api/confessions?status=published&limit=50");
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setConfessions(result.data || []);
      }
    } catch {
      setError("Gagal memuat cerita. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch("/api/confessions?status=pending&limit=1");
      const result = await res.json();
      setPendingCount(result.count || 0);
    } catch {
      // Ignore error
    }
  };

  const openComments = (confession: WallCardData) => {
    setSelectedConfession(confession);
    setCommentModalOpen(true);
  };

  const closeComments = () => {
    setCommentModalOpen(false);
    setSelectedConfession(null);
  };

  return (
    <>
      <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* Welcome Header */}
        <div className="mb-12 max-w-2xl">
          <h1 className="font-display-lg text-display-lg text-on-background mb-4">
            The Wall
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Welcome to the collective exhale. Every card here is a piece of
            someone's heart, shared in safe silence.
          </p>
        </div>

        {/* Loading State */}
        {loading && <SkeletonGrid count={6} />}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">
              error_outline
            </span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
              {error}
            </p>
            <button
              onClick={fetchConfessions}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && confessions.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">
              spa
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
              Belum ada cerita
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md mx-auto">
              Jadilah yang pertama berbagi cerita. Setiap kata adalah langkah
              menuju kelegaan.
            </p>
            <Link
              href="/confess"
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Tulis Cerita
            </Link>
          </div>
        )}

        {/* Masonry Grid */}
        {!loading && !error && confessions.length > 0 && (
          <>
            <MasonryGrid>
              {confessions.map((confession) => (
                <WallCard
                  key={confession.id}
                  data={confession}
                  onCommentClick={() => openComments(confession)}
                />
              ))}
            </MasonryGrid>

            {/* Pending count */}
            {pendingCount > 0 && (
              <div className="mt-10 text-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-secondary-container/20 text-secondary rounded-full font-label-sm text-label-sm hover:bg-secondary-container/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                  {pendingCount} cerita sedang menunggu review
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment Modal */}
      {selectedConfession && (
        <CommentModal
          confession={selectedConfession}
          isOpen={commentModalOpen}
          onClose={closeComments}
        />
      )}

      {/* Floating Action Button */}
      <Link
        href="/confess"
        className="fixed bottom-8 right-8 bg-primary text-on-primary rounded-full px-6 py-4 flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 z-50"
      >
        <span className="material-symbols-outlined">add_circle</span>
        <span className="font-label-sm text-label-sm font-bold hidden sm:inline">
          Write a Confession
        </span>
      </Link>
    </>
  );
}