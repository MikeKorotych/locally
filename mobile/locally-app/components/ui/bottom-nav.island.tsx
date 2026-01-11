import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Pressable,
  PanResponder,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Svg, Path } from 'react-native-svg';

type FlipVariant = 'icon' | 'button';
type InteractionMode = 'tap' | 'swipe';

export type BottomNavProps = {
  flipVariant?: FlipVariant;
  interactionMode?: InteractionMode;
  primaryIconName?: IconSymbolName;
  secondaryIconName?: IconSymbolName;
};

type BottomNavBarProps = MaterialTopTabBarProps & Required<BottomNavProps>;

export default function BottomNavBar(props: BottomNavBarProps) {
  const {
    state,
    navigation,
    flipVariant,
    interactionMode,
    primaryIconName,
    secondaryIconName,
  } = props;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const resolvedScheme = colorScheme ?? 'light';
  const isLight = resolvedScheme === 'light';
  const routes = state.routes.slice(0, 2);
  const activeIndex = Math.min(state.index, routes.length - 1);
  const activeRoute = routes[activeIndex];

  const animatedRotation = useSharedValue(activeIndex * 180);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ rotateY: animatedRotation.value + 'deg' }] };
  });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedRotation.value,
      [0, 90, 180],
      [1, 0, 0]
    );
    return {
      opacity,
      transform: [
        { perspective: 800 },
        { rotateY: animatedRotation.value + 'deg' },
      ],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedRotation.value,
      [0, 90, 180],
      [0, 0, 1]
    );
    return {
      opacity,
      transform: [
        { perspective: 800 },
        { rotateY: animatedRotation.value - 180 + 'deg' },
      ],
    };
  });

  useEffect(() => {
    animatedRotation.value = withTiming(activeIndex * 180, { duration: 240 });
  }, [activeIndex, animatedRotation]);

  const iconColor = isLight ? '#000' : '#fff';
  const frontIcon = (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={28}
      height={28}
      strokeWidth={1.5}
      stroke={iconColor}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </Svg>
  );
  const backIcon = (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      width={28}
      height={28}
      strokeWidth={1.5}
      stroke={iconColor}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </Svg>
  );

  const switchToIndex = (nextIndex: number) => {
    const targetIndex = Math.max(0, Math.min(nextIndex, routes.length - 1));
    const targetRoute = routes[targetIndex];
    if (!targetRoute || targetRoute.key === activeRoute.key) return;
    navigation.navigate(targetRoute.name as never);
  };

  const handlePress = () => {
    if (interactionMode === 'swipe') return;
    const nextIndex = activeIndex === 0 ? 1 : 0;
    switchToIndex(nextIndex);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => interactionMode === 'swipe',
    onStartShouldSetPanResponderCapture: () => interactionMode === 'swipe',
    onMoveShouldSetPanResponder: (_, gesture) => {
      if (interactionMode !== 'swipe') return false;
      const isHorizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy);
      return isHorizontal && Math.abs(gesture.dx) > 3;
    },
    onMoveShouldSetPanResponderCapture: (_, gesture) => {
      if (interactionMode !== 'swipe') return false;
      return Math.abs(gesture.dx) > Math.abs(gesture.dy);
    },
    onPanResponderRelease: (_, gesture) => {
      if (interactionMode !== 'swipe') return;
      if (gesture.dx > 20) {
        switchToIndex(activeIndex - 1);
      } else if (gesture.dx < -20) {
        switchToIndex(activeIndex + 1);
      }
    },
  });

  const shadowColor = isLight
    ? 'rgba(0, 0, 0, 0.6)'
    : 'rgba(255, 255, 255, 0.2)';

  const shadowRadius = isLight ? 3 : 6;

  const elevation = isLight ? 3 : 6;

  const borderColor = isLight
    ? 'rgba(0, 0, 0, 0.1)'
    : 'rgba(255, 255, 255, 0.08)';

  const buttonStyle = [
    styles.circleButton,
    {
      backgroundColor: isLight ? Colors.light.background : '#000',
    },
  ];

  return (
    <View
      pointerEvents="box-none"
      style={[styles.safeArea, { bottom: insets.bottom + 36 }]}
    >
      <Animated.View>
        <View
          style={styles.swipeZone}
          {...(interactionMode === 'swipe' ? panResponder.panHandlers : {})}
        >
          <Animated.View style={animatedStyle}>
            <Pressable
              accessibilityRole="button"
              onPress={handlePress}
              disabled={interactionMode === 'swipe'}
              style={[
                styles.shadowWrap,
                buttonStyle,
                { shadowColor, shadowRadius, borderColor, elevation },
              ]}
            >
              {flipVariant === 'icon' ? (
                <View style={styles.iconFlipWrap}>
                  <Animated.View style={[styles.iconFace, frontAnimatedStyle]}>
                    {frontIcon}
                  </Animated.View>
                  <Animated.View style={[styles.backFace, backAnimatedStyle]}>
                    {backIcon}
                  </Animated.View>
                </View>
              ) : (
                frontIcon
              )}
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 16,
    right: 16,
    // bottom set dynamically using insets
    zIndex: 100,
    alignItems: 'center',
  },
  shadowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    // shadow for iOS + elevation for Android
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    borderWidth: 1,
    borderRadius: 99,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.select({ ios: 1, android: 1 }),
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  swipeZone: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  iconFlipWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFace: {
    position: 'absolute',
    left: '2%',
    backfaceVisibility: 'hidden',
  },
  backFace: {
    position: 'absolute',
    right: '2%',
    backfaceVisibility: 'hidden',
  },
});
