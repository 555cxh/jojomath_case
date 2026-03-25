/**
 * StarDisplay 组件
 * 展示获得的星星，带有动画效果
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../constants/theme';

interface StarDisplayProps {
  earnedStars: number;     // 获得的星星数 (0-3)
  totalStars?: number;     // 总星星数，默认3
  bonusStars?: number;     // 赠送星星数，赠送星用绿色显示
  size?: number;           // 星星大小
  animated?: boolean;      // 是否带动画
  delay?: number;          // 动画延迟
}

const StarDisplay: React.FC<StarDisplayProps> = ({
  earnedStars,
  totalStars = 3,
  bonusStars = 0,
  size = 50,
  animated = true,
  delay = 0,
}) => {
  const scaleAnims = useRef(
    Array.from({ length: totalStars }, () => new Animated.Value(0))
  ).current;

  const rotateAnims = useRef(
    Array.from({ length: totalStars }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (animated) {
      // 依次弹出每颗星星
      const animations = scaleAnims.map((anim, index) => {
        return Animated.sequence([
          Animated.delay(delay + index * 300),
          Animated.parallel([
            Animated.spring(anim, {
              toValue: 1,
              friction: 4,
              tension: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnims[index], {
              toValue: 1,
              duration: 500,
              easing: Easing.elastic(1),
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.stagger(100, animations).start();
    } else {
      scaleAnims.forEach((anim) => anim.setValue(1));
    }
  }, [animated, delay]);

  const renderStar = (index: number) => {
    const isEarned = index < earnedStars;
    const isBonusStar =
      isEarned && bonusStars > 0 && index >= earnedStars - bonusStars;
    const scale = scaleAnims[index];
    const rotate = rotateAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.starContainer,
          {
            transform: [
              { scale: animated ? scale : 1 },
              { rotate: animated ? rotate : '0deg' },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.starWrapper,
            {
              width: size + 8,
              height: size + 8,
              transform: isEarned
                ? [{ perspective: 600 }, { rotateX: '16deg' }, { rotateY: '-10deg' }]
                : [{ perspective: 600 }, { rotateX: '8deg' }, { rotateY: '-6deg' }],
            },
          ]}
        >
          <Text
            style={[
              styles.starShadowText,
              {
                fontSize: size,
                lineHeight: size + 4,
                color: isEarned ? (isBonusStar ? '#1F7A37' : '#B67A00') : '#9AA4B2',
              },
            ]}
          >
            ★
          </Text>

          <Text
            style={[
              styles.starText,
              {
                fontSize: size,
                lineHeight: size + 4,
                color: isEarned
                  ? (isBonusStar ? '#41C96A' : COLORS.star)
                  : COLORS.starInactive,
              },
            ]}
          >
            ★
          </Text>

          {isEarned && (
            <Text
              style={[
                styles.starHighlightText,
                {
                  fontSize: size * 0.88,
                  lineHeight: size + 2,
                  color: isBonusStar ? '#CFFFF0' : '#FFF7B2',
                },
              ]}
            >
              ★
            </Text>
          )}
        </View>
        {isEarned && (
          <View
            style={[
              styles.glow,
              {
                width: size * 1.5,
                height: size * 1.5,
                backgroundColor: isBonusStar ? '#41C96A' : COLORS.star,
              },
            ]}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: totalStars }, (_, i) => renderStar(i))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  starContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starShadowText: {
    position: 'absolute',
    left: 3,
    top: 3,
    fontWeight: '900',
    textAlign: 'center',
    opacity: 0.9,
  },
  starText: {
    position: 'absolute',
    fontWeight: '900',
    textAlign: 'center',
  },
  starHighlightText: {
    position: 'absolute',
    left: -1,
    top: -2,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFF7B2',
    opacity: 0.85,
  },
  glow: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.3,
  },
});

export default StarDisplay;
