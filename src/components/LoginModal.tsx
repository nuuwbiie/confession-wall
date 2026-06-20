"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateUsername } from "@/lib/username-generator";
import { usernameToEmail, validateUsername } from "@/lib/auth-helpers";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSkip, onSuccess }: LoginModalProps) {
  const supabase = createClient();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState(generateUsername());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccessMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleUsernameChange = (value: string) => {
    const lower = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(lower);
    if (lower.length >= 3) {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate username
    const validation = validateUsername(username);
    if (!validation.valid) {
      setUsernameError(validation.error || "Username tidak valid");
      return;
    }
    setUsernameError(null);

    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;
    const email = usernameToEmail(validation.normalized);

    if (isRegister) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: validation.normalized },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").insert({
          id: user.id,
          username: validation.normalized,
        });
      }

      setSuccessMessage("Akun berhasil dibuat! Sekarang kamu bisa masuk.");
      setIsRegister(false);
      setLoading(false);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Username atau password salah. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      onSuccess?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto soft-shadow border border-outline-variant/10 animate-fadeIn mx-2">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            {isRegister ? "Buat Akun" : "Masuk"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Benefits section - collapsible */}
          <div className="mb-6 bg-primary-container/20 rounded-2xl border border-primary-container/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setBenefitsExpanded(!benefitsExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-container/10 transition-colors"
            >
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                Login untuk mengakses lebih banyak fitur
              </span>
              <span className={`material-symbols-outlined text-primary transition-transform duration-200 ${benefitsExpanded ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {benefitsExpanded && (
              <div className="px-4 pb-4 space-y-3 animate-fadeIn">
                {/* Login benefits */}
                <div>
                  <p className="text-xs text-primary/70 font-medium mb-2">Dengan login kamu bisa:</p>
                  <ul className="space-y-2">
                    {[
                      { icon: "favorite", text: "Menyukai confession orang lain" },
                      { icon: "chat", text: "Memberi komentar pada confession" },
                      { icon: "reply", text: "Mendapatkan balasan dari confessionmu" },
                      { icon: "history", text: "Melihat riwayat confessionmu" },
                    ].map((item) => (
                      <li key={item.text} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Without login */}
                <div className="pt-3 border-t border-primary-container/30">
                  <p className="text-xs text-on-surface-variant/50 font-medium mb-2">Tanpa login kamu tetap bisa:</p>
                  <ul className="space-y-1.5">
                    {[
                      { icon: "visibility", text: "Melihat semua confession" },
                      { icon: "edit_note", text: "Mengirim confession anonim" },
                    ].map((item) => (
                      <li key={item.text} className="flex items-center gap-2 text-sm text-on-surface-variant/70">
                        <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">{item.icon}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant mb-2 block">
                Username
              </label>
              <div className="flex gap-2">
                <input
                  name="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`flex-1 bg-surface-container-low border ${
                    usernameError ? "border-error" : "border-outline-variant/30"
                  } rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all`}
                  placeholder="contoh: burung_senja_482"
                  required
                  minLength={3}
                />
                <button
                  type="button"
                  onClick={() => setUsername(generateUsername())}
                  className="px-3 py-2 bg-surface-container text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-colors"
                  title="Generate random username"
                >
                  <span className="material-symbols-outlined">shuffle</span>
                </button>
              </div>
              {usernameError && (
                <p className="text-xs text-error mt-1.5 ml-1">{usernameError}</p>
              )}
              {!usernameError && (
                <p className="text-xs text-on-surface-variant/60 mt-1.5 ml-1">
                  Huruf kecil, angka, underscore. Minimal 3 karakter
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant mb-2 block">
                Password
              </label>
              <input
                name="password"
                type="password"
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-container/30 text-on-error-container rounded-xl">
                <span className="material-symbols-outlined text-sm">error</span>
                <span className="font-label-sm text-label-sm">{error}</span>
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-secondary-container/30 text-on-secondary-container rounded-xl">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span className="font-label-sm text-label-sm">{successMessage}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!usernameError}
              className="w-full bg-primary text-on-primary py-3 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegister ? "Mendaftar..." : "Masuk..."}
                </span>
              ) : isRegister ? (
                "Daftar"
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="mt-4 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-primary font-medium hover:underline"
              >
                {isRegister ? "Masuk" : "Daftar"}
              </button>
            </p>
          </div>

          {/* Skip button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={onSkip}
              className="w-full py-3 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors border border-outline-variant/20"
            >
              Skip Login — Lanjutkan sebagai tamu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}