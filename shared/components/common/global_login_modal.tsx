"use client";

import { useStore } from "@/shared/store";
import { login as loginApi } from "@/features/profile/api/auth_api";
import { notifyAuthRestored, notifyAuthAborted } from "@/shared/services/api.service";
import { useWatchlistSync } from "@/features/properties/hooks/use_watchlist_sync";
import DialogModule from "./dialogmodule";
import { LOGIN_FORM_FIELDS } from "@/features/profile/constants/forms";

export default function GlobalLoginModal() {
  const isOpen = useStore((s) => s.auth.isLoginModalOpen);
  const loginSuccess = useStore((s) => s.loginSuccess);
  const closeLoginModal = useStore((s) => s.closeLoginModal);
  const { loadWatchlist, saveProperty } = useWatchlistSync();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeLoginModal();
      notifyAuthAborted();
    }
  };

  const handleLogin = async (data: Record<string, string>) => {
    const { email, password } = data;
    const { user, token } = await loginApi(email, password);

    // Capture pendingAction before loginSuccess clears it
    const pendingAction = useStore.getState().auth.pendingAction;

    loginSuccess(user, token);
    loadWatchlist();

    // Execute deferred action after login
    if (pendingAction?.type === "SAVE_PROPERTY") {
      const { propertyId } = pendingAction.payload as { propertyId: string };
      const property = useStore.getState().properties.all.find((p) => p.id === propertyId);
      if (property) saveProperty(property);
    }

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
