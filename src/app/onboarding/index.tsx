import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { LeafMark } from '@/components/LeafMark';
import { Screen } from '@/components/Screen';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { copy, fill } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

export default function OnboardingStory() {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const page = copy.onboarding.pages[index];
  const last = index === copy.onboarding.pages.length - 1;

  function go(next: number) {
    if (reduceMotion) {
      setIndex(next);
      return;
    }
    const native = Platform.OS !== 'web';
    Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: native }).start(() => {
      setIndex(next);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: native }).start();
    });
  }

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          <Button
            label={copy.onboarding.next}
            onPress={() => {
              if (last) router.push('/onboarding/alter');
              else go(index + 1);
            }}
          />
          {index > 0 ? (
            <Button label={copy.onboarding.back} variant="ghost" onPress={() => go(index - 1)} />
          ) : null}
        </View>
      }
    >
      <AppText variant="label" color={colors.sageDeep} style={{ marginTop: 12 }}>
        {copy.appName}
      </AppText>
      <Animated.View style={{ flex: 1, opacity, justifyContent: 'flex-start', paddingTop: 28, gap: 20 }}>
        <LeafMark size={112} />
        <View
          accessibilityLabel={fill(copy.a11y.step, { current: index + 1, total: copy.onboarding.pages.length })}
          style={{ flexDirection: 'row', gap: 8 }}
        >
          {copy.onboarding.pages.map((item, dot) => (
            <View
              key={item.title}
              style={{
                width: dot === index ? 22 : 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: dot === index ? colors.orange : colors.sage,
                opacity: dot === index ? 1 : 0.45,
              }}
            />
          ))}
        </View>
        <AppText variant="display" accessibilityRole="header">
          {page.title}
        </AppText>
        <AppText variant="body">{page.body}</AppText>
        {last ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.onboarding.rulesLink}
            onPress={() => router.push('/onboarding/regeln')}
            style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
          >
            <AppText variant="label" color={colors.sageDeep}>
              {copy.onboarding.rulesLink}
            </AppText>
          </Pressable>
        ) : null}
      </Animated.View>
    </Screen>
  );
}
