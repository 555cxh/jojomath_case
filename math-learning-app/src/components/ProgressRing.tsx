/**
 * ProgressRing 组件
 * 圆形进度条，展示经验值/等级进度
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants/theme';

interface ProgressRingProps {
  progress: number;        // 0-100 百分比
  size?: number;           // 环形大小
  strokeWidth?: number;    // 线条宽度
  color?: string;          // 进度条颜色
  backgroundColor?: string;
  label?: string;          // 中心文字
  sublabel?: string;       // 副标题
  animated?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 12,
  color = COLORS.primary,
  backgroundColor = COLORS.progressTrack,
  label,
  sublabel,
  animated = true,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 使用View模拟进度环（简化版，实际可用react-native-svg）
  const progressAngle = (progress / 100) * 360;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 背景圆环 */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />

      {/* 进度指示器（简化表示） */}
      <View
        style={[
          styles.progressIndicator,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: progress > 25 ? color : 'transparent',
            borderRightColor: progress > 50 ? color : 'transparent',
            borderBottomColor: progress > 75 ? color : 'transparent',
            borderLeftColor: color,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />

      {/* 中心内容 */}
      <View style={styles.centerContent}>
        {label && <Text style={styles.label}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  progressIndicator: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sublabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default ProgressRing;
