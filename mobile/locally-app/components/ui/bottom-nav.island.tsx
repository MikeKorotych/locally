import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
  PanResponder,
} from 'react-native';
import { type MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';

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
  const flipAnim = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: activeIndex,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, flipAnim]);

  const rotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const iconColor = isLight ? '#000' : '#fff';
  const frontIcon = (
    <IconSymbol size={28} name={primaryIconName} color={iconColor} />
  );
  const backIcon = (
    <IconSymbol size={28} name={secondaryIconName} color={iconColor} />
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

  const borderColor = isLight
    ? 'rgba(0, 0, 0, 0.04)'
    : 'rgba(255, 255, 255, 0.08)';

  const buttonStyle = [
    styles.circleButton,
    {
      backgroundColor: isLight ? Colors.light.background : '#000',
    },
    flipVariant === 'button'
      ? { transform: [{ perspective: 800 }, { rotateY: rotation }] }
      : null,
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
          <Pressable
            accessibilityRole="button"
            onPress={handlePress}
            disabled={interactionMode === 'swipe'}
            style={[
              styles.shadowWrap,
              buttonStyle,
              { shadowColor, shadowRadius, borderColor },
            ]}
          >
            {flipVariant === 'icon' ? (
              <View style={styles.iconFlipWrap}>
                <Animated.View
                  style={[
                    styles.iconFace,
                    {
                      opacity: frontOpacity,
                      transform: [
                        { perspective: 800 },
                        { rotateY: frontRotate },
                      ],
                    },
                  ]}
                >
                  {frontIcon}
                </Animated.View>
                <Animated.View
                  style={[
                    styles.iconFace,
                    {
                      opacity: backOpacity,
                      transform: [
                        { perspective: 800 },
                        { rotateY: backRotate },
                      ],
                    },
                  ]}
                >
                  {backIcon}
                </Animated.View>
              </View>
            ) : (
              frontIcon
            )}
          </Pressable>
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
    elevation: 4,
    borderWidth: 1,
    borderRadius: 99,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.select({ ios: 0.5, android: 0 }),
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
});
