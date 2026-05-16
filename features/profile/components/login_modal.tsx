'use client';

import { useStore } from '@/shared/store';
import { login as loginApi } from '../api/auth_api';
import DialogModule from '@/shared/components/common/dialogmodule';
import { LOGIN_FORM_FIELDS } from '../constants/forms';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const loginSuccess = useStore((s) => s.loginSuccess);

  const handleLogin = async (data: Record<string, string>) => {
    const { email, password } = data;
    const { user, token } = await loginApi(email, password);
    loginSuccess(user, token);
    onOpenChange(false);
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
