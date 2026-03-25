# 架构设计文档

## 反馈闭环MVP - 系统架构

> 版本: v1.0.0
> 日期: 2024-03
> 关键词: 模块化、可扩展、离线优先

## 0. 增量架构说明（2026-03）

- `ResultFeedbackScreen` 背景结构升级为双层：底层渐变 + 上层按正确题数切换背景图（`jojo_3/jojo_2/jojo_1`）。
- 结算页主体布局引入统一下移偏移（17%）以适配视觉重心。
- `MascotBubble` 由手绘图形吉祥物切换为 `piggy.png` 素材渲染。
- `StarDisplay` 升级为五角星样式并增强立体表现。
- `AchievementBadge` 光效改为边框环绕发光，降低整块闪烁带来的性能抖动。

---

## 1. 系统分层架构

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer (UI)                │
│  ┌─────────────────────────────────────────────────┐│
│  │ Screens                                         ││
│  │ ├─ PracticeCompleteScreen (完成页)            ││
│  │ ├─ ResultFeedbackScreen (反馈页 - 核心)       ││
│  │ ├─ DetailReviewScreen (详情页)                ││
│  │ ├─ RewardScreen (奖励页)                      ││
│  │ └─ NextPracticeScreen (Demo选择页)            ││
│  └─────────────────────────┬───────────────────┘│
│                             │                    │
└────────────────────────────┼────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│              Component Layer (UI Components)        │
│  ┌─────────────────────────────────────────────────┐│
│  │ ├─ StarDisplay (星星展示)                      ││
│  │ ├─ MascotBubble (吉祥物对话)                  ││
│  │ ├─ ProgressRing (进度环)                      ││
│  │ ├─ ActionButton (动作按钮)                    ││
│  │ ├─ AchievementBadge (成就徽章)                ││
│  │ └─ ParentInsightCard (家长洞察卡)             ││
│  └────────────────────┬──────────────────────┘│
│                       │                       │
└───────────────────────┼───────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│        Business Logic Layer (Services)              │
│  ┌─────────────────────────────────────────────────┐│
│  │ API Service                                     ││
│  │ ├─ fetchPracticeResult()                       ││
│  │ ├─ claimReward()                               ││
│  │ ├─ trackEvent()                                ││
│  │ └─ fetchNextPracticeConfig()                   ││
│  │                                                ││
│  │ Supporting Services                           ││
│  │ ├─ EventQueue (事件队列)                       ││
│  │ ├─ NetworkStateManager (网络状态)             ││
│  │ └─ CacheManager (缓存管理)                     ││
│  └────────────────────┬──────────────────────┘│
│                       │                       │
└───────────────────────┼───────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│         Data Layer (Types & Mock Data)              │
│  ┌─────────────────────────────────────────────────┐│
│  │ Types (src/types/index.ts)                      ││
│  │ ├─ PracticeResultResponse                       ││
│  │ ├─ ChildFeedback                                ││
│  │ ├─ ParentInsight                                ││
│  │ ├─ QuestionResult                               ││
│  │ └─ ... (其他类型)                              ││
│  │                                                ││
│  │ Mock Data (src/mock/)                           ││
│  │ ├─ excellentScenario (3/3正确)                 ││
│  │ ├─ goodScenario (2/3正确)                      ││
│  │ └─ keepTryingScenario (1/3正确)                ││
│  └─────────────────────────────────────────────────┘│
│                                                    │
└─────────────────────────────────────────────────────┘
```

---

## 2. 数据流框图

### 2.1 完整用户流程

```
用户完成练习
    │
    ▼
┌──────────────────────┐
│ PracticeComplete     │
│ (过渡动画页)         │
└──────┬───────────────┘
       │ 2秒自动转场
       ▼
