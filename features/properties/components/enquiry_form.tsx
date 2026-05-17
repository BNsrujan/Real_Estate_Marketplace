'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { submitEnquiry } from '../api/enquiry_api';

interface EnquiryFormProps {
  propertyId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EnquiryForm({ propertyId, onSuccess, onCancel }: EnquiryFormProps) {
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitEnquiry({ propertyId, message: message.trim(), phone: phone || undefined });
      setDone(true);
      onSuccess?.();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to send enquiry');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-400" />
        <p className="font-medium text-white">Enquiry sent!</p>
        <p className="text-sm text-zinc-400">The seller will reach out to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="I'm interested in this property…"
        rows={4}
        className="resize-none bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
        required
      />
      <Input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Your phone number (optional)"
        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          <Send className="h-4 w-4" />
          {loading ? 'Sending…' : 'Send Enquiry'}
        </Button>
      </div>
    </form>
  );
}
