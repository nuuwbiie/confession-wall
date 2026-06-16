"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { WallCardData } from "@/components/WallCard";

export default function DashboardPage() {
  const router = useRouter();
  const [allConfessions, setAllConfessions] = useState<WallCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAdminUser(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profile?.is_admin) {
        setIsAdminUser(true);
        fetchAll();
      } else {
        setIsAdminUser(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pubRes, pendRes] = await Promise.all([
        fetch("/api/confessions?status=published&limit=50"),
        fetch("/api/confessions?status=pending&limit=50"),
      ]);
      const pub = await pubRes.json();
      const pend = await pendRes.json();
      setAllConfessions([
        ...(pend.data || []),
        ...(pub.data || []),
      ]);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const [approveAllLoading, setApproveAllLoading] = useState(false);

  const handleAction = async (
    confessionId: string,
    action: "approve" | "delete" | "reject"
  ) => {
    setActionLoading(confessionId);
    try {
      await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, confession_id: confessionId }),
      });
      await fetchAll();
    } catch {
      console.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAll = async () => {
    setApproveAllLoading(true);
    try {
      await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all" }),
      });
      await fetchAll();
    } catch {
      console.error("Approve all failed");
    } finally {
      setApproveAllLoading(false);
    }
  };

  // Not admin - show access denied
  if (isAdminUser === false) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-margin-mobile md:px-margin-desktop">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
            lock
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
            Akses Terbatas
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Halaman ini hanya untuk admin. Jika kamu adalah admin, silakan login
            dengan akun yang terdaftar.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Checking admin status
  if (isAdminUser === null && loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const publishedCount = allConfessions.filter(
    (c) => c.status === "published"
  ).length;
  const pendingCount = allConfessions.filter(
    (c) => c.status === "pending"
  ).length;

  return (
    <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-headline-md text-headline-md text-primary font-bold">
          HR Dashboard
        </h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          Monitoring emotional health trends and content flow.
        </p>
      </div>

      {/* Metric Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-2xl soft-shadow border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-container/20 rounded-xl text-primary">
              <span className="material-symbols-outlined">history_edu</span>
            </div>
            <span className="text-xs font-bold text-primary px-2 py-1 bg-primary-container/30 rounded-full">
              +{allConfessions.length}%
            </span>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm mb-1">
            Total Curhatan
          </p>
          <h3 className="text-display-lg font-bold text-on-surface tracking-tight leading-none">
            {allConfessions.length}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl soft-shadow border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary-container/20 rounded-xl text-secondary">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </div>
            <span className="text-xs font-bold text-secondary px-2 py-1 bg-secondary-container/30 rounded-full">
              Urgent
            </span>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm mb-1">
            Menunggu Review
          </p>
          <h3 className="text-display-lg font-bold text-on-surface tracking-tight leading-none">
            {String(pendingCount).padStart(2, "0")}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl soft-shadow border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-container/20 rounded-xl text-tertiary">
              <span className="material-symbols-outlined">favorite</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm mb-1">
            Emotional Wellness
          </p>
          <h3 className="text-display-lg font-bold text-on-surface tracking-tight leading-none">
            {publishedCount > 0
              ? `${Math.min(100, Math.round((publishedCount / Math.max(allConfessions.length, 1)) * 100))}%`
              : "0%"}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl soft-shadow border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-outline-variant/20 rounded-xl text-on-surface-variant">
              <span className="material-symbols-outlined">visibility</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm mb-1">
            Total Published
          </p>
          <h3 className="text-display-lg font-bold text-on-surface tracking-tight leading-none">
            {publishedCount > 0 ? `${publishedCount}` : "0"}
          </h3>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant">Memuat data...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && allConfessions.length === 0 && (
        <div className="text-center py-20 bg-surface-container-lowest rounded-3xl soft-shadow border border-outline-variant/10">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">
            inbox
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            Belum ada confession
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Confession akan muncul di sini setelah user mengirimkannya.
          </p>
        </div>
      )}

      {/* Queue Moderation */}
      {!loading && allConfessions.length > 0 && (
        <section className="mb-10">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6">
            Queue Moderation
          </h2>

          {/* Approve All Button */}
          {pendingCount > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleApproveAll}
                disabled={approveAllLoading}
                className="bg-secondary text-on-secondary px-5 py-2.5 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {approveAllLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">select_all</span>
                )}
                Setujui Semua ({pendingCount})
              </button>
            </div>
          )}

          {/* Table View for Desktop */}
          <div className="hidden md:block bg-surface-container-lowest rounded-3xl soft-shadow border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="px-8 py-4 font-bold">Confession Snippet</th>
                    <th className="px-6 py-4 font-bold">Type</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {allConfessions.map((confession) => (
                    <tr
                      key={confession.id}
                      className="hover:bg-surface-container-low/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <p className="text-on-surface font-body-md line-clamp-1">
                            &ldquo;{confession.content.slice(0, 80)}...&rdquo;
                          </p>
                          <span className="text-[11px] text-on-surface-variant/60 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              schedule
                            </span>{" "}
                            {getTimeAgo(confession.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`px-3 py-1 font-label-sm text-[12px] rounded-full border ${
                            confession.is_public !== false
                              ? "bg-tertiary-container/20 text-tertiary border-tertiary-container/30"
                              : "bg-primary-container/20 text-primary border-primary-container/30"
                          }`}
                        >
                          {confession.is_public !== false ? "Public" : "Private"}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <StatusBadge status={confession.status} />
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {confession.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(confession.id, "approve")}
                                disabled={actionLoading === confession.id}
                                className="p-2 rounded-full text-secondary hover:bg-secondary-container/20 transition-colors disabled:opacity-30"
                                title="Setujui"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  check_circle
                                </span>
                              </button>
                              <button
                                onClick={() => handleAction(confession.id, "reject")}
                                disabled={actionLoading === confession.id}
                                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
                                title="Tolak"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  block
                                </span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleAction(confession.id, "delete")}
                            disabled={actionLoading === confession.id}
                            className="p-2 rounded-full text-error hover:bg-error-container/20 transition-colors disabled:opacity-30"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 bg-surface-container-low/30 flex justify-between items-center border-t border-outline-variant/10">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {allConfessions.length} confession(s)
              </span>
            </div>
          </div>

          {/* Card View for Mobile */}
          <div className="md:hidden space-y-4">
            {allConfessions.map((confession) => (
              <div
                key={confession.id}
                className="bg-surface-container-lowest p-5 rounded-2xl soft-shadow border border-outline-variant/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={confession.status} />
                  <span className="text-[11px] text-on-surface-variant/60">
                    {getTimeAgo(confession.created_at)}
                  </span>
                </div>
                <p className="text-on-surface font-body-md mb-3 line-clamp-2">
                  &ldquo;{confession.content.slice(0, 100)}...&rdquo;
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-0.5 font-label-sm text-[11px] rounded-full border ${
                      confession.is_public !== false
                        ? "bg-tertiary-container/20 text-tertiary border-tertiary-container/30"
                        : "bg-primary-container/20 text-primary border-primary-container/30"
                    }`}
                  >
                    {confession.is_public !== false ? "Public" : "Private"}
                  </span>
                  <div className="flex gap-2">
                    {confession.status === "pending" && (
                      <button
                        onClick={() => handleAction(confession.id, "approve")}
                        disabled={actionLoading === confession.id}
                        className="p-1.5 rounded-full text-secondary hover:bg-secondary-container/20 transition-colors disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          check_circle
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(confession.id, "delete")}
                      disabled={actionLoading === confession.id}
                      className="p-1.5 rounded-full text-error hover:bg-error-container/20 transition-colors disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary soft-shadow">
            <span className="material-symbols-outlined text-3xl">
              auto_awesome
            </span>
          </div>
          <div>
            <h5 className="font-bold text-on-surface mb-1">
              Sistem Auto-Publish
            </h5>
            <p className="text-on-surface-variant text-sm">
              Confession dengan status pending akan otomatis tayang setelah 3
              jam jika tidak ada tindakan dari HR.
            </p>
            <a
              href="/api/cron/publish"
              target="_blank"
              className="text-primary text-sm font-medium hover:underline mt-2 inline-block"
            >
              &rarr; Trigger manual auto-publish
            </a>
          </div>
        </div>
        <div className="bg-secondary/5 rounded-3xl p-8 border border-secondary/10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-secondary soft-shadow">
            <span className="material-symbols-outlined text-3xl">
              support_agent
            </span>
          </div>
          <div>
            <h5 className="font-bold text-on-surface mb-1">HR Help Desk</h5>
            <p className="text-on-surface-variant text-sm">
              Gunakan tombol approve untuk publish langsung, atau delete jika
              melanggar aturan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { dot: string; bg: string; text: string; label: string }> = {
    published: { dot: "bg-primary", bg: "bg-primary-container/20", text: "text-primary", label: "Tayang" },
    pending: { dot: "bg-secondary", bg: "bg-secondary-container/20", text: "text-secondary", label: "Menunggu Auto-Publish" },
    private: { dot: "bg-tertiary", bg: "bg-tertiary-container/20", text: "text-tertiary", label: "Private" },
    rejected: { dot: "bg-error", bg: "bg-error-container/20", text: "text-error", label: "Ditolak" },
  };

  const c = config[status] || config.pending;

  return (
    <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full border ${c.bg} ${c.text}`}>
      <div className={`w-2 h-2 rounded-full ${c.dot} ${status === "pending" ? "animate-pulse" : ""}`} />
      <span className="font-label-sm text-[12px]">{c.label}</span>
    </div>
  );
}

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