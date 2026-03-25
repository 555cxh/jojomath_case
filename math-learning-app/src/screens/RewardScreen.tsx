/**
 * RewardScreen
 * 奖励/进度中心页 - 展示累计成就和进度
 * 让孩子感受到成就感，让家长看到长期进步
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActionButton, AchievementBadge } from '../components';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../constants/theme';
import { RootStackParamList, ProgressInfo, Achievement } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RewardCenter'>;
type RouteProps = RouteProp<RootStackParamList, 'RewardCenter'>;

const RewardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { progressInfo, newAchievement, continuousPracticeCount = 0 } = route.params;

  const starAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.spring(starAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(levelAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 模拟的历史成就列表
  const pastAchievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first practice',
      iconUrl: 'medal',
      earnedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Week Warrior',
      description: 'Practice for 7 days in a row',
      iconUrl: 'fire',
      earnedAt: '2024-01-22',
    },
    {
      id: '3',
      name: 'Star Collector',
      description: 'Earn 100 stars',
      iconUrl: 'star',
      earnedAt: '2024-02-01',
    },
  ];

  const getAchievementIcon = (iconUrl: string) => {
    if (iconUrl.includes('trophy')) return '🏆';
    if (iconUrl.includes('star')) return '⭐';
    if (iconUrl.includes('fire')) return '🔥';
    if (iconUrl.includes('medal')) return '🥇';
    return '🎖️';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 星星总数展示 */}
        <Animated.View
          style={[
            styles.starSection,
            {
              opacity: starAnim,
              transform: [{ scale: starAnim }],
            },
          ]}
        >
          <View style={styles.starCard}>
            <Text style={styles.starEmoji}>⭐</Text>
            <Text style={styles.totalStarsNumber}>{progressInfo.totalStars}</Text>
            <Text style={styles.totalStarsLabel}>Total Stars</Text>
          </View>
        </Animated.View>

        {/* 等级和经验值 */}
        <Animated.View
          style={[
            styles.levelSection,
            {
              opacity: levelAnim,
              transform: [
                {
                  translateY: levelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{progressInfo.currentLevel}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level {progressInfo.currentLevel}</Text>
                <Text style={styles.levelSubtitle}>Math Explorer</Text>
              </View>
            </View>

            {/* 经验值进度条 */}
            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>Experience Points</Text>
                <Text style={styles.xpValue}>
                  {progressInfo.currentXP} / {progressInfo.nextLevelXP}
                </Text>
              </View>
              <View style={styles.xpBarTrack}>
                <View
                  style={[
                    styles.xpBarFill,
                    {
                      width: `${(progressInfo.currentXP / progressInfo.nextLevelXP) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.xpToNext}>
                {progressInfo.nextLevelXP - progressInfo.currentXP} XP to Level{' '}
                {progressInfo.currentLevel + 1}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 统计数据 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>My Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📝</Text>
              <Text style={styles.statNumber}>{progressInfo.totalQuestionsCompleted}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statNumber}>{progressInfo.totalStars}</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statNumber}>{progressInfo.currentLevel}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* 新获得的成就 */}
        {newAchievement && (
          <View style={styles.newAchievementSection}>
            <Text style={styles.sectionTitle}>New Achievement!</Text>
            <AchievementBadge
              achievement={newAchievement}
              animated={true}
              delay={500}
            />
          </View>
        )}

        {/* 历史成就 */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>My Achievements</Text>
          <View style={styles.achievementsList}>
            {pastAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementEmoji}>
                    {getAchievementIcon(achievement.iconUrl)}
                  </Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>
                    {achievement.description}
                  </Text>
                </View>
                <Text style={styles.achievementCheck}>✓</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 下一个目标提示 */}
        <View style={styles.nextGoalSection}>
          <View style={styles.nextGoalCard}>
            <Text style={styles.nextGoalEmoji}>🎯</Text>
            <View style={styles.nextGoalContent}>
              <Text style={styles.nextGoalTitle}>Next Goal</Text>
              <Text style={styles.nextGoalText}>
                Earn 50 more stars to unlock "Super Star" badge!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.bottomActions}>
        <ActionButton
          label="Keep Playing!"
          variant="primary"
          size="large"
          fullWidth
          icon="🚀"
          rightContent={
            <View style={styles.continueBonusBadge}>
              <Text style={styles.continueBonusText}>⭐+1</Text>
            </View>
          }
          onPress={() =>
            navigation.navigate('NextPractice', {
              isContinuousPractice: true,
              continuousPracticeCount: continuousPracticeCount + 1,
              bonusStarPending: true,
            })
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.progressTrack,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  starSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  starCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.star,
    width: '60%',
  },
  starEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  totalStarsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalStarsLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  levelSection: {
    marginBottom: SPACING.lg,
  },
  levelCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  levelNumber: {
    fontSize: FONT_SIZES.huge,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  levelSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  xpSection: {},
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  xpLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  xpValue: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  xpBarTrack: {
    height: 12,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  xpToNext: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statNumber: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.textSecondary,
  },
  newAchievementSection: {
    marginBottom: SPACING.lg,
  },
  achievementsSection: {
    marginBottom: SPACING.lg,
  },
  achievementsList: {
    gap: SPACING.sm,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementEmoji: {
    fontSize: 22,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  achievementDesc: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  achievementCheck: {
    fontSize: 18,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  nextGoalSection: {
    marginBottom: SPACING.lg,
  },
  nextGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    borderStyle: 'dashed',
  },
  nextGoalEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  nextGoalContent: {
    flex: 1,
  },
  nextGoalTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nextGoalText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  bottomActions: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.progressTrack,
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

export default RewardScreen;
