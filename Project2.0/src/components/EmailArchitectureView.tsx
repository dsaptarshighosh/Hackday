import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, Send } from 'lucide-react';
import { sendAlertEmail, EmailDispatchResult } from '../services/emailService';

export const EmailArchitectureView: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [result, setResult] = useState<EmailDispatchResult | null>(null);
  const [sending, setSending] = useState(false);

  const sendTest = async () => {
    setSending(true);
    try {
      const response = await sendAlertEmail({
        citizenName: 'Living Lens user',
        citizenEmail: recipient.trim(),
        alertForest: 'Sundarbans National Park',
        alertLocation: 'South 24 Parganas, West Bengal',
        distanceKm: 14.2,
        alertRadiusKm: 90,
        aiProbability: 68,
        alertStatus: 'ALERT',
      });
      setResult(response);
    } finally {
      setSending(false);
    }
  };

  const validRecipient = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim());

  return (
    <main className="mx-auto max-w-3xl animate-screen-in">
      <div className="border-b border-[#d5ded2] pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#72816f]">Notifications</p>
        <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#203a30] sm:text-[40px]">Email delivery</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#68796c]">Send a single test alert to an inbox you can check. Test messages use example monitoring details.</p>
      </div>

      <section className="mt-8 max-w-xl">
        <div className="flex items-start gap-4 border-b border-[#d7dfd4] pb-6">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#587344]" strokeWidth={1.7} />
          <div>
            <h2 className="text-base font-semibold text-[#294736]">Send a test message</h2>
            <p className="mt-1 text-sm leading-6 text-[#718075]">Enter your Resend account email for the default test sender. Check your spam folder if it does not arrive.</p>
          </div>
        </div>

        <label htmlFor="test-recipient" className="mt-6 block text-sm font-medium text-[#345446]">Recipient email</label>
        <input
          id="test-recipient"
          type="email"
          autoComplete="email"
          value={recipient}
          onChange={(event) => { setRecipient(event.target.value); setResult(null); }}
          placeholder="you@example.com"
          className="mt-2 min-h-12 w-full border border-[#cbd6ca] bg-[#f8faf5] px-4 text-sm text-[#203a30] placeholder:text-[#94a095] outline-none transition-colors focus:border-[#668348] focus:ring-2 focus:ring-[#668348]/15"
        />
        <button
          type="button"
          onClick={sendTest}
          disabled={sending || !validRecipient}
          className="mt-4 inline-flex min-h-11 items-center gap-2 bg-[#315640] px-5 text-sm font-medium text-[#203a30] transition-colors hover:bg-[#264734] disabled:cursor-not-allowed disabled:bg-[#c7d0c4] disabled:text-[#69786c]"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending…' : 'Send test email'}
        </button>

        {result && (
          <div role="status" className={`mt-6 flex items-start gap-3 border-t pt-5 text-sm ${result.success ? 'border-[#d7dfd4] text-[#365d3d]' : 'border-[#e4d3ce] text-[#8f493e]'}`}>
            {result.success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
            <div>
              <p className="font-semibold">{result.success ? 'Email accepted for delivery' : 'Email could not be sent'}</p>
              <p className="mt-1 leading-5">{result.message}</p>
              {result.providerDetails && <p className="mt-2 border-l-2 border-[#ad792c] pl-2 text-xs leading-5">Resend details: {result.providerDetails}</p>}
              <p className="mt-2 text-xs text-[#829084]">{new Date(result.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};


