"use client";

import { useState } from "react";
import { FONT_OPTIONS, CONFESSION_MAX_CHARS } from "@/lib/constants";
import { useConfessionForm } from "@/hooks/useConfessionForm";
import ConfessionPreview from "./ConfessionPreview";
import SuccessModal from "./SuccessModal";
import TurnstileWidget from "./TurnstileWidget";

export default function ConfessionForm() {
  const {
    state,
    dispatch,
    validationError,
    isSubmitDisabled,
    charProgress,
    charWarning,
    charDanger,
    clearDraft,
    hasDraft,
  } = useConfessionForm();

  const selectedFontOption = FONT_OPTIONS.find((f) => f.id === state.font);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_STATUS", payload: "submitting" });

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const honeypot = formData.get("website") as string;

      const res = await fetch("/api/confessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: state.content.trim(),
            font: state.font,
            is_public: state.isPublic,
            allow_replies: state.allowReplies,
            is_anonymous: state.isAnonymous,
            honeypot, // send honeypot field for server-side check
            turnstileToken, // send Turnstile token for server-side verification
          }),
      });

      const result = await res.json();

      if (!res.ok) {
        dispatch({
          type: "SET_ERROR",
          payload: result.error || "Gagal mengirim cerita. Silakan coba lagi.",
        });
        return;
      }

      dispatch({ type: "SET_STATUS", payload: "success" });
      clearDraft();
      setShowSuccessModal(true);
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: "Gagal terhubung ke server. Silakan coba lagi.",
      });
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    dispatch({ type: "SET_STATUS", payload: "idle" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Main Form Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-10 soft-shadow border border-outline-variant/10">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
          Bagikan Ceritamu
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          Ini adalah ruang amanmu. Tulis apa pun yang ingin kamu sampaikan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field — hidden from humans, bots will fill it */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Turnstile widget */}
          <div className="flex justify-center">
            <TurnstileWidget
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>

          {/* Font Picker */}
          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant mb-3 block">
              Pilih Font / Suara Visual
            </label>
            <div className="flex flex-wrap gap-2">
              {FONT_OPTIONS.map((font) => (
                <button
                  type="button"
                  key={font.id}
                  onClick={() =>
                    dispatch({ type: "SET_FONT", payload: font.id })
                  }
                  className={`px-4 py-2 rounded-full font-label-sm text-label-sm transition-all duration-200 ${
                    state.font === font.id
                      ? "bg-primary text-on-primary shadow-md scale-105"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                  style={{ fontFamily: font.fontFamily }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              value={state.content}
              onChange={(e) =>
                dispatch({ type: "SET_CONTENT", payload: e.target.value })
              }
              placeholder="Tulis ceritamu di sini..."
              rows={6}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all duration-200 resize-none"
              style={{
                fontFamily: selectedFontOption?.fontFamily || "'Inter', sans-serif",
                fontSize:
                  state.font === "handwriting"
                    ? "24px"
                    : state.font === "mono"
                    ? "18px"
                    : "20px",
                lineHeight:
                  state.font === "handwriting"
                    ? "32px"
                    : state.font === "mono"
                    ? "28px"
                    : "30px",
              }}
            />

            {/* Character Counter with Progress Bar */}
            <div className="mt-3 space-y-2">
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    charDanger
                      ? "bg-error"
                      : charWarning
                      ? "bg-secondary"
                      : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(charProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant/60">
                  {state.content.length}/{CONFESSION_MAX_CHARS} karakter
                </span>
                {validationError && (
                  <span className="font-label-sm text-label-sm text-error">
                    {validationError}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-low rounded-xl">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface font-medium">
                Publik (tampil di Wall)
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">
                Jika nonaktif, hanya HR yang bisa melihat
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_IS_PUBLIC", payload: !state.isPublic })
              }
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                state.isPublic ? "bg-secondary" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  state.isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Replies Toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-low rounded-xl">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface font-medium">
                Izinkan Balasan / Komentar
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">
                User lain bisa mengomentari post ini
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_ALLOW_REPLIES",
                  payload: !state.allowReplies,
                })
              }
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                state.allowReplies
                  ? "bg-secondary"
                  : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  state.allowReplies ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Anonim Toggle (for logged-in users) */}
          <div className="flex items-center justify-between py-3 px-4 bg-surface-container-low rounded-xl">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface font-medium">
                Sembunyikan Identitasku (Anonim)
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">
                Nonaktifkan jika ingin menampilkan namamu di postingan
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "SET_IS_ANONYMOUS",
                  payload: !state.isAnonymous,
                })
              }
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                state.isAnonymous
                  ? "bg-secondary"
                  : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  state.isAnonymous ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

            {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            {/* Preview Toggle Button */}
            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
              className={`flex-1 px-6 py-3 rounded-full font-label-sm text-label-sm font-bold border-2 transition-all duration-200 ${
                state.showPreview
                  ? "bg-primary-container text-on-primary-container border-primary-container"
                  : "bg-transparent text-primary border-primary hover:bg-primary/5"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  {state.showPreview ? "visibility_off" : "visibility"}
                </span>
                {state.showPreview ? "Tutup Pratinjau" : "Lihat Pratinjau"}
              </span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-[2] bg-primary text-on-primary py-3 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {state.status === "submitting" ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : state.status === "success" ? (
                <>
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  Terkirim!
                </>
              ) : (
                "Kirim Cerita"
              )}
            </button>
          </div>

          {/* Error Message */}
          {state.status === "error" && (
            <div className="flex items-center gap-2 p-3 bg-error-container/30 text-on-error-container rounded-xl">
              <span className="material-symbols-outlined text-sm">error</span>
              <span className="font-label-sm text-label-sm">
                {state.errorMessage}
              </span>
            </div>
          )}

          {/* Draft indicator */}
          {hasDraft && state.status !== "success" && (
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-2 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-sm">
                  save
                </span>
                <span className="font-label-sm text-label-sm">
                  Draft tersimpan
                </span>
              </div>
              <button
                type="button"
                onClick={clearDraft}
                className="font-label-sm text-label-sm text-error hover:text-error/80 transition-colors"
              >
                Hapus Draft
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Preview Panel */}
      {state.showPreview && (
        <div className="animate-fadeIn transition-all duration-300">
          <ConfessionPreview
            content={state.content}
            font={state.font}
            isPublic={state.isPublic}
            allowReplies={state.allowReplies}
          />
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseSuccess} />
    </div>
  );
}