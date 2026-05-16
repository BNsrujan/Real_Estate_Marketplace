"use client";

import { useStore } from "@/shared/store";
import {
  login as loginApi,
  register as registerApi,
  googleAuth as googleAuthApi,
  requestOtp,
  verifyOtp,
} from "@/features/profile/api/auth_api";
import { notifyAuthRestored, notifyAuthAborted } from "@/shared/services/api.service";
import { useWatchlistSync } from "@/features/properties/hooks/use_watchlist_sync";
import LoginModal, {
  type LoginData,
  type RegisterData,
  type OtpRequestData,
  type OtpVerifyData,
} from "./dialogmodule";

// ─── Google GSI type shim ─────────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          prompt: (cb?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GlobalLoginModal() {
  const isOpen = useStore((s) => s.auth.isLoginModalOpen);
  const loginSuccess = useStore((s) => s.loginSuccess);
  const closeLoginModal = useStore((s) => s.closeLoginModal);
  const { loadWatchlist, saveProperty } = useWatchlistSync();

  const afterAuth = (user: Parameters<typeof loginSuccess>[0], token: string) => {
    const pendingAction = useStore.getState().auth.pendingAction;
    loginSuccess(user, token);
    loadWatchlist();
    if (pendingAction?.type === "SAVE_PROPERTY") {
      const { propertyId } = pendingAction.payload as { propertyId: string };
      const property = useStore.getState().properties.all.find((p) => p.id === propertyId);
      if (property) saveProperty(property);
    }
    notifyAuthRestored();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeLoginModal();
      notifyAuthAborted();
    }
  };

  const handleLogin = async (data: LoginData) => {
    const { user, token } = await loginApi(data.email, data.password);
    afterAuth(user, token);
  };

  const handleRegister = async (data: RegisterData) => {
    const { user, token } = await registerApi({
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      email: data.email,
      password: data.password,
    });
    afterAuth(user, token);
  };

  const handleGoogleLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("Google Sign-In is not configured.");

    const credential = await new Promise<string>((resolve, reject) => {
      if (!window.google?.accounts?.id) {
        reject(new Error("Google Sign-In script is not loaded. Please refresh the page."));
        return;
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => resolve(response.credential),
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          reject(new Error("Google sign-in was cancelled or blocked. Please try again."));
        }
      });
    });

    const { user, token } = await googleAuthApi(credential);
    afterAuth(user, token);
  };

  const handleOtpRequest = async (data: OtpRequestData) => {
    await requestOtp(data.contact, data.type);
  };

  const handleOtpVerify = async (data: OtpVerifyData) => {
    const { user, token } = await verifyOtp(data.contact, data.type, data.otp);
    afterAuth(user, token);
  };

  return (
    <LoginModal
      open={isOpen}
      onOpenChange={handleOpenChange}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onGoogleLogin={handleGoogleLogin}
      onOtpRequest={handleOtpRequest}
      onOtpVerify={handleOtpVerify}
    />
  );
}
