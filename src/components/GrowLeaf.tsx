import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { LeafMark } from '@/components/LeafMark';
import { useReduceMotion } from '@/hooks/useReduceMotion';

export function GrowLeaf({ active }: { active: boolean }) {
  const reduce = useReduceMotion();
  const scale = useRef(new Animated.Value(reduce ? 1 : 0.35)).current;

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      scale.setValue(1);
      return;
    }
    scale.setValue(0.35);
    Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, [active, reduce, scale]);

  if (!active) return null;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <LeafMark size={40} />
    </Animated.View>
  );
}
