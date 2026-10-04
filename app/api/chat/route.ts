import { getLocalResponse } from '@/lib/assistant';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Future provider calls belong here, with secrets read only on the server.
  // No provider is enabled: the site always works without an API key.
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return Response.json({ error: 'Expected JSON.' }, { status: 415 });
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: 'Cross-origin requests are not supported.' }, { status: 403 });
  }
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'A question is required.' }, { status: 400 });
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return Response.json({ error: 'Request too large.' }, { status: 413 });
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof data !== 'object' || data === null || !('question' in data) || typeof data.question !== 'string' || !data.question.trim() || data.question.length > 1000) {
      return Response.json({ error: 'Provide a question of 1–1000 characters.' }, { status: 400 });
    }
    return Response.json({ answer: getLocalResponse(data.question), mode: 'local' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  } finally { reader.releaseLock(); }
}
