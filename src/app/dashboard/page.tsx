"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { WallCardData } from "@/components/WallCard";

type TabType = "pending" | "filtered";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  // Data per tab
  const [pendingData, setPendingData] = useState<WallCardData[]>([]);
  const [filteredData, setFilteredData] = useState<WallCardData[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);

  // Pagination per tab
  const [pendingPage, setPendingPage] = useState(1);
  const [filteredPage, setFilteredPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // HR reply modal
  const [hrReplyModal, setHrReplyModal] = useState<{
    open: boolean;
    confessionId: string;
  }>({ open: false, confessionId: "" });
  const [hrReplyContent, setHrReplyContent] = useState("");
  const [hrReplySubmitting, setHrReplySubmitting] = useState(false);
  const [hrReplyError, setHrReplyError] = useState<string | null>(null);

  const fetchTabData = useCallback(
    async (tab: TabType, page: number) => {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      try {
        // For "filtered" tab, fetch both published and rejected
        const statusQuery = tab === "pending" ? "pending" : "published,rejected";
        const res = await fetch(
          `/api/confessions?status=${statusQuery}&limit=${ITEMS_PER_PAGE}&offset=${offset}`
        );
        const result = await res.json();
        if (tab === "pending") {
          setPendingData(result.data || []);
          setPendingCount(result.count || 0);
        } else {
          setFilteredData(result.data || []);
          setFilteredCount(result.count || 0);
        }
      } catch {
        console.error(`Failed to fetch ${tab}`);
      }
    },
    []
  );

  const fetchPublishedCount = async () => {
    try {
      const res = await fetch("/api/confessions?status=published&limit=1");
      const result = await res.json();
      setPublishedCount(result.count || 0);
    } catch {
      // Ignore
    }
  };

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
        // Fetch initial data
        await Promise.all([
          fetchTabData("pending", 1),
          fetchTabData("filtered", 1),
          fetchPublishedCount(),
        ]);
        setLoading(false);
      } else {
        setIsAdminUser(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, [fetchTabData]);

  // Fetch data when page changes
  useEffect(() => {
    if (isAdminUser) {
      fetchTabData(activeTab, activeTab === "pending" ? pendingPage : filteredPage);
    }
  }, [pendingPage, filteredPage, activeTab, isAdminUser, fetchTabData]);

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
      // Refresh both tabs + published count
      await Promise.all([
        fetchTabData("pending", pendingPage),
        fetchTabData("filtered", filteredPage),
        fetchPublishedCount(),
      ]);
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
      await Promise.all([
        fetchTabData("pending", 1),
        fetchTabData("filtered", 1),
        fetchPublishedCount(),
      ]);
      setPendingPage(1);
    } catch {
      console.error("Approve all failed");
    } finally {
      setApproveAllLoading(false);
    }
  };

  // HR Reply handlers
  const handleHrReplyOpen = (confessionId: string) => {
    setHrReplyModal({ open: true, confessionId });
    setHrReplyContent("");
    setHrReplyError(null);
  };

  const handleHrReplyClose = () => {
    setHrReplyModal({ open: false, confessionId: "" });
    setHrReplyContent("");
    setHrReplyError(null);
  };

  const handleHrReplySubmit = async () => {
    if (!hrReplyContent.trim()) return;

    setHrReplySubmitting(true);
    setHrReplyError(null);

    try {
      const res = await fetch(`/api/confessions/${hrReplyModal.confessionId}/hr-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: hrReplyContent.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setHrReplyError(result.error || "Gagal mengirim balasan");
      } else {
        handleHrReplyClose();
      }
    } catch {
      setHrReplyError("Gagal terhubung ke server");
    } finally {
      setHrReplySubmitting(false);
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

  const totalPendingPages = Math.ceil(pendingCount / ITEMS_PER_PAGE);
  const totalFilteredPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

  const currentData = activeTab === "pending" ? pendingData : filteredData;
  const currentPage = activeTab === "pending" ? pendingPage : filteredPage;
  const totalPages = activeTab === "pending" ? totalPendingPages : totalFilteredPages;
  const setPage = activeTab === "pending" ? setPendingPage : setFilteredPage;

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
              Total
            </span>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm mb-1">
            Total Curhatan
          </p>
          <h3 className="text-display-lg font-bold text-on-surface tracking-tight leading-none">
            {pendingCount + filteredCount + publishedCount}
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
              ? `${Math.min(100, Math.round((publishedCount / Math.max(pendingCount + filteredCount + publishedCount, 1)) * 100))}%`
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

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-outline-variant/10">
          <button
            onClick={() => { setActiveTab("pending"); setPendingPage(1); }}
            className={`px-6 py-3 font-label-sm text-label-sm font-bold transition-colors relative ${
              activeTab === "pending"
                ? "text-secondary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Perlu Review
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[11px] bg-secondary-container/30 text-secondary rounded-full">
                {pendingCount}
              </span>
            )}
            {activeTab === "pending" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("filtered"); setFilteredPage(1); }}
            className={`px-6 py-3 font-label-sm text-label-sm font-bold transition-colors relative ${
              activeTab === "filtered"
                ? "text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Terfilter
            <span className="ml-2 px-2 py-0.5 text-[11px] bg-surface-container-low text-on-surface-variant rounded-full">
              {filteredCount}
            </span>
            {activeTab === "filtered" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Approve All Button (only for pending tab) */}
      {activeTab === "pending" && pendingCount > 0 && (
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant">Memuat data...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentData.length === 0 && (
        <div className="text-center py-20 bg-surface-container-lowest rounded-3xl soft-shadow border border-outline-variant/10">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">
            {activeTab === "pending" ? "check_circle" : "inbox"}
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            {activeTab === "pending"
              ? "Semua confession sudah di-review"
              : "Tidak ada confession terfilter"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {activeTab === "pending"
              ? "Tidak ada confession yang perlu di-review saat ini."
              : "Confession yang ditolak akan muncul di sini."}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && currentData.length > 0 && (
        <section className="mb-10">
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
                  {currentData.map((confession) => (
                    <tr
                      key={confession.id}
                      className="hover:bg-surface-container-low/30 transition-colors group"
                    >
                      <td className="px-4 md:px-8 py-4 md:py-6">
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
                      <td className="px-3 md:px-6 py-4 md:py-6">
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
                      <td className="px-3 md:px-6 py-4 md:py-6">
                        <StatusBadge status={confession.status} />
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-6 text-right">
                        <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                            onClick={() => handleHrReplyOpen(confession.id)}
                            disabled={actionLoading === confession.id}
                            className="p-2 rounded-full text-primary hover:bg-primary-container/20 transition-colors disabled:opacity-30"
                            title="Balas secara pribadi"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              reply
                            </span>
                          </button>
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

            {/* Pagination */}
            <div className="px-8 py-4 bg-surface-container-low/30 flex justify-between items-center border-t border-outline-variant/10">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, activeTab === "pending" ? pendingCount : filteredCount)} dari{" "}
                {activeTab === "pending" ? pendingCount : filteredCount} data
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                        page === currentPage
                          ? "bg-primary text-on-primary"
                          : "text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card View for Mobile */}
          <div className="md:hidden space-y-4">
            {currentData.map((confession) => (
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
                <div className="flex justify-between items-center gap-3">
                  <span
                    className={`px-2 py-0.5 font-label-sm text-[11px] rounded-full border ${
                      confession.is_public !== false
                        ? "bg-tertiary-container/20 text-tertiary border-tertiary-container/30"
                        : "bg-primary-container/20 text-primary border-primary-container/30"
                    }`}
                  >
                    {confession.is_public !== false ? "Public" : "Private"}
                  </span>
                  <div className="flex gap-1">
                    {confession.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(confession.id, "approve")}
                          disabled={actionLoading === confession.id}
                          className="min-touch-target p-2 rounded-full text-secondary hover:bg-secondary-container/20 transition-colors disabled:opacity-30 flex items-center justify-center"
                          title="Setujui"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            check_circle
                          </span>
                        </button>
                        <button
                          onClick={() => handleAction(confession.id, "reject")}
                          disabled={actionLoading === confession.id}
                          className="min-touch-target p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30 flex items-center justify-center"
                          title="Tolak"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            block
                          </span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleHrReplyOpen(confession.id)}
                      disabled={actionLoading === confession.id}
                      className="min-touch-target p-2 rounded-full text-primary hover:bg-primary-container/20 transition-colors disabled:opacity-30 flex items-center justify-center"
                      title="Balas secara pribadi"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        reply
                      </span>
                    </button>
                    <button
                      onClick={() => handleAction(confession.id, "delete")}
                      disabled={actionLoading === confession.id}
                      className="min-touch-target p-2 rounded-full text-error hover:bg-error-container/20 transition-colors disabled:opacity-30 flex items-center justify-center"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-4">
                <button
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                      page === currentPage
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HR Reply Modal */}
      {hrReplyModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleHrReplyClose} />
          <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-lg soft-shadow border border-outline-variant/10 animate-fadeIn p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Balasan Pribadi HR
              </h2>
              <button
                onClick={handleHrReplyClose}
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Balasan ini hanya akan terlihat oleh pengirim confession yang login.
            </p>
            <textarea
              value={hrReplyContent}
              onChange={(e) => setHrReplyContent(e.target.value)}
              placeholder="Tulis balasan pribadi..."
              maxLength={2000}
              rows={4}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all resize-none"
              disabled={hrReplySubmitting}
            />
            {hrReplyError && (
              <div className="flex items-center gap-2 mt-2 p-3 bg-error-container/30 text-on-error-container rounded-xl text-sm">
                <span className="material-symbols-outlined text-sm">error</span>
                {hrReplyError}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleHrReplyClose}
                className="px-5 py-2.5 rounded-full border border-outline-variant/30 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleHrReplySubmit}
                disabled={!hrReplyContent.trim() || hrReplySubmitting}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {hrReplySubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">send</span>
                )}
                Kirim Balasan
              </button>
            </div>
          </div>
        </div>
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
              Public: Approve = publish ke Wall, Reject = terfilter. Private: Approve/Reject = terfilter.
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