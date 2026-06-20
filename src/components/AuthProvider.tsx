"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  skipLogin: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SKIP_LOGIN_KEY = "confession_wall_skip_login";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setInitialCheckDone(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-show login modal on first visit if not logged in and hasn't skipped
  useEffect(() => {
    if (!initialCheckDone) return;
    if (user) return;

    const hasSkipped = localStorage.getItem(SKIP_LOGIN_KEY) === "true";
    if (!hasSkipped) {
      setLoginModalOpen(true);
    }
  }, [initialCheckDone, user]);

  const openLoginModal = useCallback(() => {
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
  }, []);

  const skipLogin = useCallback(() => {
    localStorage.setItem(SKIP_LOGIN_KEY, "true");
    setLoginModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        skipLogin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}