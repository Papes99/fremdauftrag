import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BootMark } from '@/components/BootMark';
import { copy, fill } from '@/i18n';
import { formatDay } from '@/lib/clock';
import { useJournal } from '@/lib/journal';
import { useTheme } from '@/theme/ThemeProvider';

export default function WriteScreen() {
  const { colors, fonts } = useTheme();
  const { ready, view, editLine, newHints, submit } = useJournal();
  const [checking, setChecking] = useState(false);
  if (!ready || !view) return <BootMark />;
  const draft = view.draft;

  async function onSubmit() {
    if (checking) return;
    setChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    submit();
    setChecking(false);
  }

  return (
    <AppPage nav>
      <AppText variant="title" accessibilityRole="header">
        {copy.write.title}
      </AppText>
      <AppText variant="body">{copy.write.rule}</AppText>
      {view.lock !== 'none' ? (
        <Card>
          <AppText variant="body">
            {view.lock === 'ban'
              ? copy.write.lockBan
              : fill(copy.write.lockWeek, { date: formatDay(view.writeLockedUntil ?? view.today) })}
          </AppText>
        </Card>
      ) : null}
      {view.echo ? (
        <Card>
          <AppText variant="body">{fill(copy.write.echoCount, view.echo)}</AppText>
        </Card>
      ) : view.yesterdayWaiting ? (
        <Card>
          <AppText variant="body">{copy.write.echoNone}</AppText>
        </Card>
      ) : null}
      <AppText variant="muted">{copy.write.hint}</AppText>
      {draft?.lines.map((line, index) => {
        const reason = line.key ? copy.moderation.reasons[line.key] : '';
        return (
          <View key={index} style={{ gap: 8 }}>
            <TextInput
              accessibilityLabel={fill(copy.write.field, { index: index + 1 })}
              value={line.text}
              editable={view.lock === 'none'}
              onChangeText={(text) => editLine(index, text)}
              placeholder={draft.hints[index] || copy.write.placeholder}
              placeholderTextColor={colors.muted}
              multiline
              maxLength={140}
              style={{
                minHeight: 96,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: line.status === 'rejected' ? colors.danger : colors.line,
                backgroundColor: colors.card,
                padding: 14,
                fontFamily: fonts.regular,
                fontSize: 18,
                color: colors.text,
                textAlignVertical: 'top',
              }}
            />
            <AppText variant="muted">{fill(copy.write.counter, { count: line.text.length })}</AppText>
            {line.status === 'rejected' ? (
              <AppText variant="body" color={colors.danger}>
                {fill(copy.write.rejected, { reason })}
              </AppText>
            ) : null}
            {line.status === 'pending' ? <AppText variant="body">{copy.write.pending}</AppText> : null}
          </View>
        );
      })}
      {view.lock === 'none' ? (
        <View style={{ gap: 10 }}>
          <Button label={copy.write.idea} variant="secondary" onPress={newHints} />
          <Button label={checking ? copy.write.checking : copy.write.submit} onPress={onSubmit} disabled={checking} />
        </View>
      ) : null}
    </AppPage>
  );
}
