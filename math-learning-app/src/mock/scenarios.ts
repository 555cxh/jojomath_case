/**
 * Mock数据 - 模拟不同表现场景
 * 用于Demo展示，真实环境需替换为API调用
 */

import {
  PracticeResultResponse,
  QuestionResult,
  PerformanceTier,
} from '../types';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// ============================================
// 场景1: 表现优秀 (Excellent) - 全对
// ============================================
export const excellentScenario: PracticeResultResponse = {
  success: true,
  sessionId: `session_${generateId()}`,
  claimStatus: 'new',
  practiceMeta: {
    practiceId: 'practice_001',
    practiceType: 'addition_basics',
    totalQuestions: 3,
    completedAt: new Date().toISOString(),
  },
  questionResults: [
    {
      questionId: 'q1',
      questionType: 'addition',
      questionText: '2 + 3 = ?',
      userAnswer: '5',
      correctAnswer: '5',
      isCorrect: true,
      timeSpent: 8,
      difficultyLevel: 1,
    },
    {
      questionId: 'q2',
      questionType: 'addition',
      questionText: '4 + 2 = ?',
      userAnswer: '6',
      correctAnswer: '6',
      isCorrect: true,
      timeSpent: 6,
      difficultyLevel: 1,
    },
    {
      questionId: 'q3',
      questionType: 'addition',
      questionText: '1 + 5 = ?',
      userAnswer: '6',
      correctAnswer: '6',
      isCorrect: true,
      timeSpent: 7,
      difficultyLevel: 1,
    },
  ],
  childFeedback: {
    performanceTier: 'excellent',
    starsEarned: 3,
    encouragementMessage: 'Amazing job! You did it!',
    mascotMessage: "I knew you could do it! Let's high five! ",
    hasNewAchievement: true,
    newAchievement: {
      id: 'achievement_perfect_round',
      name: 'Perfect Round',
      description: 'Got all questions right in one round!',
      iconUrl: 'trophy_gold',
      earnedAt: new Date().toISOString(),
    },
    streakDays: 5,
    isPersonalBest: true,
  },
  parentInsight: {
    accuracyPercent: 100,
    accuracyChange: 10,
    avgTimePerQuestion: 7,
    timeChange: -2,
    masteredSkills: ['Single digit addition', 'Number recognition'],
    needsPracticeSkills: [],
    weeklyLearningMinutes: 45,
    weeklyGoalPercent: 90,
    parentTip:
      'Your child showed excellent understanding! Consider exploring slightly harder challenges.',
  },
  progressUpdate: {
    currentLevel: 3,
    currentXP: 280,
    nextLevelXP: 300,
    xpEarned: 30,
    totalQuestionsCompleted: 87,
    totalStars: 156,
  },
  nextActions: [
    {
      actionType: 'continue_practice',
      label: 'Try Again',
      isPrimary: true,
    },
    {
      actionType: 'view_details',
      label: 'Look at My Answers',
      isPrimary: false,
    },
    {
      actionType: 'view_rewards',
      label: 'See My Stars',
      isPrimary: false,
    },
  ],
};

// ============================================
// 场景2: 表现良好 (Good) - 2/3正确
// ============================================
export const goodScenario: PracticeResultResponse = {
  success: true,
  sessionId: `session_${generateId()}`,
  claimStatus: 'new',
  practiceMeta: {
    practiceId: 'practice_002',
    practiceType: 'subtraction_basics',
    totalQuestions: 3,
    completedAt: new Date().toISOString(),
  },
  questionResults: [
    {
      questionId: 'q1',
      questionType: 'subtraction',
      questionText: '5 - 2 = ?',
      userAnswer: '3',
      correctAnswer: '3',
      isCorrect: true,
      timeSpent: 10,
      difficultyLevel: 1,
    },
    {
      questionId: 'q2',
      questionType: 'subtraction',
      questionText: '4 - 1 = ?',
      userAnswer: '3',
      correctAnswer: '3',
      isCorrect: true,
      timeSpent: 8,
      difficultyLevel: 1,
    },
    {
      questionId: 'q3',
      questionType: 'subtraction',
      questionText: '6 - 4 = ?',
      userAnswer: '3',
      correctAnswer: '2',
      isCorrect: false,
      timeSpent: 15,
      difficultyLevel: 2,
    },
  ],
  childFeedback: {
    performanceTier: 'good',
    starsEarned: 2,
    encouragementMessage: 'Great work! Keep going!',
    mascotMessage: "That was fun! Wanna try more?",
    hasNewAchievement: false,
    streakDays: 3,
    isPersonalBest: false,
  },
  parentInsight: {
    accuracyPercent: 67,
    accuracyChange: -5,
    avgTimePerQuestion: 11,
    timeChange: 1,
    masteredSkills: ['Basic subtraction'],
    needsPracticeSkills: ['Subtraction with larger numbers'],
    weeklyLearningMinutes: 30,
    weeklyGoalPercent: 60,
    parentTip:
      'Good progress! Try practicing similar problems with real objects at home.',
  },
  progressUpdate: {
    currentLevel: 2,
    currentXP: 150,
    nextLevelXP: 200,
    xpEarned: 20,
    totalQuestionsCompleted: 54,
    totalStars: 98,
  },
  nextActions: [
    {
      actionType: 'continue_practice',
      label: 'try again',
      isPrimary: true,
    },
    {
      actionType: 'view_details',
      label: 'see what i missed',
      isPrimary: false,
    },
    {
      actionType: 'view_rewards',
      label: 'see my stars',
      isPrimary: false,
    },
  ],
};

