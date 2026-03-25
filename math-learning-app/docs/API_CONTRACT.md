# API Contract Documentation

## 练习反馈闭环 - 前后端数据契约

> 版本: v1.0.0
> 最后更新: 2024-03
> 后端技术栈: Go / Java

## 0. 文档同步说明（2026-03）

- 核心接口结构与字段保持稳定，无破坏性变更。
- 前端近期主要更新为展示层（背景图/渐变、文案、吉祥物素材、按钮顺序与文案），不影响 API 字段签名。
- `nextActions[].label` 允许按场景动态配置；联调时请以 `actionType` 为行为语义主键。

---

## 1. 概述

本文档定义了儿童数学学习App"练习完成后反馈闭环"功能的前后端数据交互契约。

### 1.1 核心流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  完成练习   │───▶│  获取结果   │───▶│  展示反馈   │───▶│  后续动作   │
│             │    │  API调用    │    │  页面渲染   │    │  事件上报   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 2. 核心接口

### 2.1 获取练习结果

**用途**: 练习完成后，前端调用此接口获取完整的反馈数据

```
GET /v1/practice/{sessionId}/result
```

**请求头**:
```json
{
  "Authorization": "Bearer {token}",
  "X-Client-Version": "1.0.0",
  "X-Platform": "ios|android"
}
```

**响应体**:
```json
{
  "success": true,
  "sessionId": "session_abc123",
  "claimStatus": "new",

  "practiceMeta": {
    "practiceId": "practice_001",
    "practiceType": "addition_basics",
    "totalQuestions": 3,
    "completedAt": "2024-03-15T10:30:00Z"
  },

  "questionResults": [
    {
      "questionId": "q1",
      "questionType": "addition",
      "questionText": "2 + 3 = ?",
      "userAnswer": "5",
      "correctAnswer": "5",
      "isCorrect": true,
      "timeSpent": 8,
      "difficultyLevel": 1
    }
  ],

  "childFeedback": {
    "performanceTier": "excellent",
    "starsEarned": 3,
    "encouragementMessage": "Amazing job! You did it!",
    "mascotMessage": "I knew you could do it!",
    "hasNewAchievement": true,
    "newAchievement": {
      "id": "achievement_perfect_round",
      "name": "Perfect Round",
      "description": "Got all questions right!",
      "iconUrl": "https://cdn.example.com/badges/trophy_gold.png",
      "earnedAt": "2024-03-15T10:30:00Z"
    },
    "streakDays": 5,
    "isPersonalBest": true
  },

  "parentInsight": {
    "accuracyPercent": 100,
    "accuracyChange": 10,
    "avgTimePerQuestion": 7,
    "timeChange": -2,
    "masteredSkills": ["Single digit addition"],
    "needsPracticeSkills": [],
    "weeklyLearningMinutes": 45,
    "weeklyGoalPercent": 90,
    "parentTip": "Your child showed excellent understanding!"
  },

  "progressUpdate": {
    "currentLevel": 3,
    "currentXP": 280,
    "nextLevelXP": 300,
    "xpEarned": 30,
    "totalQuestionsCompleted": 87,
    "totalStars": 156
  },

  "nextActions": [
    {
      "actionType": "continue_practice",
      "label": "Try Again",
      "isPrimary": true,
      "params": {}
    },
    {
      "actionType": "view_details",
      "label": "看我的答案",
      "isPrimary": false
    }
  ]
}
```

**错误响应**:
```json
{
  "success": false,
  "errorCode": "SESSION_NOT_FOUND",
  "errorMessage": "Practice session not found or expired"
}
```

---

## 3. 数据字段说明

### 3.1 孩子本轮表现数据 (childFeedback)

| 字段 | 类型 | 说明 | 前端用途 |
|------|------|------|----------|
| `performanceTier` | enum | 表现档位: excellent/good/keep_trying | 决定庆祝动画类型、配色方案 |
| `starsEarned` | number | 获得星星数 (0-3) | 星星动画展示 |
| `encouragementMessage` | string | 鼓励语 | 主要鼓励文案 |
| `mascotMessage` | string | 吉祥物说的话 | 气泡对话框内容 |
| `hasNewAchievement` | boolean | 是否有新成就 | 是否展示成就弹窗 |
| `streakDays` | number | 连续学习天数 | 连续天数标签 |
| `isPersonalBest` | boolean | 是否突破个人记录 | 个人最佳标签 |

### 3.2 家长可感知价值数据 (parentInsight)

