# MathBuddy - 儿童数学学习应用反馈闭环MVP

## 📱 项目概览

这是一个面向北美 6 岁儿童的数学学习应用，重点设计和实现了**练习完成后的反馈闭环**。该闭环不仅是"结算页"，而是同时承载：

- ✨ **孩子的完成感与鼓励** - 动画、星星、成就系统
- 👨‍👩‍👧 **家长的价值感知** - 数据洞察、学习进度、改进建议
- 🚀 **下一步行动引导** - 继续练习、查看详情、查看奖励等多个后续路径

## 🆕 最近更新（2026-03）

- 结果页背景升级为双层：底层纵向渐变，上层按正确题数切换 `jojo_3/jojo_2/jojo_1` 背景图
- 结果页内容整体下移 17%，并优化了区块间距
- 吉祥物由手绘小浣熊替换为 `piggy.png`（保留入场动画，图片自适应缩放）
- 星星样式升级为更明确的五角星并增强立体感
- 成就卡闪光优化为“边框周围发光”，不再整块闪烁
- 详情页（Your Answers）间距压缩，小字号（如 `Your answer:`、`10 seconds`）已放大
- 对3题场景按钮文案更新为“看我的答案”，并优化全对时正向提示语

---

## 🏗️ 项目结构

```
math-learning-app/
├── src/
│   ├── components/          # UI 组件库
│   │   ├── StarDisplay.tsx          # 星星动画展示
│   │   ├── MascotBubble.tsx         # 吉祥物 + 对话气泡
│   │   ├── ProgressRing.tsx         # 圆形进度条
│   │   ├── ActionButton.tsx         # 可定制动作按钮
│   │   ├── AchievementBadge.tsx     # 成就徽章展示
│   │   ├── ParentInsightCard.tsx    # 家长洞察卡片
│   │   └── index.ts
│   │
│   ├── screens/             # 页面 / 屏幕
│   │   ├── PracticeCompleteScreen.tsx   # [1] 完成页 - 过渡动画
│   │   ├── ResultFeedbackScreen.tsx     # [2] 结果反馈页 - 核心页面
│   │   ├── DetailReviewScreen.tsx       # [3] 详情查看页
│   │   ├── RewardScreen.tsx             # [4] 奖励/进度中心
│   │   ├── NextPracticeScreen.tsx       # [5] Demo 选择页
│   │   └── index.ts
│   │
│   ├── navigation/          # 导航配置
│   │   ├── AppNavigator.tsx
│   │   └── index.ts
│   │
│   ├── services/            # 服务层
│   │   ├── api.ts                  # API 服务 (Mock + 真实API)
│   │   └── index.ts
│   │
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts                # 完整的类型定义
│   │
│   ├── constants/           # 常量配置
│   │   └── theme.ts                # 色彩、字体、动画配置
│   │
│   ├── mock/                # Mock 数据
│   │   └── scenarios.ts            # 三种表现场景数据
│   │
│   └── App.tsx              # 应用入口
│
├── docs/
│   ├── API_CONTRACT.md            # 前后端数据契约
│   ├── ASYNC_SPECIFICATION.md     # 异步处理规范
│   └── ARCHITECTURE.md            # 架构设计文档 (本文件)
│
├── package.json
├── tsconfig.json
├── app.json
├── babel.config.js
└── README.md
```

---

## 🎯 核心功能

### 用户流程

```
完成练习 (2-3题)
    ↓
[1] 完成页 (PracticeCompleteScreen)
   - 背景图入场 + 文案淡入
    - 2秒后自动转场
    ↓
[2] 结果反馈页 (ResultFeedbackScreen) ⭐ 核心页面
    ├─ 孩子视角
    │  ├─ 表现标题 (Amazing/Great Job/Nice Try)
    │  ├─ 星星展示 (0-3个，带弹跳动画)
   │  ├─ 吉祥物对话 (Piggy 的鼓励)
    │  ├─ 成就展示 (如果有新成就)
    │
    ├─ 家长视角 (可折叠)
    │  ├─ 正确率 & 变化趋势
    │  ├─ 答题速度分析
    │  ├─ 掌握的知识点
    │  ├─ 需要加强的知识点
    │  └─ 科学育儿建议
    │
    ├─ 进度条 (经验值/等级)
    │
    └─ 动作按钮
       ├─ [主按钮] 继续练习 / 再做一遍
       ├─ [副按钮] 查看详情
       ├─ [副按钮] 查看奖励
       └─ [副按钮] （按场景配置文案）

    ↓ (用户选择)

[3] 详情查看 (DetailReviewScreen) OR [4] 奖励中心 (RewardScreen)
    - 展示每道题的详细情况
    - 展示总成就 & 等级进度

    ↓
[5] 下一轮练习 (NextPracticeScreen)
```

