"use client";

import LoginModal from "./LoginModal";
import { useAuth } from "./AuthProvider";

export default function LoginModalWrapper() {
  const { loginModalOpen, closeLoginModal, skipLogin, setUser } = useAuth();

  return (
    <LoginModal
      isOpen={loginModalOpen}
      onClose={closeLoginModal}
      onSkip={skipLogin}
      onSuccess={() => {
        // User logged in successfully - close modal, auth state will be updated by supabase listener
      }}
    />
  );
}