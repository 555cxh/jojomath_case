/**
 * DetailReviewScreen
 * 详情查看页 - 展示每道题的具体情况
 * 帮助孩子和家长了解哪些题目做对了，哪些需要改进
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActionButton } from '../components';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../constants/theme';
import { RootStackParamList, QuestionResult } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DetailReview'>;
type RouteProps = RouteProp<RootStackParamList, 'DetailReview'>;

const DetailReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { questionResults, childFeedback, continuousPracticeCount = 0 } = route.params;

  const correctCount = questionResults.filter((q) => q.isCorrect).length;

  const renderQuestionCard = (question: QuestionResult, index: number) => {
    const isCorrect = question.isCorrect;

    return (
      <View
        key={question.questionId}
        style={[
          styles.questionCard,
          isCorrect ? styles.correctCard : styles.incorrectCard,
        ]}
      >
        {/* 题号和状态指示 */}
        <View style={styles.questionHeader}>
          <View
            style={[
              styles.questionNumber,
              { backgroundColor: isCorrect ? COLORS.success : COLORS.warning },
            ]}
          >
            <Text style={styles.questionNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.statusIndicator}>
            {isCorrect ? '✓ Correct!' : '✗ Oops!'}
          </Text>
        </View>

        {/* 题目内容 */}
        <View style={styles.questionContent}>
          <Text style={styles.questionText}>{question.questionText}</Text>
        </View>

        {/* 答案对比 */}
        <View style={styles.answersSection}>
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>Your answer:</Text>
            <View
              style={[
                styles.answerBadge,
                isCorrect ? styles.correctBadge : styles.incorrectBadge,
              ]}
            >
              <Text
                style={[
                  styles.answerText,
                  isCorrect ? styles.correctText : styles.incorrectText,
                ]}
              >
                {question.userAnswer}
              </Text>
            </View>
          </View>

          {!isCorrect && (
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>Correct answer:</Text>
              <View style={[styles.answerBadge, styles.correctBadge]}>
                <Text style={[styles.answerText, styles.correctText]}>
                  {question.correctAnswer}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 用时 */}
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>⏱️ {question.timeSpent} seconds</Text>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>Your Answers</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 摘要 */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {correctCount === questionResults.length
              ? '🎉 Perfect Score!'
              : correctCount > 0
              ? '👍 Good effort!'
              : '💪 Keep practicing!'}
          </Text>
          <Text style={styles.summaryText}>
            You got {correctCount} out of {questionResults.length} questions right
          </Text>
        </View>
      </View>

      {/* 题目列表 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {questionResults.map((question, index) =>
          renderQuestionCard(question, index)
        )}

        {/* 提示文字 */}
        <View style={styles.tipSection}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>
            {correctCount === questionResults.length
              ? 'You are amazing! Jojo is so proud of you. Keep it up!'
              : 'Mistakes are okay! Every wrong answer helps you learn something new.'}
          </Text>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.bottomActions}>
        <ActionButton
          label="Try Similar Questions"
          variant="primary"
          size="large"
          fullWidth
          icon="🎯"
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
    paddingVertical: SPACING.sm,
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
    fontSize: FONT_SIZES.large + 2,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  summarySection: {
    padding: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  summaryText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  questionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  correctCard: {
    borderLeftColor: COLORS.success,
  },
  incorrectCard: {
    borderLeftColor: COLORS.warning,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  questionNumberText: {
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  statusIndicator: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  questionContent: {
    backgroundColor: '#F8F9FF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  questionText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  answersSection: {
    gap: SPACING.xs,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  answerBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  correctBadge: {
    backgroundColor: '#E8FFF5',
  },
  incorrectBadge: {
    backgroundColor: '#FFF0F0',
  },
  answerText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
  },
  correctText: {
    color: COLORS.success,
  },
  incorrectText: {
    color: '#E74C3C',
  },
  timeSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.progressTrack,
  },
  timeText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  tipSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E8',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomActions: {
    padding: SPACING.sm,
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

export default DetailReviewScreen;
