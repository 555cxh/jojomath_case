/**
 * ParentInsightCard 组件
 * 为家长展示本轮学习的关键数据洞察
 * 设计原则：信息密度高但仍然清晰可读
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ParentInsight } from '../types';

interface ParentInsightCardProps {
  insight: ParentInsight;
  onToggle?: () => void;
  isExpanded?: boolean;
}

const ParentInsightCard: React.FC<ParentInsightCardProps> = ({
  insight,
  onToggle,
  isExpanded = false,
}) => {
  // 箭头指示（正向/负向变化）
  const getChangeIndicator = (value: number, isTimeChange = false) => {
    if (value === 0) return { icon: '—', color: COLORS.textSecondary };
    if (isTimeChange) {
      // 时间减少是好事
      return value < 0
        ? { icon: '↓', color: COLORS.success }
        : { icon: '↑', color: COLORS.warning };
    }
    return value > 0
      ? { icon: '↑', color: COLORS.success }
      : { icon: '↓', color: COLORS.warning };
  };

  const accuracyChange = getChangeIndicator(insight.accuracyChange);
  const timeChange = getChangeIndicator(insight.timeChange, true);

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>👨‍👩‍👧</Text>
          <Text style={styles.headerTitle}>Learning Insights</Text>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {/* 核心数据（始终显示） */}
      <View style={styles.statsRow}>
        {/* 正确率 */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{insight.accuracyPercent}%</Text>
          <View style={styles.changeIndicator}>
            <Text style={[styles.changeText, { color: accuracyChange.color }]}>
              {accuracyChange.icon} {Math.abs(insight.accuracyChange)}%
            </Text>
          </View>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>

        {/* 平均时间 */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{insight.avgTimePerQuestion}s</Text>
          <View style={styles.changeIndicator}>
            <Text style={[styles.changeText, { color: timeChange.color }]}>
              {timeChange.icon} {Math.abs(insight.timeChange)}s
            </Text>
          </View>
          <Text style={styles.statLabel}>Avg Time</Text>
        </View>

        {/* 周目标 */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{insight.weeklyGoalPercent}%</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(insight.weeklyGoalPercent, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.statLabel}>Weekly Goal</Text>
        </View>
      </View>

      {/* 展开后的详细信息 */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* 知识点掌握情况 */}
          <View style={styles.skillsSection}>
            {insight.masteredSkills.length > 0 && (
              <View style={styles.skillGroup}>
                <Text style={styles.skillGroupTitle}>
                  ✓ Mastered
                </Text>
                <View style={styles.skillTags}>
                  {insight.masteredSkills.map((skill, index) => (
                    <View key={index} style={styles.skillTagSuccess}>
                      <Text style={styles.skillTagTextSuccess}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {insight.needsPracticeSkills.length > 0 && (
              <View style={styles.skillGroup}>
                <Text style={styles.skillGroupTitle}>
                  ○ Needs Practice
                </Text>
                <View style={styles.skillTags}>
                  {insight.needsPracticeSkills.map((skill, index) => (
                    <View key={index} style={styles.skillTagWarning}>
                      <Text style={styles.skillTagTextWarning}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* 学习时长 */}
          <View style={styles.learningTime}>
            <Text style={styles.learningTimeIcon}>📚</Text>
            <Text style={styles.learningTimeText}>
              {insight.weeklyLearningMinutes} minutes learned this week
            </Text>
          </View>

          {/* 家长建议 */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{insight.parentTip}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  changeIndicator: {
    marginVertical: 2,
  },
  changeText: {
    fontSize: FONT_SIZES.tiny,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 2,
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.progressTrack,
  },
  skillsSection: {
    marginBottom: SPACING.md,
  },
  skillGroup: {
    marginBottom: SPACING.sm,
  },
  skillGroupTitle: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillTagSuccess: {
    backgroundColor: '#E8FFF5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  skillTagTextSuccess: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.success,
    fontWeight: '500',
  },
  skillTagWarning: {
    backgroundColor: '#FFF9E8',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  skillTagTextWarning: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.warningDark,
    fontWeight: '500',
  },
  learningTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  learningTimeIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  learningTimeText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  tipIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default ParentInsightCard;
