/**
 * MascotBubble 组件
 * 可爱小浣熊吉祥物 + 对话气泡
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING } from '../constants/theme';
import { PerformanceTier } from '../types';

interface MascotBubbleProps {
  message: string;
  performanceTier: PerformanceTier;
  animated?: boolean;
  delay?: number;
}

const MascotBubble: React.FC<MascotBubbleProps> = ({
  message,
  performanceTier,
  animated = true,
  delay = 0,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // 吉祥物弹跳动画
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // 气泡出现动画
      Animated.sequence([
        Animated.delay(delay + 300),
        Animated.spring(bubbleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      bounceAnim.setValue(1);
      bubbleAnim.setValue(1);
    }
  }, [animated, delay]);

  return (
    <View style={styles.container}>
      {/* 吉祥物（Piggy） */}
      <Animated.View
        style={[
          styles.mascotContainer,
          {
            transform: [
              { scale: bounceAnim },
              {
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/piggy.png')}
          style={styles.mascotImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 对话气泡 */}
      <Animated.View
        style={[
          styles.bubble,
          {
            opacity: bubbleAnim,
            transform: [
              { scale: bubbleAnim },
              {
                translateX: bubbleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.bubbleText}>{message}</Text>
        <View style={styles.bubbleArrow} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    marginTop: -6,
  },
  mascotContainer: {
    marginRight: SPACING.sm,
  },
  mascotImage: {
    width: 86,
    height: 104,
  },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginLeft: SPACING.sm,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  bubbleText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: 24,
    fontWeight: '500',
  },
  bubbleArrow: {
    position: 'absolute',
    left: -10,
    bottom: 20,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: COLORS.cardBackground,
  },
});

export default MascotBubble;
