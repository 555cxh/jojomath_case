/**
 * PracticeCompleteScreen
 * 练习完成入口页 - 过渡动画页面
 * 用户完成练习后首先看到这个页面，然后自动转入结果反馈页
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { PracticeResultResponse, RootStackParamList } from '../types';
import { allScenarios } from '../mock/scenarios';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PracticeComplete'>;
type RouteProps = RouteProp<RootStackParamList, 'PracticeComplete'>;
const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const PracticeCompleteScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const demoScenarioIndex = route.params?.demoScenarioIndex ?? 0;
  const isContinuousPractice = route.params?.isContinuousPractice ?? false;
  const continuousPracticeCount = route.params?.continuousPracticeCount ?? 0;
  const shouldApplyBonusStar =
    (route.params?.bonusStarPending ?? false) && isContinuousPractice;

  const backgroundScale = useRef(new Animated.Value(1.06)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(backgroundScale, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
    ]).start(() => {
      const scenario = allScenarios[demoScenarioIndex % allScenarios.length];
      const baseResultData = scenario.data;
      const resultData: PracticeResultResponse = shouldApplyBonusStar
        ? {
            ...baseResultData,
            childFeedback: {
              ...baseResultData.childFeedback,
              starsEarned: baseResultData.childFeedback.starsEarned + 1,
            },
            progressUpdate: {
              ...baseResultData.progressUpdate,
              totalStars: baseResultData.progressUpdate.totalStars + 1,
            },
          }
        : {
            ...baseResultData,
            childFeedback: { ...baseResultData.childFeedback },
            progressUpdate: { ...baseResultData.progressUpdate },
          };

      navigation.replace('ResultFeedback', {
        resultData,
        continuousPracticeCount: shouldApplyBonusStar ? continuousPracticeCount : 0,
        lastRoundBonusApplied: shouldApplyBonusStar,
      });
    });
  }, [
    navigation,
    demoScenarioIndex,
    backgroundScale,
    textOpacity,
    shouldApplyBonusStar,
    continuousPracticeCount,
  ]);

  return (
    <View style={styles.container}>
      <AnimatedImageBackground
        source={require('../../assets/bell_think.png')}
        resizeMode="cover"
        style={[
          styles.background,
          {
            transform: [{ scale: backgroundScale }],
          },
        ]}
      />
      <View style={styles.overlay} />

      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.completeText}>All Done!</Text>
          <Text style={styles.subText}>Let's see how you did...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  textContainer: {
    position: 'absolute',
    top: '80%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  completeText: {
    fontSize: FONT_SIZES.huge + 10,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subText: {
    fontSize: FONT_SIZES.medium + 8,
    color: COLORS.success,
    opacity: 0.92,
    textAlign: 'center',
  },
});

export default PracticeCompleteScreen;
