import { EmailAlertPayload } from '../types/livingLens';

export interface EmailDispatchResult {
  success: boolean;
  status: 'SENT' | 'FAILED';
  timestamp: string;
  recipient: string;
  message: string;
  providerDetails?: string;
}

function extractProviderDetails(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const parsed = JSON.parse(value) as { message?: unknown; error?: unknown };
    if (typeof parsed.message === 'string') return parsed.message;
    if (typeof parsed.error === 'string') return parsed.error;
  } catch {
    return value;
  }
  return undefined;
}

/** Sends an alert through the server-side Resend integration. */
export async function sendAlertEmail(payload: EmailAlertPayload): Promise<EmailDispatchResult> {
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch('/api/alerts/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        status: 'FAILED',
        timestamp,
        recipient: payload.citizenEmail,
        message: data.error || `Email service returned HTTP ${response.status}.`,
        providerDetails: extractProviderDetails(data.providerMessage),
      };
    }

    return {
      success: true,
      status: 'SENT',
      timestamp,
      recipient: payload.citizenEmail,
      message: data.message || `Alert email sent to ${payload.citizenEmail}.`,
    };
  } catch (error) {
    return {
      success: false,
      status: 'FAILED',
      timestamp,
      recipient: payload.citizenEmail,
      message: error instanceof Error ? error.message : 'Could not reach the alert email service.',
    };
  }
}
