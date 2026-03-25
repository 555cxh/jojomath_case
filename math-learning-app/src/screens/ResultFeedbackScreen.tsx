/**
 * ResultFeedbackScreen
 * 结果反馈页 - 核心页面
 * 同时承载孩子视角（情感激励）和家长视角（数据洞察）
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  StarDisplay,
  MascotBubble,
  ActionButton,
  AchievementBadge,
  ParentInsightCard,
} from '../components';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  PERFORMANCE_CONFIG,
} from '../constants/theme';
import { RootStackParamList, PracticeResultResponse } from '../types';

const { height: windowHeight } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResultFeedback'>;
type RouteProps = RouteProp<RootStackParamList, 'ResultFeedback'>;

const ResultFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { resultData } = route.params;
  const continuousPracticeCount = route.params?.continuousPracticeCount ?? 0;
  const giftedBonusStars = route.params?.lastRoundBonusApplied ? 1 : 0;

  const [showParentInsight, setShowParentInsight] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'stars' | 'message' | 'actions'>('stars');

  // 动画值
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const continueBonusSpinAnim = useRef(new Animated.Value(0)).current;

  const { childFeedback, parentInsight, progressUpdate, questionResults, nextActions } = resultData;
  const performanceConfig = PERFORMANCE_CONFIG[childFeedback.performanceTier];
  const totalStarsForDisplay = Math.max(3, childFeedback.starsEarned);
  const correctCount = questionResults.filter((q) => q.isCorrect).length;
  const verticalShift = windowHeight * 0.17;
  const backgroundSource =
    correctCount === 3
      ? require('../../assets/jojo_3.png')
      : correctCount === 2
      ? require('../../assets/jojo_2.png')
      : require('../../assets/jojo_1.png');
  const gradientColors =
    childFeedback.performanceTier === 'excellent'
      ? ['#F3FFF9', '#C8F7E7']
      : childFeedback.performanceTier === 'good'
      ? ['#F7F4FF', '#DCCFFF']
      : ['#FFF9EA', '#FFDFA9'];

  useEffect(() => {
    // 分阶段动画
    Animated.sequence([
      // 头部和星星
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1500), // 等待星星动画
      // 消息区域
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      // 动作按钮
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationPhase('actions');
    });
  }, []);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(continueBonusSpinAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinLoop.start();

    return () => {
      spinLoop.stop();
      continueBonusSpinAnim.setValue(0);
    };
  }, [continueBonusSpinAnim]);

  // 处理动作按钮点击
  const handleActionPress = (actionType: string) => {
    // 这里应该上报事件
    console.log('Action clicked:', actionType);

    switch (actionType) {
      case 'continue_practice':
        // 返回首页或开始新一轮练习
        navigation.navigate('NextPractice', {
          isContinuousPractice: true,
          continuousPracticeCount: continuousPracticeCount + 1,
          bonusStarPending: true,
        });
        break;
      case 'view_details':
        navigation.navigate('DetailReview', {
          questionResults,
          childFeedback,
          continuousPracticeCount,
        });
        break;
      case 'view_rewards':
        navigation.navigate('RewardCenter', {
          progressInfo: progressUpdate,
          newAchievement: childFeedback.newAchievement,
          continuousPracticeCount,
        });
        break;
      case 'take_break':
        // 返回主页
        navigation.navigate('NextPractice', {
          isContinuousPractice: false,
          continuousPracticeCount: 0,
          bonusStarPending: false,
        });
        break;
      default:
        break;
    }
  };

  // 获取表现标题
  const getPerformanceTitle = () => {
    switch (childFeedback.performanceTier) {
      case 'excellent':
        return 'Amazing!';
      case 'good':
        return 'Great Job!';
      case 'keep_trying':
        return 'Nice Try!';
      default:
        return 'Well Done!';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientUnderlay}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={backgroundSource}
            resizeMode="cover"
            style={[styles.scrollBackground, { minHeight: windowHeight + verticalShift }]}
          >
            <View style={{ paddingTop: verticalShift }}>
        {/* 头部区域 - 表现标题 + 星星 */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.performanceTitle, { color: performanceConfig.color }]}>
            {getPerformanceTitle()}
          </Text>

          {/* 正确数/总数 */}
          <Text style={styles.scoreText}>
            {questionResults.filter((q) => q.isCorrect).length} / {questionResults.length} correct
          </Text>

          {/* 星星展示 */}
          <View style={styles.starsContainer}>
            <StarDisplay
              earnedStars={childFeedback.starsEarned}
              totalStars={totalStarsForDisplay}
              bonusStars={giftedBonusStars}
              size={60}
              animated={true}
              delay={500}
            />
          </View>

          {/* 连续天数与个人最佳标签（同一行） */}
          {(childFeedback.streakDays > 1 || childFeedback.isPersonalBest) && (
            <View style={styles.badgesRow}>
              {childFeedback.streakDays > 1 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>
                    🔥 {childFeedback.streakDays} Day Streak!
                  </Text>
                </View>
              )}

              {childFeedback.isPersonalBest && (
                <View style={styles.personalBestBadge}>
                  <Text style={styles.personalBestText}>🏆 Personal Best!</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* 吉祥物消息区域 */}
        <Animated.View
          style={[
            styles.messageSection,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateX: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MascotBubble
            message={childFeedback.mascotMessage}
            performanceTier={childFeedback.performanceTier}
            animated={true}
            delay={200}
          />
        </Animated.View>

        {/* 新成就展示 */}
        {childFeedback.hasNewAchievement && childFeedback.newAchievement && (
          <Animated.View
            style={[
              styles.achievementSection,
              { opacity: contentAnim },
            ]}
          >
            <AchievementBadge
              achievement={childFeedback.newAchievement}
              animated={true}
              delay={1000}
            />
          </Animated.View>
        )}

        {/* 进度条 - 经验值 */}
        <Animated.View
          style={[
            styles.progressSection,
            { opacity: contentAnim },
          ]}
        >
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Level {progressUpdate.currentLevel}</Text>
              <Text style={styles.xpText}>+{progressUpdate.xpEarned} XP</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(progressUpdate.currentXP / progressUpdate.nextLevelXP) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressXpLabel}>
                {progressUpdate.currentXP} / {progressUpdate.nextLevelXP}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 家长洞察区域（可折叠） */}
        <Animated.View
          style={[
            styles.parentSection,
            { opacity: contentAnim },
          ]}
        >
          <ParentInsightCard
            insight={parentInsight}
            isExpanded={showParentInsight}
            onToggle={() => setShowParentInsight(!showParentInsight)}
          />
        </Animated.View>

          {/* 动作按钮区域 */}
          <Animated.View
            style={[
              styles.actionsSection,
              {
                opacity: actionsAnim,
                transform: [
                  {
                    translateY: actionsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
          {nextActions.map((action, index) => (
            <View key={action.actionType} style={styles.actionButtonWrapper}>
              <ActionButton
                label={action.label}
                variant={action.isPrimary ? 'primary' : 'secondary'}
                size={action.isPrimary ? 'large' : 'medium'}
                fullWidth
                onPress={() => handleActionPress(action.actionType)}
                icon={
                  action.actionType === 'continue_practice'
                    ? '🚀'
                    : action.actionType === 'view_rewards'
                    ? '⭐'
                    : action.actionType === 'view_details'
                    ? '📋'
                    : action.actionType === 'take_break'
                    ? '☕'
                    : undefined
                }
                rightContent={
                  action.actionType === 'continue_practice' ? (
                    <Animated.View
                      style={[
                        styles.continueBonusBadge,
                        {
                          transform: [
                            {
                              rotate: continueBonusSpinAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.continueBonusText}>⭐+1</Text>
                    </Animated.View>
                  ) : undefined
                }
              />
            </View>
          ))}
          </Animated.View>
            </View>
          </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientUnderlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  performanceTitle: {
    fontSize: FONT_SIZES.huge,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  scoreText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    marginVertical: SPACING.md,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  streakBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  streakText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: '#FF9800',
  },
  personalBestBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  personalBestText: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.success,
  },
  messageSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  achievementSection: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  progressSection: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  progressCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  xpText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressXpLabel: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  parentSection: {
    marginVertical: SPACING.sm,
  },
  actionsSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  actionButtonWrapper: {
    marginBottom: SPACING.xs,
  },
  continueBonusBadge: {
    backgroundColor: '#FFF5CC',
    borderColor: '#FFD166',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  continueBonusText: {
    fontSize: FONT_SIZES.tiny,
    fontWeight: '800',
    color: '#B35A00',
  },
});

export default ResultFeedbackScreen;
