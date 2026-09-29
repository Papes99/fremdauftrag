import { useState } from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { GrowLeaf } from '@/components/GrowLeaf';
import { copy, fill } from '@/i18n';
import type { ReportReason } from '@/lib/journalLogic';
import type { VisibleTask } from '@/lib/journalLogic';
import { pickLocalPhoto, type PhotoSource } from '@/lib/photo';
import { useTheme } from '@/theme/ThemeProvider';

const reasons: ReportReason[] = ['unangemessen', 'gefaehrlich', 'spam', 'anderes'];

type Props = {
  task: VisibleTask;
  onStatus: (status: 'done' | 'skipped') => void;
  onNote: (note: string) => void;
  onPhoto: (photo: string | null) => void;
  onReport: (reason: ReportReason) => 'saved' | 'duplicate' | 'replaced';
};

export function TaskCard({ task, onStatus, onNote, onPhoto, onReport }: Props) {
  const { colors, fonts } = useTheme();
  const [reporting, setReporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const open = task.status === 'open';
  const source =
    task.source === 'sponsor' && task.sponsorName
      ? fill(copy.home.sponsor, { name: task.sponsorName })
      : copy.home.sources[task.source];

  const [choosingPhoto, setChoosingPhoto] = useState(false);

  async function choosePhoto(source: PhotoSource) {
    const picked = await pickLocalPhoto(source);
    if (picked === 'big') {
      setMessage(copy.home.photoBig);
      return;
    }
    if (picked === 'denied') {
      setMessage(copy.home.photoDenied);
      return;
    }
    if (picked === 'cancel') return;
    onPhoto(picked);
    setMessage(null);
    setChoosingPhoto(false);
  }

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.line,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <AppText variant="label" color={colors.sageDeep} style={{ flex: 1 }}>
          {source}
        </AppText>
        <GrowLeaf active={task.status === 'done'} />
      </View>
      <AppText variant="title">{task.text}</AppText>
      {task.replaced ? <AppText variant="muted">{copy.home.replaced}</AppText> : null}
      <AppText variant="muted">{copy.home.voluntary}</AppText>
      {task.status === 'done' ? <AppText variant="body">{copy.home.donePraise}</AppText> : null}
      {task.status === 'skipped' ? <AppText variant="body">{copy.home.skipPraise}</AppText> : null}
      {task.status === 'expired' ? <AppText variant="muted">{copy.home.expired}</AppText> : null}
      <TextInput
        accessibilityLabel={copy.home.note}
        value={task.note}
        onChangeText={onNote}
        placeholder={copy.home.note}
        placeholderTextColor={colors.muted}
        multiline
        maxLength={280}
        style={{
          minHeight: 72,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 12,
          fontFamily: fonts.regular,
          fontSize: 17,
          color: colors.text,
          textAlignVertical: 'top',
        }}
      />
      {task.photo ? (
        <Image
          source={{ uri: task.photo }}
          accessibilityLabel={copy.home.photo}
          style={{ width: '100%', height: 180, borderRadius: 16 }}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={task.photo ? copy.home.photoRemove : copy.home.photo}
        onPress={() => (task.photo ? onPhoto(null) : setChoosingPhoto(true))}
        style={{ minHeight: 48, justifyContent: 'center' }}
      >
        <AppText variant="label" color={colors.sageDeep}>
          {task.photo ? copy.home.photoRemove : copy.home.photo}
        </AppText>
      </Pressable>
      {choosingPhoto && !task.photo ? (
        <View style={{ gap: 8 }}>
          <AppText variant="muted">{copy.home.photoExplain}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={copy.home.photoCamera} onPress={() => choosePhoto('camera')} style={{ minHeight: 48, justifyContent: 'center' }}>
            <AppText variant="label">{copy.home.photoCamera}</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={copy.home.photoLibrary} onPress={() => choosePhoto('library')} style={{ minHeight: 48, justifyContent: 'center' }}>
            <AppText variant="label">{copy.home.photoLibrary}</AppText>
          </Pressable>
        </View>
      ) : null}
      {message ? <AppText variant="muted">{message}</AppText> : null}
      {reporting ? (
        <View style={{ gap: 8 }}>
          <AppText variant="label">{copy.home.reportTitle}</AppText>
          {reasons.map((reason) => (
            <Pressable
              key={reason}
              accessibilityRole="button"
              accessibilityLabel={copy.report[reason]}
              onPress={() => {
                const result = onReport(reason);
                setReporting(false);
                setMessage(
                  result === 'replaced'
                    ? copy.home.reportReplaced
                    : result === 'duplicate'
                      ? copy.home.reportDuplicate
                      : copy.home.reportSaved,
                );
              }}
              style={{
                minHeight: 48,
                borderRadius: 14,
                justifyContent: 'center',
                paddingHorizontal: 14,
                backgroundColor: colors.sageSoft,
              }}
            >
              <AppText variant="label">{copy.report[reason]}</AppText>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Action label={copy.home.done} disabled={!open && task.status !== 'skipped'} onPress={() => onStatus('done')} primary />
          <Action label={copy.home.skip} disabled={!open && task.status !== 'done'} onPress={() => onStatus('skipped')} />
          <Action label={copy.home.report} disabled={task.status === 'expired'} onPress={() => setReporting(true)} />
        </View>
      )}
    </View>
  );
}

function Action({
  label,
  onPress,
  disabled,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? colors.orange : colors.sageSoft,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <AppText variant="label" color={primary ? colors.onAccent : colors.sageDeep}>
        {label}
      </AppText>
    </Pressable>
  );
}
