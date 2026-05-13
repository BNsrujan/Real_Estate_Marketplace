"use client";

import { useAuthStore } from "@/store/auth_store";
import DialogModule from "@/shared/components/common/dialogmodule";
import { LOGIN_FORM_FIELDS } from "../constants/forms";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (data: Record<string, any>) => {
    const { email, password } = data;

    try {
      
      await new Promise((resolve) => setTimeout(resolve, 1500));


      const isSuccess = email === "test@example.com";

      if (isSuccess || email.includes("success")) {
        login({
          name: email.split("@")[0],
          email: email,
        });
       
      } else {
        throw new Error("Invalid email or password. Use test@example.com");
      }
    } catch (err) {
      console.error("Login error:", err);
      throw err; 
    }
  };

  return (
    <DialogModule
      title="Login"
      description="Welcome back! Please enter your details."
      fields={LOGIN_FORM_FIELDS}
      submitLabel="Submit / Login"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleLogin}
    />
  );
};

export default LoginModal;