┌──────────────────────┐      ┌───────────────────┐
│ ResultFeedback       │◄─────│ API Service       │
│ (核心反馈页)         │      │ - 获取结果        │
│                      │      │ - 上报事件        │
│ 展示内容:            │      │ - 防重复          │
│ ├─ 星星              │      └───────────────────┘
│ ├─ 鼓励语             │
│ ├─ 吉祥物             │
│ ├─ 成就               │      ┌───────────────────┐
│ ├─ 进度条             │◄─────│ Local Storage     │
│ ├─ 家长洞察(可折)     │      │ - 缓存结果        │
│ └─ 动作按钮           │      │ - 离线支持        │
└──────┬───────────────┘      └───────────────────┘
       │ 用户点击
       │
   ┌───┴────────┬──────────────┬─────────────┐
   │            │              │             │
   ▼            ▼              ▼             ▼
┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐
│Continue│  │Details │  │Rewards   │  │Take      │
│Practice│  │Review  │  │Center    │  │Break     │
└────────┘  └────────┘  └──────────┘  └──────────┘
   │            │              │             │
   └────────────┴──────────────┴─────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ NextPractice     │
            │ (Demo选择/首页)  │
            └──────────────────┘
```

### 2.2 状态管理流

```
Navigation State (React Navigation)
    │
    ├─ currentScreen: string
    └─ params: RootStackParamList[currentScreen]

Component Local State (useState)
    │
    ├─ ResultFeedback
    │  ├─ showParentInsight: boolean
    │  ├─ animationPhase: 'entering' | 'stars' | 'message' | ...
    │  └─ dwellTime: number
    │
    ├─ DetailReview
    │  └─ expandedQuestions: Set<string>
    │
    └─ RewardScreen
       └─ (mostly derived from props)

Async State (via API Service)
    │
    ├─ resultData: PracticeResultResponse
    ├─ isLoading: boolean
    ├─ error: Error | null
    └─ retryCount: number
```

---

## 3. 组件依赖关系

```
App
└── AppNavigator
    ├── PracticeCompleteScreen
    │   └── [Animations]
    │
    ├── ResultFeedbackScreen ⭐ 核心
    │   ├── StarDisplay
    │   │   └── [Animated.View]
    │   ├── MascotBubble
    │   │   ├── [Animated.View]
    │   │   └── [Animated.Text]
    │   ├── AchievementBadge
    │   │   └── [Animated.View]
    │   ├── ProgressRing
    │   │   └── [Animated.View]
    │   ├── ParentInsightCard
    │   │   └── [TouchableOpacity]
    │   └── ActionButton
    │       └── [Animated.View]
    │
    ├── DetailReviewScreen
    │   ├── [ScrollView]
    │   ├── ActionButton
    │   └── [Custom Cards]
    │
    ├── RewardScreen
    │   ├── StarDisplay (total)
    │   ├── ProgressRing
    │   ├── AchievementBadge
    │   ├── ActionButton
    │   └── [Stats Cards]
    │
    └── NextPracticeScreen
        ├── ActionButton
        └── [Scenario Cards]
```

---

## 4. 类型系统设计

### 4.1 核心类型层级

```
BaseEntity
├── PracticeResultResponse (API响应根)
│   ├── practiceMeta: PracticeMeta
│   ├── questionResults: QuestionResult[]
│   ├── childFeedback: ChildFeedback
│   ├── parentInsight: ParentInsight
│   ├── progressUpdate: ProgressInfo
│   └── nextActions: NextAction[]
│
PerformanceMetrics
├── QuestionResult
│   ├── isCorrect: boolean
│   ├── timeSpent: number
│   └── difficultyLevel: number
│
UserFeedback
├── ChildFeedback
│   ├── performanceTier: PerformanceTier
│   ├── starsEarned: number
│   └── Achievement: optional
│
└── ParentInsight
    ├── accuracyPercent: number
    ├── masteredSkills: string[]
    └── needsPracticeSkills: string[]
```

### 4.2 类型安全策略

```typescript
// ✅ 好的实践：使用 const assertions
const PERFORMANCE_CONFIG = {
  excellent: { ... }
} as const;

// ❌ 避免：any 类型
const processResult = (data: any) => { ... }

