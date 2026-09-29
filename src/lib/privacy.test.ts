import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('die Empfänger-Sicht nennt kein author_id und nur die eigene Zeile', () => {
  const sql = readFileSync(new URL('../../supabase/migrations/0002_tasks.sql', import.meta.url), 'utf8');
  const view = sql.slice(sql.indexOf('create or replace view public.my_assignment_tasks'));
  const body = view.slice(0, view.indexOf('alter table'));
  assert.equal(body.includes('author_id'), false);
  assert.equal(body.includes('auth.uid()'), true);
  assert.equal(sql.includes('grant select on table public.my_assignment_tasks to authenticated'), true);
  assert.equal(sql.includes('grant select on table public.tasks'), false);
});
