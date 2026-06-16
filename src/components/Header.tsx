"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/", label: "The Wall" },
  { href: "/confess", label: "Confess" },
  { href: "/dashboard", label: "Dashboard" },
];

interface UserConfession {
  id: string;
  content: string;
  status: string;
  created_at: string;
  is_anonymous: boolean;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [userConfessions, setUserConfessions] = useState<UserConfession[]>([]);
  const [userConfessionsLoading, setUserConfessionsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Check current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fetch profile
        supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setUsername(data.username);
          });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUsername(data.username);
          });
      } else {
        setUsername(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserConfessions = async () => {
    setUserConfessionsLoading(true);
    try {
      const res = await fetch("/api/user/confessions");
      const result = await res.json();
      setUserConfessions(result.data || []);
    } catch {
      setUserConfessions([]);
    } finally {
      setUserConfessionsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    const newOpen = !avatarDropdownOpen;
    setAvatarDropdownOpen(newOpen);
    if (newOpen) {
      fetchUserConfessions();
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUsername(null);
    setAvatarDropdownOpen(false);
    router.refresh();
  };

  function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit`;
    if (diffHours < 24) return `${diffHours} jam`;
    if (diffDays < 7) return `${diffDays} hari`;
    return date.toLocaleDateString("id-ID");
  }

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/10">
      <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max-width mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-display-lg font-bold text-primary tracking-tight text-2xl md:text-3xl"
          >
            Confession Wall
          </Link>
          <div className="hidden md:flex gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pb-1 transition-colors duration-300 ${
                  pathname === item.href
                    ? "text-primary border-b-2 border-primary font-bold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" aria-label="Notifications">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                onClick={handleAvatarClick}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>

              {/* Avatar dropdown */}
              {avatarDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-lowest rounded-2xl soft-shadow border border-outline-variant/10 overflow-hidden z-50">
                  <div className="px-5 py-4 border-b border-outline-variant/10">
                    <p className="font-label-sm text-label-sm text-on-surface font-medium">
                      {username || "User"}
                    </p>
                    <p className="text-xs text-on-surface-variant/60">
                      Confessionmu
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {userConfessionsLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : userConfessions.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs text-on-surface-variant/60">
                          Belum ada confession
                        </p>
                      </div>
                    ) : (
                      userConfessions.map((c) => (
                        <div
                          key={c.id}
                          className="px-5 py-3 hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/5 last:border-0"
                        >
                          <p className="text-sm text-on-surface line-clamp-1">
                            &ldquo;{c.content.slice(0, 60)}...&rdquo;
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusDot status={c.status} />
                            <span className="text-[10px] text-on-surface-variant/60">
                              {getTimeAgo(c.created_at)}
                            </span>
                            <span className="text-[10px] text-on-surface-variant/40">
                              {c.is_anonymous ? "Anonim" : "Publik"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-outline-variant/10 bg-surface-container-low/30">
                    <Link
                      href="/confess"
                      className="text-xs text-primary font-medium hover:underline"
                      onClick={() => setAvatarDropdownOpen(false)}
                    >
                      + Tulis confession baru
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              Masuk
            </Link>
          )}

          {/* Mobile menu */}
          <div className="md:hidden flex gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  pathname === item.href
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: "bg-primary",
    pending: "bg-secondary animate-pulse",
    private: "bg-tertiary",
    rejected: "bg-error",
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status] || "bg-outline-variant"}`}
      title={status}
    />
  );
}