// ✅ 好的实践：精确的 union types
type PerformanceTier = 'excellent' | 'good' | 'keep_trying';

// ❌ 避免：过度泛型化
type FeedbackData<T> = { data: T; error?: Error };
```

---

## 5. 错误处理架构

```
Error Handling Strategy
│
├─ Network Errors
│  ├─ Retry: exponential backoff
│  ├─ Timeout: fallback to cache/mock
│  ├─ 404: user-friendly message
│  └─ 500: retry with exponential backoff
│
├─ Data Errors
│  ├─ Invalid response: fallback to mock
│  ├─ Missing fields: use defaults
│  └─ Type mismatch: validation + coercion
│
├─ Business Logic Errors
│  ├─ AlreadyClaimed: skip animation
│  ├─ SessionExpired: redirect to home
│  └─ TooManyRequests: throttle requests
│
└─ Graceful Degradation
   ├─ No internet: offline mode
   ├─ Slow network: progressive loading
   └─ Missing assets: fallback emojis
```

---

## 6. 性能优化策略

### 6.1 渲染优化

```typescript
// 1. 使用 React.memo 防止不必要的重渲染
const StarDisplay = React.memo((props) => { ... });

// 2. 使用 useMemo 缓存计算结果
const earnedStars = useMemo(
  () => resultData.childFeedback.starsEarned,
  [resultData.childFeedback.starsEarned]
);

// 3. 分页加载 (用于长列表)
<FlatList
  data={questionResults}
  renderItem={...}
  initialNumToRender={3}
  maxToRenderPerBatch={10}
/>
```

### 6.2 资源加载优化

```
图片加载策略:
├─ 预加载关键图片 (徽章、吉祥物)
├─ 懒加载非关键图片
└─ 使用 WebP 格式 (如支持)

字体加载:
├─ 系统字体优先 (更快)
├─ 必要时加载自定义字体
└─ 字体子集化 (仅包含需要的字符)

代码分割:
├─ 按屏幕分割
├─ 按功能分割 (reward, detail, etc.)
└─ 动态 import 非关键模块
```

### 6.3 网络优化

```
API 调用优化:
├─ 只请求必要字段
├─ 批量上报事件
└─ 复用 HTTP 连接 (keep-alive)

缓存策略:
├─ Result: 7天 TTL
├─ Progress: 1小时 TTL
├─ Events: 直到发送成功
└─ Achievements: 永久缓存 (很少变化)
```

---

## 7. 可扩展性设计

### 7.1 添加新的反馈类型

```typescript
// 1. 在 Constants 中添加新档位
const PERFORMANCE_CONFIG = {
  excellent: { ... },
  good: { ... },
  keep_trying: { ... },
  legendary: { /* NEW */ }
};

// 2. 更新类型定义
type PerformanceTier = 'excellent' | 'good' | 'keep_trying' | 'legendary';

// 3. 组件自动适配 (策略模式)
const getMascotExpression = (tier: PerformanceTier) => {
  return PERFORMANCE_CONFIG[tier].mascotExpression;
};

// 4. 测试新场景
const legendaryScenario = getMockScenario('legendary');
```

### 7.2 添加新的后续动作

```typescript
// 1. NextAction 类型已支持扩展
type NextAction = {
  actionType:
    | 'continue_practice'
    | 'view_details'
    | 'view_rewards'
    | 'take_break'
    | 'share_achievement'  // NEW
    | 'invite_friends'     // NEW
  label: string;
  isPrimary: boolean;
  params?: Record<string, unknown>;
};

// 2. 在结果页中添加处理逻辑
const handleActionPress = (actionType: string) => {
  switch (actionType) {
    case 'share_achievement':
      handleShareAchievement();
      break;
    case 'invite_friends':
      handleInviteFriends();
      break;
    // ...
  }
};
```

### 7.3 状态管理升级路径

```
当前: Local State (useState)
      ↓ (如果需要跨屏幕状态)
第一步: Context API
      ↓ (如果状态复杂度增加)