| 字段 | 类型 | 说明 | 家长价值感知 |
|------|------|------|-------------|
| `accuracyPercent` | number | 正确率 | 直观了解本轮表现 |
| `accuracyChange` | number | 正确率变化 | 进步/退步趋势 |
| `avgTimePerQuestion` | number | 平均答题时间(秒) | 熟练度指标 |
| `timeChange` | number | 时间变化(负=更快) | 效率提升感知 |
| `masteredSkills` | string[] | 已掌握知识点 | 学习成果确认 |
| `needsPracticeSkills` | string[] | 需加强知识点 | 针对性辅导方向 |
| `weeklyLearningMinutes` | number | 本周学习时长 | 学习投入量化 |
| `weeklyGoalPercent` | number | 周目标完成度 | 目标达成感 |
| `parentTip` | string | 家长引导建议 | 科学育儿指导 |

### 3.3 表现档位映射

| Tier | 正确率 | 星星数 | 视觉风格 | 鼓励策略 |
|------|--------|--------|----------|----------|
| `excellent` | 90%+ | 3 | 金色系+大庆祝 | 强化成就感 |
| `good` | 60-89% | 2 | 紫色系+温和鼓励 | 认可努力+鼓励继续 |
| `keep_trying` | <60% | 1 | 橙色系+安慰 | 肯定尝试+降低挫败感 |

---

## 4. 防重复机制

### 4.1 奖励领取幂等性

**问题**: 用户可能因网络问题重复请求，导致重复领取星星/XP

**解决方案**:

```
POST /v1/rewards/claim
```

**请求体**:
```json
{
  "sessionId": "session_abc123",
  "rewardType": "stars|xp|achievement",
  "clientTimestamp": "2024-03-15T10:30:00Z",
  "idempotencyKey": "claim_abc123_stars_1710498600"
}
```

**后端逻辑**:
```
1. 检查 sessionId + rewardType 是否已领取
2. 若已领取，返回 409 Conflict + alreadyClaimed: true
3. 若未领取，执行领取并记录
4. 使用数据库唯一约束防止并发写入
```

**响应**:
```json
// 首次领取成功
{
  "success": true,
  "alreadyClaimed": false,
  "rewardDetails": {
    "starsAdded": 3,
    "newTotal": 159
  }
}

// 重复请求
{
  "success": false,
  "alreadyClaimed": true,
  "originalClaimTime": "2024-03-15T10:30:05Z"
}
```

### 4.2 claimStatus 字段

结果接口返回的 `claimStatus` 字段:
- `new`: 首次请求，奖励未领取
- `already_claimed`: 奖励已被领取（前端应跳过领取动画）

---

## 5. 事件上报

### 5.1 结果页行为追踪

```
POST /v1/analytics/events
```

**请求体**:
```json
{
  "eventType": "action_button_clicked",
  "timestamp": "2024-03-15T10:31:00Z",
  "sessionId": "session_abc123",
  "params": {
    "actionType": "continue_practice",
    "performanceTier": "excellent",
    "starsEarned": 3,
    "dwellTime": 15000
  }
}
```

### 5.2 需上报的关键事件

| 事件类型 | 触发时机 | 关键参数 |
|----------|----------|----------|
| `result_page_viewed` | 进入结果页 | sessionId, performanceTier |
| `result_page_exited` | 离开结果页 | dwellTime, exitMethod |
| `action_button_clicked` | 点击动作按钮 | actionType, buttonPosition |
| `detail_viewed` | 查看详情 | viewDuration |
| `reward_claimed` | 领取奖励 | rewardType, rewardValue |
| `parent_insight_expanded` | 展开家长洞察 | - |

---

## 6. 错误码定义

| 错误码 | HTTP状态码 | 说明 | 前端处理 |
|--------|-----------|------|----------|
| `SESSION_NOT_FOUND` | 404 | 会话不存在或已过期 | 返回首页 |
| `SESSION_EXPIRED` | 410 | 会话已过期 | 提示重新练习 |
| `ALREADY_CLAIMED` | 409 | 奖励已领取 | 跳过领取动画 |
| `RATE_LIMITED` | 429 | 请求频率过高 | 延迟重试 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 | 通用错误提示 |

---

## 7. 数据安全

### 7.1 敏感数据处理

- 用户ID、设备ID 不在响应中明文返回
- 所有API必须通过HTTPS
- Token有效期: 24小时，支持刷新

### 7.2 COPPA 合规

由于目标用户为儿童，需遵守COPPA法规:
- 不收集不必要的个人信息
- 家长洞察数据仅在家长模式下展示
- 所有数据存储需获得家长同意

---

## 8. 版本兼容

### 8.1 API版本策略

- URL路径包含版本号: `/v1/`, `/v2/`
- 新增字段不破坏向后兼容
- 废弃字段标记 `deprecated`，保留2个版本

### 8.2 客户端版本检查

后端可根据 `X-Client-Version` 头返回适配的响应格式。

---

## 附录A: TypeScript 类型定义

完整类型定义见 `src/types/index.ts`

## 附录B: Mock数据示例

完整Mock数据见 `src/mock/scenarios.ts`
