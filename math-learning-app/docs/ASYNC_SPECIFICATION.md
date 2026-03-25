# 异步处理规范

## 实时反馈闭环中的异步操作设计

> 版本: v1.0.0
> 最后更新: 2024-03
> 关键词: 幂等性、重试策略、离线支持、事件消息队列

## 0. 文档同步说明（2026-03）

- 本阶段迭代以 UI/交互调整为主（背景双层、文案、组件视觉样式），未改变异步协议与重试策略。
- 结果数据加载、事件上报、奖励幂等、防重与离线队列逻辑保持不变。
- 如后续引入新的异步事件类型，应在本文档与 API 契约文档同步补充。

---

## 1. 异步流程概览

```
User Actions          Frontend Queue            Backend Processing         State Sync
    │                    │                            │                       │
    ├─► 完成练习 ───────► 生成 sessionId             │                       │
    │                    │                            │                       │
    │                    └──► 本地缓存+API调用 ───────► 写入DB               │
    │                         (失败时重试)    │        执行业务逻辑           │
    │                         │              │        (幂等处理)             │
    │                         │         ┌────┴────┐                         │
    │                         │         │ 成功/失败                          │
    │                         │         │         │                         │
    │                         │◄────────┴─────────┴────────────────────────┤
    │                         │                                             │
    └─ 结果页 ◄──────────────┘                                    同步到前端

```

---

## 2. 关键异步场景

### 2.1 获取练习结果 (查询类)

**场景**: 用户完成练习，点击"查看结果"

**异步操作链**:
```
1. 前端调用 GET /v1/practice/{sessionId}/result
2. 后端需要:
   - 查询 practice_sessions 表
   - 计算 childFeedback (实时计算不存储)
   - 按需查询 user_progress, achievements
   - 组装返回数据
3. 前端接收、解析、展示
```

**性能要求**: < 1000ms

**重试策略**:
```typescript
// 指数退避
retryCount = 0
maxRetries = 3
baseDelay = 500 // ms

async function fetchWithRetry(url, maxAttempts = maxRetries) {
  try {
    return await fetch(url);
  } catch (error) {
    if (retryCount < maxAttempts) {
      const delay = baseDelay * Math.pow(2, retryCount);
      await sleep(delay + Math.random() * 200); // 加入抖动
      retryCount++;
      return fetchWithRetry(url, maxAttempts);
    }
    throw error;
  }
}
```

**离线处理**:
```typescript
// 如果离线，使用本地Mock数据
const result = await fetchPracticeResult(sessionId)
  .catch(async (error) => {
    if (isOffline()) {
      console.warn('Network unavailable, using cached result');
      return getCachedResult(sessionId) || getMockScenario('good');
    }
    throw error;
  });
```

---

### 2.2 领取奖励 (写入类 - 幂等)

**场景**: 用户看到新获得的星星/成就，点击"领取"

**关键问题**: 防止同一reward被重复领取

**后端幂等性设计**:

```sql
-- 表结构
CREATE TABLE reward_claims (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(64) NOT NULL,
  reward_type ENUM('stars', 'xp', 'achievement') NOT NULL,
  user_id BIGINT NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 唯一约束，确保同一reward只能领取一次
  UNIQUE KEY unique_claim (session_id, reward_type, user_id)
);

-- 领取逻辑 (Go 伪代码)
func claimReward(sessionId, rewardType, userId) {
  // 先检查是否已领取
  existing := db.QueryRewardClaim(sessionId, rewardType, userId)
  if existing != nil {
    return { success: false, alreadyClaimed: true }
  }

  // 插入记录，利用UNIQUE约束实现幂等
  err := db.InsertRewardClaim(sessionId, rewardType, userId)
  if err != nil && isDuplicateKeyError(err) {
    // 其他请求已领取，返回已领取
    return { success: false, alreadyClaimed: true }
  }

  if err != nil {
    return { success: false, error: err }
  }

  // 更新用户统计
  updateUserStats(userId, rewardType)

  return { success: true, alreadyClaimed: false }
}
```

**前端实现**:

