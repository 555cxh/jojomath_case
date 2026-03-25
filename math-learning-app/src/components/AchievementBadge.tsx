/**
 * AchievementBadge 组件
 * 展示新获得的成就，带有闪光动画
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING } from '../constants/theme';
import { Achievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  animated?: boolean;
  delay?: number;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  animated = true,
  delay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const entryAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (animated) {
      // 弹出动画
      entryAnimRef.current = Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
        ]),
      ]);
      entryAnimRef.current.start();

      // 光晕脉冲动画（更柔和，减少卡顿感）
      glowLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 850,
            easing: Easing.inOut(Easing.quad),
            isInteraction: false,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 850,
            easing: Easing.inOut(Easing.quad),
            isInteraction: false,
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      );
      glowLoopRef.current.start();
    } else {
      scaleAnim.setValue(1);
      glowAnim.setValue(0);
    }

    return () => {
      entryAnimRef.current?.stop();
      glowLoopRef.current?.stop();
    };
  }, [animated, delay]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.42],
  });

  // 根据成就类型选择图标
  const getAchievementIcon = () => {
    if (achievement.iconUrl.includes('trophy')) return '🏆';
    if (achievement.iconUrl.includes('star')) return '⭐';
    if (achievement.iconUrl.includes('fire')) return '🔥';
    if (achievement.iconUrl.includes('medal')) return '🥇';
    return '🎖️';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }, { rotate }],
        },
      ]}
    >
      <View style={styles.badgeWrapper}>
        {/* 仅沿方框边缘循环发光 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* 徽章主体 */}
        <View style={styles.badge}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getAchievementIcon()}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.newLabel}>NEW!</Text>
            <Text style={styles.name}>{achievement.name}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
          </View>
        </View>
      </View>

      {/* 闪光粒子 */}
      <View style={styles.sparkles}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
        <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  badgeWrapper: {
    position: 'relative',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 3,
    borderColor: COLORS.star,
    backgroundColor: 'transparent',
    shadowColor: COLORS.star,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.star,
    shadowColor: COLORS.star,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  newLabel: {
    fontSize: FONT_SIZES.tiny,
    fontWeight: 'bold',
    color: COLORS.love,
    marginBottom: 2,
  },
  name: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
    top: -10,
    right: 10,
  },
  sparkle2: {
    top: 5,
    left: -5,
  },
  sparkle3: {
    bottom: -5,
    right: 20,
  },
});

export default AchievementBadge;
