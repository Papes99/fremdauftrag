// Noch nicht veröffentlicht. Es gibt noch kein Supabase-Projekt und keinen Mistral-Schlüssel.
// Der Schlüssel darf später nur hier liegen, nie in der App.

import { MODEL_SYSTEM_PROMPT, parseModelReply, ruleCheck } from '../../../src/lib/moderation.ts';

const TIMEOUT_MS = 8000;

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ status: 'pending' }, 405);
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return json({ status: 'pending' }, 401);

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null;
  const text = body && typeof body.text === 'string' ? body.text : '';
  const rule = ruleCheck(text);
  if (!rule.ok) return json({ status: 'rejected', key: rule.key, schwere: rule.schwere });

  const key = Deno.env.get('MISTRAL_API_KEY');
  if (!key) return json({ status: 'pending' });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        temperature: 0,
        messages: [
          { role: 'system', content: MODEL_SYSTEM_PROMPT },
          { role: 'user', content: text.slice(0, 140) },
        ],
      }),
    });
    if (!response.ok) return json({ status: 'pending' });
    const payload = (await response.json()) as { choices?: { message?: { content?: unknown } }[] };
    const raw = payload.choices?.[0]?.message?.content;
    if (typeof raw !== 'string') return json({ status: 'pending' });
    return json(parseModelReply(raw));
  } catch {
    return json({ status: 'pending' });
  } finally {
    clearTimeout(timer);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
