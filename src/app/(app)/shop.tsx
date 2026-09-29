import { router } from 'expo-router';
import { View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { BootMark } from '@/components/BootMark';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/i18n';
import { useJournal } from '@/lib/journal';

export default function ShopScreen() {
  const { ready, view, packs, patchSettings } = useJournal();
  if (!ready || !view) return <BootMark />;
  return (
    <AppPage>
      <TopBar title={copy.shop.title} onBack={() => router.back()} />
      <AppText variant="body">{copy.shop.body}</AppText>
      {packs.map((pack) => {
        const active = view.settings.activePackId === pack.id;
        return (
          <Card key={pack.id}>
            <View style={{ gap: 8 }}>
              <AppText variant="title">{pack.name}</AppText>
              <AppText variant="body">{pack.description}</AppText>
              <AppText variant="label">{pack.priceLabel}</AppText>
              <AppText variant="muted">{copy.shop.examples}</AppText>
              <AppText variant="body">{pack.tasks[0]?.text}</AppText>
              <AppText variant="body">{pack.tasks[1]?.text}</AppText>
              <Button label={copy.shop.buy} disabled onPress={() => undefined} />
              <Button
                label={active ? copy.shop.active : copy.shop.tryLocal}
                variant={active ? 'primary' : 'secondary'}
                onPress={() => patchSettings({ activePackId: active ? null : pack.id })}
              />
              <AppText variant="muted">{copy.shop.tryNote}</AppText>
            </View>
          </Card>
        );
      })}
    </AppPage>
  );
}
