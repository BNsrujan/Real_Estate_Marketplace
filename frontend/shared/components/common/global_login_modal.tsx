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
import { toastService } from "@/shared/services/toast.service";
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
          prompt: (cb?: (n: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason?: () => string;
            getSkippedReason?: () => string;
          }) => void) => void;
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

  const showAuthError = (message: string) => {
    throw new Error(message);
  };

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
    try {
      const { user, token } = await loginApi(data.email.trim(), data.password);
      afterAuth(user, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid email or password.";
      showAuthError(message);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      const { user, token } = await registerApi({
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      afterAuth(user, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed. Please try again.";
      showAuthError(message);
    }
  };

  const handleGoogleLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) showAuthError("Google Sign-In is not configured.");

    const credential = await new Promise<string>((resolve, reject) => {
      if (!window.google?.accounts?.id) {
        reject(new Error("Google Sign-In script is not loaded. Please refresh the page."));
        return;
      }
      let settled = false;
      const fail = (message: string) => {
        if (settled) return;
        settled = true;
        reject(new Error(message));
      };
      const timeout = window.setTimeout(() => {
        fail("Google Sign-In did not open. Check that this site origin is allowed for the Google client ID.");
      }, 8000);

      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: (response) => {
          if (!response.credential) {
            fail("Google sign-in did not return a credential. Please try again.");
            return;
          }
          settled = true;
          window.clearTimeout(timeout);
          resolve(response.credential);
        },
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.clearTimeout(timeout);
          const reason = notification.getNotDisplayedReason?.() ?? notification.getSkippedReason?.();
          fail(
            reason === "invalid_client"
              ? "Google Sign-In is not enabled for this site origin. Please use email or OTP sign-in."
              : "Google sign-in was cancelled or blocked. Please try again.",
          );
        }
      });
    });

    try {
      const { user, token } = await googleAuthApi(credential);
      afterAuth(user, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed.";
      showAuthError(message);
    }
  };

  const handleOtpRequest = async (data: OtpRequestData) => {
    const contact = data.contact.trim();
    const validEmail = /\S+@\S+\.\S+/.test(contact);
    const validPhone = /^\+?[\d\s\-()]{7,15}$/.test(contact);

    if ((data.type === "email" && !validEmail) || (data.type === "phone" && !validPhone)) {
      showAuthError("Enter a valid email or phone number.");
    }

    try {
      await requestOtp(contact, data.type);
      toastService.success("OTP sent successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP. Please try again.";
      showAuthError(message);
    }
  };

  const handleOtpVerify = async (data: OtpVerifyData) => {
    const otp = data.otp.trim();
    if (!/^\d{6}$/.test(otp)) {
      showAuthError("Enter the 6-digit OTP.");
    }

    try {
      const { user, token } = await verifyOtp(data.contact.trim(), data.type, otp);
      afterAuth(user, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Incorrect OTP. Please try again.";
      showAuthError(message);
    }
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
