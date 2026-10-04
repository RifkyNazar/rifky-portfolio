import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BODY_BYTES = 16_384;
const limits = { name: 100, email: 254, subject: 150, message: 2000 } as const;
const emailPattern = /^[^\s@<>;,\x00-\x1f\x7f]+@[^\s@<>;,\x00-\x1f\x7f]+\.[^\s@<>;,\x00-\x1f\x7f]+$/;
const validationMessage = 'Please check the form and try again.';
const unavailableMessage = 'Unable to send your message right now. Please try again later.';
type ContactFields = Record<keyof typeof limits, string>;

// Best-effort protection for ONE warm server instance, not durable/global on Vercel.
const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;
const MAX_CLIENTS = 1000;
function throttle(request: Request): number | null {
  const now = Date.now();
  for (const [key, bucket] of requests) if (bucket.resetAt <= now) requests.delete(key);
  // Behind Vercel this is the proxy-provided client address. Direct/local callers
  // can spoof forwarding headers; do not treat this as an authentication boundary.
  const key = (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown').slice(0, 100);
  const bucket = requests.get(key);
  if (bucket && bucket.count >= MAX_REQUESTS) return Math.ceil((bucket.resetAt - now) / 1000);
  if (!bucket && requests.size >= MAX_CLIENTS) return 60;
  requests.set(key, { count: (bucket?.count ?? 0) + 1, resetAt: bucket?.resetAt ?? now + WINDOW_MS });
  return null;
}

function failure(status: number, message = validationMessage, headers: Record<string, string> = {}) {
  return Response.json({ success: false, message }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function validate(data: Record<string, unknown>): ContactFields | null {
  const fields = {} as ContactFields;
  for (const field of Object.keys(limits) as (keyof typeof limits)[]) {
    const raw = data[field];
    if (typeof raw !== 'string' || raw.length > limits[field]) return null;
    const value = raw.trim();
    if (!value || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return null;
    if (field !== 'message' && /[\r\n\t]/.test(value)) return null;
    fields[field] = value;
  }
  return emailPattern.test(fields.email) ? fields : null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export async function POST(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') return failure(415);
  const origin = request.headers.get('origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') return failure(403);
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return failure(413);
  const reader = request.body?.getReader();
  if (!reader) return failure(400);
  let data: unknown;
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return failure(413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch { return failure(400); }
  finally { reader.releaseLock(); }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return failure(400);
  const payload = data as Record<string, unknown>;
  // Never fake a successful send for honeypot submissions.
  if (payload.website !== undefined && (typeof payload.website !== 'string' || payload.website.length > 0)) return failure(400);
  const fields = validate(payload);
  if (!fields) return failure(400);

  const user = process.env.GMAIL_USER?.trim();
  const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  const recipient = process.env.CONTACT_TO_EMAIL?.trim();
  if (!user || !password || !recipient || !emailPattern.test(user) || !emailPattern.test(recipient) || password === 'your-google-app-password') return failure(503, unavailableMessage);
  const retryAfter = throttle(request);
  if (retryAfter !== null) return failure(429, 'Too many attempts. Please wait before trying again.', { 'Retry-After': String(retryAfter) });

  const transporter = nodemailer.createTransport({
    service: 'gmail', secure: true, auth: { user, pass: password },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
    disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false,
  });
  try {
    const text = `New Portfolio Contact\n\nName: ${fields.name}\nEmail: ${fields.email}\nSubject: ${fields.subject}\n\nMessage:\n${fields.message}\n\nReply directly to this email to contact the visitor.`;
    const html = `<div style="font-family:Arial,sans-serif;color:#252b33;line-height:1.6;max-width:600px">
      <p>Mohammed Rifky Portfolio</p><h1 style="font-size:22px">New Contact Message</h1>
      <p><strong>Name</strong><br>${escapeHtml(fields.name)}</p>
      <p><strong>Email</strong><br>${escapeHtml(fields.email)}</p>
      <p><strong>Subject</strong><br>${escapeHtml(fields.subject)}</p>
      <p><strong>Message</strong></p><div style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(fields.message)}</div>
      <p>Reply directly to this email to contact the visitor.</p></div>`;
    const info = await transporter.sendMail({
      from: { name: 'Rifky Portfolio', address: user }, to: recipient,
      replyTo: { name: fields.name, address: fields.email },
      subject: `Portfolio Contact: ${fields.subject}`, text, html,
    });
    const accepted = info.accepted.some(address => address.toLowerCase() === recipient.toLowerCase());
    if (!accepted || info.rejected.length) return failure(502, unavailableMessage);
    // SMTP acceptance confirms the send, not eventual inbox placement/read status.
    return Response.json({ success: true, message: 'Message sent successfully.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return failure(502, unavailableMessage); }
  finally { transporter.close(); }
}
