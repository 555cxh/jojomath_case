/**
 * 应用主题常量
 * 基于北美6岁儿童的审美和心理特点设计
 */

// 色彩系统 - 温暖、友好、高饱和
export const COLORS = {
  // 主色调
  primary: '#6C5CE7',      // 友好的紫色
  primaryLight: '#A29BFE',
  primaryDark: '#5541D7',

  // 成功/正确
  success: '#00B894',      // 清新绿色
  successLight: '#55EFC4',

  // 警告/需要努力
  warning: '#FDCB6E',      // 温暖黄色
  warningDark: '#F39C12',

  // 爱心/特别
  love: '#E84393',         // 粉红色

  // 星星
  star: '#FFD93D',         // 金色
  starInactive: '#DFE6E9',

  // 背景
  background: '#F8F9FF',
  backgroundGradientStart: '#667EEA',
  backgroundGradientEnd: '#764BA2',

  // 卡片
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(108, 92, 231, 0.15)',

  // 文字
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#FFFFFF',
  textMuted: '#B2BEC3',

  // 进度条
  progressTrack: '#E8E8E8',
  progressFill: '#6C5CE7',

  // 按钮
  buttonPrimary: '#6C5CE7',
  buttonSecondary: '#DFE6E9',
  buttonSuccess: '#00B894',
};

// 字体大小 - 大号字体便于儿童阅读
export const FONT_SIZES = {
  giant: 50,      // 大数字/星星数
  huge: 38,       // 主要标题
  large: 26,      // 次要标题
  medium: 20,     // 正文
  small: 16,      // 辅助文字
  tiny: 14,       // 最小文字（家长信息）
};

// 间距
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 圆角 - 圆润友好
export const BORDER_RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

// 动画时长
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  celebration: 1500,
};

// 表现档位对应的视觉配置
export const PERFORMANCE_CONFIG = {
  excellent: {
    color: COLORS.success,
    backgroundColor: '#E8FFF5',
    starCount: 3,
    celebrationType: 'confetti',
    soundEffect: 'celebration',
  },
  good: {
    color: COLORS.primary,
    backgroundColor: '#F0EFFF',
    starCount: 2,
    celebrationType: 'sparkle',
    soundEffect: 'positive',
  },
  keep_trying: {
    color: COLORS.warning,
    backgroundColor: '#FFF9E8',
    starCount: 1,
    celebrationType: 'gentle',
    soundEffect: 'encourage',
  },
};

// 鼓励语配置（孩子视角）
export const ENCOURAGEMENT_MESSAGES = {
  excellent: [
    'Amazing job! You did it! ⭐',
    "Amazing job! You did it!",
    "Super duper awesome!",
    "You're so smart!",
  ],
  good: [
    "Great work! Keep going!",
    "You're getting better!",
    "Nice try! Almost there!",
    "Good job, buddy!",
  ],
  keep_trying: [
    "You're learning! That's what matters!",
    "Every try makes you stronger!",
    "Don't give up! You can do it!",
    "Practice makes perfect!",
  ],
};

// 吉祥物消息（小浣熊Buddy说的话）
export const MASCOT_MESSAGES = {
  excellent: [
    "I knew you could do it! Let's high five! 🖐️",
    "You make me so proud! 🎉",
    "Wow wow wow! You're the best!",
  ],
  good: [
    "That was fun! Wanna try more?",
    "You're doing great! I believe in you!",
    "Nice! Let's keep playing!",
  ],
  keep_trying: [
    "Hey, it's okay! We all make mistakes!",
    "I'm here to help you! Let's practice together!",
    "You're brave for trying! That's what counts!",
  ],
};

// 家长引导建议
export const PARENT_TIPS = {
  excellent: [
    "Your child showed excellent understanding! Consider exploring slightly harder challenges.",
    "Great performance! Encourage them to explain their thinking process to you.",
  ],
  good: [
    "Good progress! Try practicing similar problems with real objects at home.",
    "Steady improvement! Short daily practice sessions work better than long infrequent ones.",
  ],
  keep_trying: [
    "This topic needs more practice. Try using counting fingers or toys to make it more concrete.",
    "Don't worry! Every child learns at their own pace. Praise their effort, not just results.",
  ],
};