第二步: Redux / Zustand
      ├─ actions/
      ├─ reducers/
      ├─ selectors/
      └─ store.ts
```

---

## 8. 测试策略

### 8.1 单元测试 (Jest)

```typescript
// Component 测试
describe('StarDisplay', () => {
  it('renders correct number of stars', () => {
    const { getByTestId } = render(
      <StarDisplay earnedStars={3} />
    );
    expect(getByTestId('star')).toHaveLength(3);
  });

  it('plays animation when props change', () => {
    const { rerender } = render(
      <StarDisplay earnedStars={0} animated={true} />
    );
    rerender(<StarDisplay earnedStars={3} animated={true} />);

    expect(animationSpy).toHaveBeenCalled();
  });
});

// Util 函数测试
describe('performanceUtils', () => {
  it('calculates correct tier', () => {
    expect(getTier(100)).toBe('excellent');
    expect(getTier(75)).toBe('good');
    expect(getTier(40)).toBe('keep_trying');
  });
});
```

### 8.2 集成测试 (e2e)

```typescript
// 完整用户流程测试
describe('Feedback Loop', () => {
  it('shows result and allows actions', async () => {
    // 1. 进入结果页
    navigation.navigate('ResultFeedback', { resultData });

    // 2. 验证内容
    expect(screen.getByText('3 / 3 correct')).toBeTruthy();
    expect(screen.getByTestId('star-3')).toBeTruthy();

    // 3. 点击动作按钮
    fireEvent.press(screen.getByText('Play More!'));

    // 4. 验证导航
    expect(navigation.navigate).toHaveBeenCalledWith('NextPractice');
  });
});
```

### 8.3 可视化回归测试

```typescript
// 使用 Percy / Chromatic 进行可视化测试
describe('Visual Regression', () => {
  it('renders result page correctly', () => {
    render(<ResultFeedbackScreen resultData={excellentScenario} />);

    // 自动对比截图
    percySnapshot('ResultFeedback-Excellent');
  });
});
```

---

## 9. 部署架构

```
Development
    │
    ├─ npm run ios/android (本地调试)
    │
    └─ npm run web (浏览器预览)

Staging
    │
    ├─ Expo Preview Build
    │ └─ https://preview-staging.mathbuddy.com
    │
    └─ Firebase App Distribution
       └─ 测试用户的TestFlight / Beta版本

Production
    │
    ├─ Code Signing (iOS certificates)
    │
    ├─ Build
    │ ├─ eas build --platform ios
    │ └─ eas build --platform android
    │
    ├─ App Store / Play Store Submit
    │
    └─ Monitoring
       ├─ Sentry (错误追踪)
       ├─ Firebase Analytics
       └─ Bugsnag (性能监控)
```

---

## 10. 安全考虑

### 10.1 COPPA 合规

```
用户数据保护:
├─ 不存储不必要的PII
├─ 家长同意流程
├─ 数据导出功能
├─ 删除权利支持
└─ 13岁以下检测

API 安全:
├─ HTTPS 强制
├─ Token 加密存储
├─ API rate limiting
└─ 输入验证
```

### 10.2 本地数据安全

```typescript
// 使用 Keychain/Keystore 存储敏感数据
import * as SecureStore from 'expo-secure-store';

// 加密存储
await SecureStore.setItemAsync('authToken', token);

// 解密读取
const token = await SecureStore.getItemAsync('authToken');
```

---

## 总结

| 层级 | 职责 | 主要文件 |
|------|------|---------|
| Presentation | UI 渲染、用户交互 | screens/*, components/* |
| Business Logic | 业务规则、数据转换 | services/api.ts |
| Data | 类型定义、Mock数据 | types/*, mock/* |
| Infrastructure | 导航、常量、工具 | navigation/*, constants/* |

**设计哲学**:
- 模块化: 每个组件职责单一
- 可测试: 依赖注入、纯函数优先
- 可扩展: 策略模式、工厂模式应用
- 可维护: 清晰的目录结构、完善的文档