```typescript
// 防止重复点击
let claimInProgress = false;

async function handleClaimReward() {
  if (claimInProgress) return;

  claimInProgress = true;

  try {
    const result = await api.claimReward(sessionId, rewardType);

    if (result.alreadyClaimed) {
      // 已领取，跳过动画
      showMessage('You already claimed this reward!');
      return;
    }

    // 播放领取动画
    playRewardClaimAnimation();

  } finally {
    claimInProgress = false;
  }
}
```

---

### 2.3 实时更新用户进度

**场景**: 仪表板需要显示最新的学习进度

**可选方案**:

#### 方案1: 拉取模式 (简单，低复杂度)
```typescript
// 结果页每次加载都获取最新进度
const progressUpdate = resultData.progressUpdate;

// 当用户进入奖励页时，再次拉取最新进度
const latestProgress = await api.fetchUserProgress(userId);
```

**优点**: 实现简单，适合MVP
**缺点**: 离线时无法更新

#### 方案2: 推送模式 (实时，高复杂度)
```typescript
// 使用 WebSocket / Server-Sent Events
const eventSource = new EventSource(
  `${API_URL}/v1/progress/stream?sessionId=${sessionId}`
);

eventSource.onmessage = (event) => {
  const progressUpdate = JSON.parse(event.data);
  updateProgressUI(progressUpdate);
};
```

**后端实现 (Go)**:
```go
func (h *Handler) ProgressStream(w http.ResponseWriter, r *http.Request) {
  sessionId := r.URL.Query().Get("sessionId")

  // 设置SSE头
  w.Header().Set("Content-Type", "text/event-stream")
  w.Header().Set("Cache-Control", "no-cache")
  w.Header().Set("Connection", "keep-alive")

  // 监听进度更新事件
  progressChan := h.subscribeToProgress(sessionId)

  for progress := range progressChan {
    data, _ := json.Marshal(progress)
    fmt.Fprintf(w, "data: %s\n\n", data)
    w..(http.Flusher).Flush()
  }
}
```

**MVP推荐**: 方案1 (拉取模式)

---

### 2.4 事件上报队列

**问题**: 频繁上报事件可能成为性能瓶颈，用户可能在事件发送前离开页面

**解决方案: 本地队列 + 批量发送**

```typescript
// 事件队列管理
class EventQueue {
  private queue: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 10000; // 10秒

  constructor() {
    // 定期flush
    setInterval(() => this.flush(), this.flushInterval);

    // 页面卸载前flush
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  track(event: AnalyticsEvent) {
    this.queue.push(event);

    // 达到批量大小时立即发送
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const events = this.queue.splice(0);

    try {
      await fetch('/v1/analytics/batch', {
        method: 'POST',
        body: JSON.stringify({ events }),
        // keepalive 确保页面卸载时请求仍能发送
        keepalive: true,
      });
    } catch (error) {
      // 重新加入队列，稍后重试
      this.queue.unshift(...events);
      console.warn('Event flush failed, will retry later');
    }
  }
}

// 使用
const eventQueue = new EventQueue();
eventQueue.track({
  eventType: 'action_button_clicked',
  sessionId,
  params: { actionType: 'continue_practice' }
});
```

---

## 3. 网络状态管理

### 3.1 离线检测

```typescript
class NetworkStateManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  private setOnline(online: boolean) {
    if (this.isOnline === online) return;

    this.isOnline = online;
    this.listeners.forEach(listener => listener(online));
  }

  getStatus() {
    return this.isOnline;
  }

  subscribe(callback: (online: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}
```

### 3.2 离线数据同步

```typescript
// 当网络恢复时，同步待发送的操作
networkManager.subscribe((online) => {
  if (online) {
    syncPendingOperations();
  }
});

async function syncPendingOperations() {
  const pending = await getPendingOperations();

  for (const op of pending) {
    try {
      await executeOperation(op);
      await removePendingOperation(op.id);
    } catch (error) {
      console.error('Sync failed for operation', op.id, error);
      // 继续处理下一个
    }
  }
}
```

---

## 4. 超时与错误处理

### 4.1 请求超时策略

```typescript
const DEFAULT_TIMEOUT = 10000; // 10秒

async function fetchWithTimeout(url: string, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}
```