### 三种表现档位

| 档位 | 正确率 | 星星 | 视觉风格 | 鼓励策略 |
|------|--------|------|----------|----------|
| **Excellent** | 90%+ | ⭐⭐⭐ | 金色 + 大庆祝 | 强化成就感，推荐升级难度 |
| **Good** | 60-89% | ⭐⭐ | 紫色 + 温和鼓励 | 认可努力，鼓励继续 |
| **Keep Trying** | <60% | ⭐ | 橙色 + 安慰 | 肯定尝试，降低挫败感 |

---

## 🎨 设计亮点

### 1. 孩子视角 (Kid-Friendly)

- **大号字体** - FONT_SIZE.huge = 36px，方便小手指识别
- **温暖色彩** - 紫色主题 (#6C5CE7)，易于识别
- **即时反馈** - 动画反馈每 300-500ms 触发一次
- **简单文案** - 使用简单英文和表情符号
- **可爱吉祥物** - Piggy 角色，提高沉浸感

### 2. 家长视角 (Parent-Centric)

- **关键数据优先** - 正确率、时间趋势一目了然
- **可折叠详情** - 不打扰主流程，支持深度查看
- **科学建议** - 每次反馈包含针对性家长建议
- **进度透明** - 周目标完成度、大周期进度可视化

### 3. 动画体验

```
动画序列:
500ms  ┌─ 星星依次弹出 (Spring动画)
       │  300ms间隔
1300ms ┌─ 吉祥物出现 + 说话
1700ms ┌─ 激励文案淡入
2200ms ┌─ 动作按钮上升出现
```

---

## 💾 数据结构

### 核心数据类型

```typescript
// 单道题结果
QuestionResult {
  questionId: string
  questionType: 'addition' | 'subtraction' | 'comparison' | 'counting'
  questionText: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeSpent: number
  difficultyLevel: 1-5
}

// 孩子反馈
ChildFeedback {
  performanceTier: 'excellent' | 'good' | 'keep_trying'
  starsEarned: 0-3
  encouragementMessage: string
  mascotMessage: string
  hasNewAchievement: boolean
  streakDays: number
  isPersonalBest: boolean
}

// 家长洞察
ParentInsight {
  accuracyPercent: number
  accuracyChange: number
  avgTimePerQuestion: number
  masteredSkills: string[]
  needsPracticeSkills: string[]
  weeklyLearningMinutes: number
  parentTip: string
}

// 完整结果响应
PracticeResultResponse {
  sessionId: string
  claimStatus: 'new' | 'already_claimed'
  practiceMetadata: { ... }
  questionResults: QuestionResult[]
  childFeedback: ChildFeedback
  parentInsight: ParentInsight
  progressUpdate: ProgressInfo
  nextActions: NextAction[]
}
```

详见 `src/types/index.ts`

---

## 🔌 API 接口

### 主要接口

| 接口 | 方法 | 说明 | 返回数据 |
|------|------|------|---------|
| `/v1/practice/{sessionId}/result` | GET | 获取练习结果 | PracticeResultResponse |
| `/v1/rewards/claim` | POST | 领取奖励 (幂等) | { success, alreadyClaimed } |
| `/v1/analytics/events` | POST | 上报事件 | - |
| `/v1/practice/next` | POST | 获取下一轮配置 | PracticeConfig |

### 防重复机制

```
领取奖励 (POST /v1/rewards/claim)

第一次请求:
├─ 后端检查是否已领取
├─ 未领取 → 插入数据库 + 返回 success: true
└─ 返回 200

重复请求:
├─ 后端检查重复约束 (session_id + reward_type)
├─ 已存在 → 返回 409 Conflict
└─ 返回 { success: false, alreadyClaimed: true }

前端处理:
├─ 第一次 → 播放领取动画
└─ 重复 → 跳过动画，显示"已领取"
```

详见 `docs/API_CONTRACT.md`

---

## ⚡ 异步处理

### 关键异步模式

1. **查询异步** (Get Practice Result)
   - 超时: < 1000ms
   - 重试: 指数退避 (500ms, 1s, 2s)
   - 离线: 使用Mock或本地缓存

2. **写入异步** (Claim Reward - 幂等)
   - 防重复: 数据库唯一约束
   - 防竞态: UNIQUE(session_id, reward_type, user_id)

3. **事件上报** (非阻塞)
   - 本地队列: 批量发送
   - 页面卸载: 使用 keepalive
   - 失败重试: 指数退避

4. **离线支持**
   - 缓存策略: 7天 TTL
   - 网络恢复: 自动同步待操作
   - 兜底方案: Mock数据 → 空状态

详见 `docs/ASYNC_SPECIFICATION.md`

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# or
yarn install
```

### 2. 运行 Demo

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### 3. Demo 场景选择

启动后进入 `NextPracticeScreen`，可选择三种表现场景:

- 🌟 **Excellent** (3/3正确) - 查看大庆祝效果
- 👍 **Good** (2/3正确) - 查看温和鼓励
- 💪 **Keep Trying** (1/3正确) - 查看安慰性表达

当前 Demo 入口文案为“进入 Demo”。

---

## 📚 文档

### 主要文档

| 文档 | 内容 |
|------|------|
| `docs/API_CONTRACT.md` | 前后端数据交互契约、防重复、错误码 |
| `docs/ASYNC_SPECIFICATION.md` | 异步处理规范、离线支持、性能优化 |
| `src/types/index.ts` | 完整TypeScript类型定义 |
| `src/constants/theme.ts` | 设计系统 (色彩、字体、动画) |

---

## 🔧 技术栈

- **框架**: React Native (Expo)
- **语言**: TypeScript
- **导航**: @react-navigation/native
- **动画**: React Native Reanimated
- **状态管理**: 本地状态 (支持扩展Redux/Context)
- **HTTP**: Fetch API

---

## 📊 示例数据

项目包含三个完整的Mock场景，分别代表不同表现档位:

```typescript
// src/mock/scenarios.ts

excellentScenario    // 3/3 正确
goodScenario         // 2/3 正确
keepTryingScenario   // 1/3 正确
```

每个场景包含:
- 各题目的答题情况
- 孩子视角反馈 (星星、鼓励语、成就)
- 家长视角洞察 (正确率、时间、建议)
- 进度更新信息
- 后续动作推荐

---

## 🎯 MVP 交付成果

✅ **前端工程**
- 完整的React Native项目结构
- 6个主要屏幕组件
- 6个可复用UI组件
- TypeScript类型安全
- Mock数据支持

✅ **UI/UX设计**
- 3种表现档位的差异化反馈
- 孩子 & 家长双重信息层级
- 高保真动画序列
- 北美6岁用户心智适配

✅ **数据契约**
- 完整的API接口定义
- 防重复机制设计
- 事件上报规范
- 错误码定义

✅ **异步规范**
- 重试策略
- 离线支持
- 幂等性设计
- 性能监控

---

## 🔮 后续优化方向

### Phase 2: 生产级优化

- [ ] Redux 状态管理
- [ ] 本地持久化存储
- [ ] 深度链接支持
- [ ] A/B 测试框架
- [ ] 错误边界处理
- [ ] 性能监控集成

### Phase 3: 高级功能

- [ ] 多语言支持
- [ ] 黑暗模式
- [ ] 小游戏化设计
- [ ] 社交分享模块
- [ ] 家长通知推送
- [ ] 数据分析仪表板

---

## 📝 许可证

MIT License

---

## 👥 核心设计原则

1. **儿童优先** - 所有设计决策以6岁儿童用户为中心
2. **家长透明** - 数据和建议让家长一目了然
3. **即时反馈** - 每个行为都有视觉或听觉反馈
4. **防挫败** - 鼓励全面，负面表述最小化
5. **科学引导** - 基于学习心理的进度设计

---

**最后更新**: 2024-03-25
**项目状态**: MVP Ready
**Demo可用**: ✅ iOS / Android / Web
