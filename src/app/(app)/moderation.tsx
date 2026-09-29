import { router } from 'expo-router';
import { View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TopBar } from '@/components/TopBar';
import { BootMark } from '@/components/BootMark';
import { copy } from '@/i18n';
import { useJournal } from '@/lib/journal';

export default function ModerationScreen() {
  const { ready, view, removeTask, closeReport } = useJournal();
  if (!ready || !view) return <BootMark />;
  return (
    <AppPage>
      <TopBar title={copy.modScreen.title} onBack={() => router.back()} />
      <AppText variant="body">{copy.modScreen.note}</AppText>
      {view.reports.length === 0 ? <AppText variant="muted">{copy.modScreen.empty}</AppText> : null}
      {view.reports.map((report) => (
        <Card key={report.id}>
          <View style={{ gap: 8 }}>
            <AppText variant="label">{copy.report[report.reason]}</AppText>
            <AppText variant="body">{report.text}</AppText>
            <AppText variant="muted">{report.handled ? copy.modScreen.handled : copy.modScreen.open}</AppText>
            <Button label={copy.modScreen.remove} variant="secondary" onPress={() => removeTask(report.taskKey)} />
            <Button label={copy.modScreen.close} variant="ghost" onPress={() => closeReport(report.id)} />
          </View>
        </Card>
      ))}
    </AppPage>
  );
}