### 4.2 错误恢复层级

```typescript
async function fetchPracticeResultWithFallback(sessionId: string) {
  try {
    // 1. 尝试实时获取
    return await fetchPracticeResult(sessionId);

  } catch (error) {
    console.warn('Fetch failed, trying cache', error);

    try {
      // 2. 尝试本地缓存
      const cached = await loadFromLocalStorage(sessionId);
      if (cached) return cached;
    } catch (cacheError) {
      console.warn('Cache load failed', cacheError);
    }

    try {
      // 3. 使用Mock数据
      console.warn('Using mock data as fallback');
      return getMockScenario('good');
    } catch (mockError) {
      // 4. 最后的兜底：空状态
      return getEmptyResultState();
    }
  }
}
```

---

## 5. 并发控制

### 5.1 防止丧失竞态

**问题**: 用户快速切换页面时，多个API请求并发执行可能导致状态不一致

```typescript
class RequestConcurrencyControl {
  private activeRequests: Map<string, Promise<any>> = new Map();

  async fetch(key: string, fetcher: () => Promise<any>) {
    // 如果已有相同key的请求在进行，直接返回该Promise
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key);
    }

    const promise = fetcher()
      .finally(() => this.activeRequests.delete(key));

    this.activeRequests.set(key, promise);
    return promise;
  }
}

// 使用
const concurrencyControl = new RequestConcurrencyControl();

// 无论调用多少次，都只发送一个请求
const result = await concurrencyControl.fetch(
  `practice_result_${sessionId}`,
  () => api.fetchPracticeResult(sessionId)
);
```

---

## 6. 后端异步任务处理

### 6.1 长耗时操作异步化

**场景**: 计算childFeedback涉及多个表查询，可能耗时>500ms

**解决方案: 后台任务队列**

```
Request Handler    Message Queue    Worker Process    Database
    │                 │                  │               │
    ├─► 存储request ──► 发送任务消息      │               │
    │   返回202        │                  │               │
    │   成功受理        │      ┌──► 处理任务 ──────────────► 查询
    │                 │      │   计算反馈     更新結果表
    │                 │◄─────┴─ 发送完成通知
    │
    └─► 前端轮询/推送 获取结果
```

**Go代码示例**:
```go
// 接收请求，快速返回
func (h *Handler) GetPracticeResult(w http.ResponseWriter, r *http.Request) {
  sessionId := r.URL.Query().Get("sessionId")

  // 快速查询缓存或DB中是否有结果
  result := h.cache.Get(sessionId)
  if result != nil {
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(result)
    return
  }

  // 如果尚无结果，发送异步任务
  _ = h.taskQueue.Enqueue(&Task{
    Type:      "compute_practice_result",
    SessionId: sessionId,
  })

  // 返回202 Accepted，告知进行中
  w.WriteHeader(http.StatusAccepted)
  json.NewEncoder(w).Encode(map[string]interface{}{
    "status": "processing",
    "retryAfter": 2000, // 建议2秒后重试
  })
}

// 后台Worker处理
func (w *Worker) ProcessTask(task *Task) {
  if task.Type == "compute_practice_result" {
    result := w.computePracticeResult(task.SessionId)
    w.cache.Set(task.SessionId, result)
    w.db.SaveResult(result)
  }
}
```

**前端轮询**:
```typescript
async function waitForResult(sessionId: string, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(
        `/v1/practice/${sessionId}/result`,
        { headers: { 'X-Accept-Processing': '202' } }
      );

      if (response.status === 200) {
        return response.json();
      }

      if (response.status === 202) {
        // 还在处理中，等待后重试
        const retryAfter = response.headers.get('Retry-After') || '2000';
        await sleep(parseInt(retryAfter));
        continue;
      }

    } catch (error) {
      console.error('Request failed', error);
    }
  }

  throw new Error('Result computation timeout');
}
```

---

## 7. 本地存储策略

### 7.1 缓存键设计

