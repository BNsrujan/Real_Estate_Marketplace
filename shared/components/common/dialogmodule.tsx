"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AlertCircle, Eye, EyeOff, ArrowLeft, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OtpRequestData {
  contact: string;
  type: "email" | "phone";
}

export interface OtpVerifyData {
  contact: string;
  type: "email" | "phone";
  otp: string;
}

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoogleLogin?: () => Promise<void>;
  onLogin?: (data: LoginData) => Promise<void>;
  onRegister?: (data: RegisterData) => Promise<void>;
  onOtpRequest?: (data: OtpRequestData) => Promise<void>;
  onOtpVerify?: (data: OtpVerifyData) => Promise<void>;
}

type View = "login" | "register" | "otp-input" | "otp-verify";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PasswordInput({
  id,
  value,
  onChange,
  label,
  required,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Input
      id={id}
      type={show ? "text" : "password"}
      label={label}
      required={required}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      suffix={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
}

function Separator({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] text-muted-foreground font-medium tracking-widest uppercase shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function GoogleButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-center gap-3 h-12 rounded-full",
        "border border-border bg-muted hover:bg-secondary",
        "text-foreground text-sm font-medium",
        "transition-all duration-200 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  );
}

// ─── OTP digit input ──────────────────────────────────────────────────────────

function OtpBoxes({
  length = 6,
  value,
  onChange,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, "").split("").slice(0, length);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      const next = digits.slice();
      next[i - 1] = "";
      onChange(next.join(""));
    }
  };

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[i] = char;
    onChange(next.join(""));
    if (char && i < length - 1) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pasted.padEnd(length, ""));
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className={cn(
            "w-11 h-13 text-center text-lg font-bold rounded-t-md rounded-b-none",
            "bg-input border-0 border-b-2 text-foreground",
            "focus:outline-none",
            digits[i] ? "border-b-primary" : "border-b-border",
            "transition-colors",
          )}
        />
      ))}
    </div>
  );
}

// ─── Login View ───────────────────────────────────────────────────────────────

