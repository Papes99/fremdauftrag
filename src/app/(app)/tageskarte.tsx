import { useState } from 'react';
import { View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { LeafMark } from '@/components/LeafMark';
import { BootMark } from '@/components/BootMark';
import { copy, fill } from '@/i18n';
import { formatDay } from '@/lib/clock';
import { cardLines } from '@/lib/card';
import { hashString } from '@/lib/journalLogic';
import { useJournal } from '@/lib/journal';

const posters = [
  { bg: '#24543C', fg: '#F3EDE2', accent: '#E8894A' },
  { bg: '#E8894A', fg: '#1C2820', accent: '#24543C' },
  { bg: '#F7F1E6', fg: '#24543C', accent: '#E8894A' },
  { bg: '#1A211C', fg: '#F3EDE2', accent: '#A8C7B2' },
];

function drawPoster(input: { day: string; done: number; streak: number; wrote: boolean; quote: string; colors: (typeof posters)[number] }) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const lines = cardLines({ done: input.done, streak: input.streak, wrote: input.wrote, quote: input.quote });
  ctx.fillStyle = input.colors.bg;
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = input.colors.fg;
  ctx.font = '700 64px Nunito, sans-serif';
  ctx.fillText(lines[0] ?? 'Fremdauftrag', 80, 220);
  ctx.font = '400 42px Nunito, sans-serif';
  wrap(ctx, formatDay(input.day), 80, 320, 900, 56);
  ctx.font = '800 120px Nunito, sans-serif';
  ctx.fillText(lines[1] ?? '', 80, 620);
  ctx.font = '600 48px Nunito, sans-serif';
  ctx.fillText(lines[2] ?? '', 80, 760);
  if (input.wrote) {
    ctx.font = '600 42px Nunito, sans-serif';
    ctx.fillText(copy.card.wrote, 80, 840);
  }
  ctx.font = '400 54px Nunito, sans-serif';
  wrap(ctx, input.quote, 80, 980, 900, 72);
  ctx.font = '400 36px Nunito, sans-serif';
  ctx.fillText(copy.card.footer, 80, 1760);
  return canvas.toDataURL('image/png');
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, line: number) {
  const words = text.split(' ');
  let row = '';
  let top = y;
  for (const word of words) {
    const next = row ? `${row} ${word}` : word;
    if (ctx.measureText(next).width > max) {
      ctx.fillText(row, x, top);
      row = word;
      top += line;
    } else row = next;
  }
  if (row) ctx.fillText(row, x, top);
}

function download(dataUrl: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'fremdauftrag-tageskarte.png';
  link.click();
}

export default function CardScreen() {
  const { ready, view } = useJournal();
  const [note, setNote] = useState<string | null>(null);
  if (!ready || !view) return <BootMark />;
  const done = view.assignment?.tasks.filter((task) => task.status === 'done').length ?? 0;
  const colors = posters[hashString(view.today) % posters.length]!;
  const quote = copy.card.quotes[hashString(`${view.today}:quote`) % copy.card.quotes.length]!;

  async function act(kind: 'share' | 'save') {
    const dataUrl = drawPoster({ day: view!.today, done, streak: view!.streak, wrote: view!.wroteToday, quote, colors });
    if (!dataUrl) {
      setNote(copy.card.noImage);
      return;
    }
    if (kind === 'share' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'fremdauftrag-tageskarte.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: copy.appName });
          return;
        }
      } catch {
        // Teilen abgebrochen oder nicht möglich. Dann speichern.
      }
    }
    download(dataUrl);
    setNote(copy.card.saved);
  }

  return (
    <AppPage>
      <AppText variant="title" accessibilityRole="header">
        {copy.card.title}
      </AppText>
      <View
        accessibilityLabel={copy.card.title}
        style={{
          alignSelf: 'center',
          width: '100%',
          maxWidth: 360,
          aspectRatio: 9 / 16,
          borderRadius: 28,
          backgroundColor: colors.bg,
          padding: 28,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 8 }}>
          <AppText variant="label" color={colors.fg}>
            {copy.appName}
          </AppText>
          <AppText variant="muted" color={colors.fg}>
            {formatDay(view.today)}
          </AppText>
        </View>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={{ opacity: index < done ? 1 : 0.35 }}>
                <LeafMark size={48} />
              </View>
            ))}
          </View>
          <AppText variant="title" color={colors.fg}>
            {fill(copy.card.count, { done })}
          </AppText>
          <AppText variant="label" color={colors.fg}>
            {fill(copy.card.streak, { count: view.streak })}
          </AppText>
          {view.wroteToday ? (
            <AppText variant="label" color={colors.accent}>
              {copy.card.wrote}
            </AppText>
          ) : null}
          <AppText variant="body" color={colors.fg}>
            {quote}
          </AppText>
        </View>
        <AppText variant="muted" color={colors.accent}>
          {copy.card.footer}
        </AppText>
      </View>
      <Button label={copy.card.share} onPress={() => act('share')} />
      <Button label={copy.card.save} variant="secondary" onPress={() => act('save')} />
      {note ? <AppText variant="muted">{note}</AppText> : null}
      <AppText variant="muted">{copy.card.noTasks}</AppText>
    </AppPage>
  );
}