```typescript
const CACHE_KEYS = {
  // Practice result: 1周有效期
  PRACTICE_RESULT: (sessionId: string) =>
    `practice_result:${sessionId}:${new Date().toISOString().split('T')[0]}`,

  // User progress: 1小时有效期
  USER_PROGRESS: (userId: string, timestamp: number) =>
    `user_progress:${userId}:${Math.floor(timestamp / 3600000)}`,

  // Pending operations: 直到成功
  PENDING_OPERATION: (operationId: string) =>
    `pending_op:${operationId}`,
};

const CACHE_TTL = {
  PRACTICE_RESULT: 7 * 24 * 3600 * 1000,    // 7天
  USER_PROGRESS: 1 * 3600 * 1000,            // 1小时
  EVENT_QUEUE: 30 * 24 * 3600 * 1000,        // 30天
};
```

### 7.2 缓存更新策略

```typescript
// 标记缓存中的某个key需要刷新
async function invalidateAndRefresh(key: string) {
  await localStorage.removeItem(key);

  // 异步重新加载
  if (key.startsWith('user_progress:')) {
    const userId = key.split(':')[1];
    const progress = await api.fetchUserProgress(userId);
    await cacheProgress(userId, progress);
  }
}
```

---

## 8. 监控与可观测性

### 8.1 关键指标

```typescript
// 记录异步操作性能
class PerformanceTracker {
  track(operationName: string, fn: () => Promise<any>) {
    const startTime = performance.now();

    return fn()
      .then(result => {
        const duration = performance.now() - startTime;
        console.log(`[Perf] ${operationName}: ${duration}ms`);

        // 上报到监控系统
        reportMetric(operationName, duration);

        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        console.error(`[Error] ${operationName}: ${duration}ms`, error);

        reportMetric(operationName, duration, error);
        throw error;
      });
  }
}

// 使用
const tracker = new PerformanceTracker();
const result = await tracker.track(
  'fetch_practice_result',
  () => fetchPracticeResult(sessionId)
);
```

### 8.2 日志记录

```typescript
// 记录关键事件流
const logger = {
  info: (msg: string, data?: any) =>
    console.log(`[INFO] ${timestamp()} ${msg}`, data),

  warn: (msg: string, data?: any) =>
    console.warn(`[WARN] ${timestamp()} ${msg}`, data),

  error: (msg: string, error?: Error) =>
    console.error(`[ERROR] ${timestamp()} ${msg}`, error),
};

// 记录返馈闭环流程
logger.info('Practice completed', { sessionId, questionCount: 3 });
logger.info('Fetching result...', { sessionId });
logger.info('Result received', { performanceTier: 'excellent' });
logger.info('Action clicked', { actionType: 'continue_practice' });
```

---

## 附录: 完整异步示例

```typescript
// 完整的异步flow示例
async function handlePracticeComplete(sessionId: string) {
  try {
    // 1. 显示过渡动画
    showCompletionAnimation();

    // 2. 获取结果（支持离线兜底）
    const resultData = await tracker.track(
      'fetch_practice_result',
      () => fetchPracticeResultWithFallback(sessionId)
    );

    // 3. 本地缓存
    await cacheResult(sessionId, resultData);

    // 4. 导航到结果页
    navigation.navigate('ResultFeedback', { resultData });

    // 5. 异步上报事件（不阻塞UI）
    eventQueue.track({
      eventType: 'result_page_viewed',
      sessionId,
      performanceTier: resultData.childFeedback.performanceTier,
    });

  } catch (error) {
    logger.error('Failed to handle practice complete', error);
    showErrorWithFallback(error);
  }
}

// 监听网络恢复时同步
networkManager.subscribe((online) => {
  if (online) {
    syncPendingOperations().catch(err =>
      logger.warn('Sync failed', err)
    );
  }
});
```

---

## 总结

| 场景 | 同步/异步 | 是否需幂等 | 离线支持 | 优先级 |
|------|----------|----------|---------|--------|
| 获取结果 | 异步(等待) | ✗ | ✓ | P0 |
| 领取奖励 | 异步 | ✓ | ✗ | P0 |
| 事件上报 | 异步(非阻塞) | ✗ | ✓ | P2 |
| 进度更新 | 异步(拉取) | ✗ | ✓ | P1 |
| 用户统计 | 异步(后台任务) | ✓ | ✗ | P2 |
