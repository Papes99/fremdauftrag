import { router } from 'expo-router';
import { View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/i18n';
import { useJournal } from '@/lib/journal';

export default function ShopScreen() {
  const { packs } = useJournal();
  return (
    <AppPage>
      <TopBar title={copy.shop.title} onBack={() => router.back()} />
      <AppText variant="body">{copy.shop.body}</AppText>
      {packs.map((pack) => (
        <Card key={pack.id}>
          <View style={{ gap: 8 }}>
            <AppText variant="title">{pack.name}</AppText>
            <AppText variant="body">{pack.description}</AppText>
            <AppText variant="label">{pack.priceLabel}</AppText>
            <AppText variant="muted">{copy.shop.examples}</AppText>
            <AppText variant="body">{pack.tasks[0]?.text}</AppText>
            <AppText variant="body">{pack.tasks[1]?.text}</AppText>
            <Button label={copy.shop.buy} disabled onPress={() => undefined} />
          </View>
        </Card>
      ))}
    </AppPage>
  );
}