function LoginView({
  onSuccess,
  onGoogleLogin,
  onSwitchToRegister,
  onSwitchToOtp,
  onLogin,
}: {
  onSuccess: () => void;
  onGoogleLogin?: () => Promise<void>;
  onSwitchToRegister: () => void;
  onSwitchToOtp: () => void;
  onLogin?: (data: LoginData) => Promise<void>;
}) {
  const [form, setForm] = useState<LoginData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (key: keyof LoginData) => (value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGeneralError(null);
  };

  const validate = () => {
    const e: Partial<LoginData> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setGeneralError(null);
    try {
      await onLogin?.(form);
      onSuccess();
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await onGoogleLogin?.();
      onSuccess();
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Google sign-in failed.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {generalError && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle size={15} />
          <span>{generalError}</span>
        </div>
      )}

      <GoogleButton onClick={handleGoogle} loading={googleLoading || loading} />

      <button
        type="button"
        onClick={onSwitchToOtp}
        className={cn(
          "w-full flex items-center justify-center gap-3 h-12 rounded-full",
          "border border-border bg-muted hover:bg-secondary",
          "text-foreground text-sm font-medium transition-all duration-200 active:scale-95",
        )}
      >
        <Phone size={16} />
        Continue with OTP
      </button>

      <Separator label="or sign in with email" />

      <Input
        type="email"
        label="Email"
        required
        error={errors.email}
        value={form.email}
        onChange={(e) => set("email")(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      <div className="space-y-1">
        <PasswordInput
          id="login-password"
          label="Password"
          required
          error={errors.password}
          value={form.password}
          onChange={set("password")}
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <div>
        <Button
          onClick={handleSubmit}
          disabled={loading || googleLoading}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-md hover:shadow-lg transition-all "
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Signing in…
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Register View ────────────────────────────────────────────────────────────

function RegisterView({
  onSuccess,
  onGoogleLogin,
  onSwitchToLogin,
  onRegister,
}: {
  onSuccess: () => void;
  onGoogleLogin?: () => Promise<void>;
  onSwitchToLogin: () => void;
  onRegister?: (data: RegisterData) => Promise<void>;
}) {
  const [form, setForm] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterData, string>>
  >({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (key: keyof RegisterData) => (value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGeneralError(null);
  };

  const validate = () => {
    const e: Partial<Record<keyof RegisterData, string>> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.mobile))
      e.mobile = "Enter a valid mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setGeneralError(null);
    try {
      await onRegister?.(form);
      onSuccess();
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await onGoogleLogin?.();
      onSuccess();
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Google sign-in failed.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {generalError && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle size={15} />
          <span>{generalError}</span>
        </div>
      )}

      <GoogleButton onClick={handleGoogle} loading={googleLoading || loading} />

      <Separator label="or register with email" />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          required
          error={errors.firstName}
          value={form.firstName}
          onChange={(e) => set("firstName")(e.target.value)}
        />
        <Input
          label="Last Name"
          required
          error={errors.lastName}
          value={form.lastName}
          onChange={(e) => set("lastName")(e.target.value)}
        />
      </div>

      <Input
        type="tel"
        label="Mobile Number"
        required
        error={errors.mobile}
        value={form.mobile}
        onChange={(e) => set("mobile")(e.target.value)}
      />

      <Input
        type="email"
        label="Email"
        required
        error={errors.email}
        value={form.email}
        onChange={(e) => set("email")(e.target.value)}
      />

      <div className="md:grid md:grid-cols-2 md:gap-3 space-y-4 md:space-y-0">
        <PasswordInput
          id="reg-password"
          label="Password"
          required
          error={errors.password}
          value={form.password}
          onChange={set("password")}
        />
        <PasswordInput
          id="reg-confirm-password"
          label="Confirm Password"
          required
          error={errors.confirmPassword}
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
        />
      </div>

      <div className="">
        <Button
          onClick={handleSubmit}
          disabled={loading || googleLoading}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-md hover:shadow-lg transition-all "
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── OTP Input View ───────────────────────────────────────────────────────────

function OtpInputView({
  onSwitchToLogin,
  onOtpSent,
  onOtpRequest,
}: {
  onSwitchToLogin: () => void;
  onOtpSent: (contact: string, type: "email" | "phone") => void;
  onOtpRequest?: (data: OtpRequestData) => Promise<void>;
}) {
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmail = /\S+@\S+\.\S+/.test(contact.trim());
  const isPhone = /^\+?[\d\s\-()]{7,15}$/.test(contact.trim());
  const type: "email" | "phone" = isEmail ? "email" : "phone";

  const validate = () => {
    if (!contact.trim()) {
      setError("Enter your email or phone number");
      return false;
    }
    if (!isEmail && !isPhone) {
      setError("Enter a valid email or phone number");
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await onOtpRequest?.({ contact: contact.trim(), type });
      onOtpSent(contact.trim(), type);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-col items-center gap-2 pb-1">
        <div className="h-12 w-12 rounded-2xl bg-secondary border border-border flex items-center justify-center">
          {isEmail ? (
            <Mail size={22} className="text-primary" />
          ) : (
            <Phone size={22} className="text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          We'll send a 6-digit OTP to your {isEmail ? "email" : "phone"}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Email or Phone Number"
        required
        value={contact}
        onChange={(e) => {
          setContact(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <Button
        onClick={handleSend}
        disabled={loading}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Sending OTP…
          </span>
        ) : (
          "Send OTP"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Back to sign in
        </button>
      </p>
    </div>
  );
}

// ─── OTP Verify View ──────────────────────────────────────────────────────────

const OTP_RESEND_SECONDS = 30;

function OtpVerifyView({
  contact,
  type,
  onSuccess,
  onBack,
  onOtpRequest,
  onOtpVerify,
}: {
  contact: string;
  type: "email" | "phone";
  onSuccess: () => void;
  onBack: () => void;
  onOtpRequest?: (data: OtpRequestData) => Promise<void>;
  onOtpVerify?: (data: OtpVerifyData) => Promise<void>;
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onOtpVerify?.({ contact, type, otp });
      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Incorrect OTP. Please try again.",
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await onOtpRequest?.({ contact, type });
      setCountdown(OTP_RESEND_SECONDS);
      setOtp("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const masked =
    type === "email"
      ? contact.replace(
          /(.{2})(.*)(@.*)/,
          (_, a, b, c) => `${a}${"*".repeat(Math.max(b.length, 3))}${c}`,
        )
      : contact.replace(
          /(\+?\d{2,3})(\d+)(\d{2})/,
          (_, a, b, c) => `${a}${"*".repeat(b.length)}${c}`,
        );

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-col items-center gap-2 pb-1">
        <div className="h-12 w-12 rounded-2xl bg-secondary border border-border flex items-center justify-center">
          {type === "email" ? (
            <Mail size={22} className="text-primary" />
          ) : (
            <Phone size={22} className="text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          OTP sent to{" "}
          <span className="text-foreground font-medium">{masked}</span>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <OtpBoxes
        value={otp}
        onChange={(v) => {
          setOtp(v);
          setError(null);
        }}
      />

      <Button
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Verifying…
          </span>
        ) : (
          "Verify OTP"
        )}
      </Button>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-foreground transition-colors"
        >
          Change {type === "email" ? "email" : "number"}
        </button>
        {countdown > 0 ? (
          <span>Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-primary hover:text-primary/80 font-semibold transition-colors disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend OTP"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

const LoginModal = ({
  open,
  onOpenChange,
  onGoogleLogin,
  onLogin,
  onRegister,
  onOtpRequest,
  onOtpVerify,
}: LoginModalProps) => {
  const [view, setView] = useState<View>("login");
  const [otpContact, setOtpContact] = useState("");
  const [otpType, setOtpType] = useState<"email" | "phone">("email");

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView("login");
      setOtpContact("");
    }, 300);
  };

  const isRegister = view === "register";
  const isOtp = view === "otp-input" || view === "otp-verify";

  const title =
    view === "register"
      ? "Create Account"
      : view === "otp-input"
        ? "Sign in with OTP"
        : view === "otp-verify"
          ? "Enter OTP"
          : "Welcome back";

  const description =
    view === "register"
      ? "Fill in your details to get started."
      : view === "otp-input"
        ? "Enter your email or phone to receive a one-time code."
        : view === "otp-verify"
          ? "Enter the 6-digit code we sent you."
          : "Sign in to continue to your account.";

  return (
    <Dialog open={open} onOpenChange={handleClose} >
      <DialogContent
        className={cn(
          "sm:max-w-md bg-background border-border text-foreground ",
          "rounded-3xl p-6 shadow-2xl overflow-hidden transition-all duration-300",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary/60 blur-3xl"
        />

        {(isRegister || isOtp) && (
          <button
            type="button"
            onClick={() =>
              setView(
                view === "register" || view === "otp-input"
                  ? "login"
                  : "otp-input",
              )
            }
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        <DialogHeader className="mb-1 relative z-10">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div
          key={view}
          className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {view === "login" && (
            <LoginView
              onSuccess={handleClose}
              onGoogleLogin={onGoogleLogin}
              onSwitchToRegister={() => setView("register")}
              onSwitchToOtp={() => setView("otp-input")}
              onLogin={onLogin}
            />
          )}
          {view === "register" && (
            <RegisterView
              onSuccess={handleClose}
              onGoogleLogin={onGoogleLogin}
              onSwitchToLogin={() => setView("login")}
              onRegister={onRegister}
            />
          )}
          {view === "otp-input" && (
            <OtpInputView
              onSwitchToLogin={() => setView("login")}
              onOtpSent={(contact, type) => {
                setOtpContact(contact);
                setOtpType(type);
                setView("otp-verify");
              }}
              onOtpRequest={onOtpRequest}
            />
          )}
          {view === "otp-verify" && (
            <OtpVerifyView
              contact={otpContact}
              type={otpType}
              onSuccess={handleClose}
              onBack={() => setView("otp-input")}
              onOtpRequest={onOtpRequest}
              onOtpVerify={onOtpVerify}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
