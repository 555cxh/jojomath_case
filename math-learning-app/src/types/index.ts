/**
 * Math Learning App - Type Definitions
 * 面向北美6岁儿童的数学学习App类型定义
 */

// ============================================
// 练习相关类型
// ============================================

/** 单道题目的结果 */
export interface QuestionResult {
  /** 题目唯一标识 */
  questionId: string;
  /** 题目类型：加法、减法、比较等 */
  questionType: 'addition' | 'subtraction' | 'comparison' | 'counting';
  /** 题目内容，用于详情展示 */
  questionText: string;
  /** 用户的答案 */
  userAnswer: string;
  /** 正确答案 */
  correctAnswer: string;
  /** 是否正确 */
  isCorrect: boolean;
  /** 答题耗时（秒） */
  timeSpent: number;
  /** 难度等级 1-5 */
  difficultyLevel: number;
}

/** 表现档位 */
export type PerformanceTier =
  | 'excellent'    // 全对或90%+，大庆祝
  | 'good'         // 60-89%，温和鼓励
  | 'keep_trying'; // <60%，安慰性鼓励

/** 本轮练习摘要 - 孩子视角 */
export interface ChildFeedback {
  /** 表现档位 */
  performanceTier: PerformanceTier;
  /** 获得的星星数（0-3） */
  starsEarned: number;
  /** 鼓励语（孩子能理解的简单语言） */
  encouragementMessage: string;
  /** 角色反馈（如小动物说的话） */
  mascotMessage: string;
  /** 是否解锁新成就 */
  hasNewAchievement: boolean;
  /** 新成就信息（如果有） */
  newAchievement?: Achievement;
  /** 连续学习天数 */
  streakDays: number;
  /** 是否突破个人记录 */
  isPersonalBest: boolean;
}

/** 本轮练习摘要 - 家长视角 */
export interface ParentInsight {
  /** 正确率百分比 */
  accuracyPercent: number;
  /** 相比上次的正确率变化 */
  accuracyChange: number;
  /** 平均答题时间（秒） */
  avgTimePerQuestion: number;
  /** 相比上次的时间变化（负数表示更快） */
  timeChange: number;
  /** 掌握的知识点 */
  masteredSkills: string[];
  /** 需要加强的知识点 */
  needsPracticeSkills: string[];
  /** 本周学习时长（分钟） */
  weeklyLearningMinutes: number;
  /** 本周目标完成百分比 */
  weeklyGoalPercent: number;
  /** 推荐的家长引导建议 */
  parentTip: string;
}

/** 成就/奖励 */
export interface Achievement {
  /** 成就ID */
  id: string;
  /** 成就名称 */
  name: string;
  /** 成就描述 */
  description: string;
  /** 成就图标URL */
  iconUrl: string;
  /** 获得时间 */
  earnedAt: string;
}

/** 进度信息 */
export interface ProgressInfo {
  /** 当前等级 */
  currentLevel: number;
  /** 当前等级经验值 */
  currentXP: number;
  /** 升级所需经验值 */
  nextLevelXP: number;
  /** 本次获得的经验值 */
  xpEarned: number;
  /** 总完成题目数 */
  totalQuestionsCompleted: number;
  /** 收集的星星总数 */
  totalStars: number;
}

// ============================================
// API 响应类型
// ============================================

/** 练习完成后的反馈数据（API响应） */
export interface PracticeResultResponse {
  /** 请求状态 */
  success: boolean;
  /** 错误信息（如果失败） */
  errorMessage?: string;
  /** 本次练习会话ID（防止重复提交） */
  sessionId: string;
  /** 结果领取状态 */
  claimStatus: 'new' | 'already_claimed';
  /** 练习元数据 */
  practiceMeta: {
    /** 练习ID */
    practiceId: string;
    /** 练习类型 */
    practiceType: string;
    /** 题目数量 */
    totalQuestions: number;
    /** 完成时间 */
    completedAt: string;
  };
  /** 各题目详细结果 */
  questionResults: QuestionResult[];
  /** 孩子视角反馈 */
  childFeedback: ChildFeedback;
  /** 家长视角洞察 */
  parentInsight: ParentInsight;
  /** 进度更新 */
  progressUpdate: ProgressInfo;
  /** 后续推荐动作 */
  nextActions: NextAction[];
}

/** 后续动作 */
export interface NextAction {
  /** 动作类型 */
  actionType: 'continue_practice' | 'view_details' | 'view_rewards' | 'take_break' | 'share_achievement';
  /** 显示文本 */
  label: string;
  /** 是否为主要动作（高亮显示） */
  isPrimary: boolean;
  /** 动作参数 */
  params?: Record<string, unknown>;
}

// ============================================
// 事件上报类型
// ============================================

/** 用户行为事件 */
export interface AnalyticsEvent {
  /** 事件类型 */
  eventType:
    | 'result_page_viewed'
    | 'result_page_exited'
    | 'action_button_clicked'
    | 'detail_viewed'
    | 'reward_claimed'
    | 'share_initiated';
  /** 事件时间戳 */
  timestamp: string;
  /** 会话ID */
  sessionId: string;
  /** 事件参数 */
  params: Record<string, unknown>;
}

/** 动作按钮点击上报 */
export interface ActionClickEvent extends AnalyticsEvent {
  eventType: 'action_button_clicked';
  params: {
    actionType: NextAction['actionType'];
    performanceTier: PerformanceTier;
    starsEarned: number;
    /** 在结果页停留时长（毫秒） */
    dwellTime: number;
  };
}

// ============================================
// 导航参数类型
// ============================================

export type RootStackParamList = {
  PracticeComplete: {
    sessionId: string;
    demoScenarioIndex?: number;
    isContinuousPractice?: boolean;
    continuousPracticeCount?: number;
    bonusStarPending?: boolean;
  };
  ResultFeedback: {
    resultData: PracticeResultResponse;
    continuousPracticeCount?: number;
    lastRoundBonusApplied?: boolean;
  };
  DetailReview: {
    questionResults: QuestionResult[];
    childFeedback: ChildFeedback;
    continuousPracticeCount?: number;
  };
  RewardCenter: {
    progressInfo: ProgressInfo;
    newAchievement?: Achievement;
    continuousPracticeCount?: number;
  };
  NextPractice:
    | {
        isContinuousPractice?: boolean;
        continuousPracticeCount?: number;
        bonusStarPending?: boolean;
      }
    | undefined;
};

// ============================================
// UI状态类型
// ============================================

export interface FeedbackScreenState {
  isLoading: boolean;
  showCelebration: boolean;
  showParentMode: boolean;
  animationPhase: 'entering' | 'stars' | 'message' | 'actions' | 'complete';
}
