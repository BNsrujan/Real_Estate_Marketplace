"use client";

import { useStore } from "@/shared/store";
import { login as loginApi } from "@/features/profile/api/auth_api";
import { notifyAuthRestored, notifyAuthAborted } from "@/shared/services/api.service";
import DialogModule from "./dialogmodule";
import { LOGIN_FORM_FIELDS } from "@/features/profile/constants/forms";

export default function GlobalLoginModal() {
  const isOpen = useStore((s) => s.auth.isLoginModalOpen);
  const loginSuccess = useStore((s) => s.loginSuccess);
  const closeLoginModal = useStore((s) => s.closeLoginModal);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeLoginModal();
      notifyAuthAborted();
    }
  };

  const handleLogin = async (data: Record<string, string>) => {
    const { email, password } = data;
    const { user, token } = await loginApi(email, password);
    loginSuccess(user, token);
    notifyAuthRestored();
  };

  return (
    <DialogModule
      title="Login"
      description="Please log in to continue."
      fields={LOGIN_FORM_FIELDS}
      submitLabel="Login"
      open={isOpen}
      onOpenChange={handleOpenChange}
      onSubmit={handleLogin}
    />
  );
}
