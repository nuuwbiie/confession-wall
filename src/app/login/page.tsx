"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateUsername } from "@/lib/username-generator";
import { usernameToEmail, validateUsername } from "@/lib/auth-helpers";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState(generateUsername());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

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

      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 soft-shadow border border-outline-variant/10">
          <div className="text-center mb-8">
            <h1 className="font-headline-md text-headline-md text-primary mb-2">
              {isRegister ? "Buat Akun" : "Masuk"}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isRegister
                ? "Pilih username unik untuk identitas anonimmu"
                : "Masuk pakai username untuk lihat riwayat confession-mu"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="mt-6 text-center">
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

          {/* Anonymous note */}
          <div className="mt-4 p-3 bg-surface-container-low rounded-xl text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant/70">
              <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
              Login bersifat opsional. Kamu tetap bisa menggunakan website tanpa login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}