// ============================================
// 场景3: 需要努力 (Keep Trying) - 1/3正确
// ============================================
export const keepTryingScenario: PracticeResultResponse = {
  success: true,
  sessionId: `session_${generateId()}`,
  claimStatus: 'new',
  practiceMeta: {
    practiceId: 'practice_003',
    practiceType: 'comparison',
    totalQuestions: 3,
    completedAt: new Date().toISOString(),
  },
  questionResults: [
    {
      questionId: 'q1',
      questionType: 'comparison',
      questionText: 'Which is bigger: 3 or 5?',
      userAnswer: '5',
      correctAnswer: '5',
      isCorrect: true,
      timeSpent: 12,
      difficultyLevel: 1,
    },
    {
      questionId: 'q2',
      questionType: 'comparison',
      questionText: 'Which is smaller: 7 or 4?',
      userAnswer: '7',
      correctAnswer: '4',
      isCorrect: false,
      timeSpent: 18,
      difficultyLevel: 2,
    },
    {
      questionId: 'q3',
      questionType: 'comparison',
      questionText: 'Is 6 bigger than 8?',
      userAnswer: 'Yes',
      correctAnswer: 'No',
      isCorrect: false,
      timeSpent: 20,
      difficultyLevel: 2,
    },
  ],
  childFeedback: {
    performanceTier: 'keep_trying',
    starsEarned: 1,
    encouragementMessage: "You're learning! That's what matters!",
    mascotMessage: "Hey, it's okay! We all make mistakes!",
    hasNewAchievement: false,
    streakDays: 1,
    isPersonalBest: false,
  },
  parentInsight: {
    accuracyPercent: 33,
    accuracyChange: -10,
    avgTimePerQuestion: 17,
    timeChange: 3,
    masteredSkills: [],
    needsPracticeSkills: ['Number comparison', 'Understanding bigger/smaller'],
    weeklyLearningMinutes: 15,
    weeklyGoalPercent: 30,
    parentTip:
      "This topic needs more practice. Try using counting fingers or toys to make it more concrete.",
  },
  progressUpdate: {
    currentLevel: 1,
    currentXP: 45,
    nextLevelXP: 100,
    xpEarned: 10,
    totalQuestionsCompleted: 23,
    totalStars: 34,
  },
  nextActions: [
    {
      actionType: 'continue_practice',
      label: 'practice more',
      isPrimary: true,
    },
    {
      actionType: 'view_details',
      label: 'learn from mistakes',
      isPrimary: false,
    },
    {
      actionType: 'view_rewards',
      label: 'see my stars',
      isPrimary: false,
    },
  ],
};

// ============================================
// Mock数据选择器
// ============================================
export const getMockScenario = (tier: PerformanceTier): PracticeResultResponse => {
  switch (tier) {
    case 'excellent':
      return { ...excellentScenario, sessionId: `session_${generateId()}` };
    case 'good':
      return { ...goodScenario, sessionId: `session_${generateId()}` };
    case 'keep_trying':
      return { ...keepTryingScenario, sessionId: `session_${generateId()}` };
    default:
      return { ...goodScenario, sessionId: `session_${generateId()}` };
  }
};

// 所有场景列表（用于Demo切换）
export const allScenarios = [
  { key: 'excellent', label: 'Excellent (3/3)', data: excellentScenario },
  { key: 'good', label: 'Good (2/3)', data: goodScenario },
  { key: 'keep_trying', label: 'Keep Trying (1/3)', data: keepTryingScenario },
];
