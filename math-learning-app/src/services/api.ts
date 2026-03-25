/**
 * API 服务层
 * 封装与后端的所有交互逻辑
 * 当前使用Mock数据，真实环境替换为实际API调用
 */

import {
  PracticeResultResponse,
  AnalyticsEvent,
  ActionClickEvent,
} from '../types';
import { getMockScenario } from '../mock/scenarios';

// API 基础配置
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'https://api.mathbuddy.com',
  timeout: 10000,
  retryCount: 3,
};

// 请求头
const getHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  'X-Client-Version': '1.0.0',
  'X-Platform': 'mobile',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * 获取练习结果
 * 练习完成后调用此接口获取反馈数据
 */
export const fetchPracticeResult = async (
  sessionId: string,
  authToken?: string
): Promise<PracticeResultResponse> => {
  // === Mock 模式 ===
  // Demo中使用Mock数据，随机返回一个场景
  if (process.env.USE_MOCK === 'true' || true) {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 随机选择一个场景用于演示
    const tiers = ['excellent', 'good', 'keep_trying'] as const;
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
    return getMockScenario(randomTier);
  }

  // === 真实API调用 ===
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/v1/practice/${sessionId}/result`,
      {
        method: 'GET',
        headers: getHeaders(authToken),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: PracticeResultResponse = await response.json();

    // 验证响应数据完整性
    if (!data.sessionId || !data.childFeedback || !data.parentInsight) {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch practice result:', error);
    throw error;
  }
};

/**
 * 领取奖励
 * 防止重复领取的关键接口
 */
export const claimReward = async (
  sessionId: string,
  rewardType: 'stars' | 'xp' | 'achievement',
  authToken: string
): Promise<{ success: boolean; alreadyClaimed: boolean }> => {
  // === Mock 模式 ===
  if (process.env.USE_MOCK === 'true' || true) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true, alreadyClaimed: false };
  }

  // === 真实API调用 ===
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/v1/rewards/claim`,
      {
        method: 'POST',
        headers: getHeaders(authToken),
        body: JSON.stringify({
          sessionId,
          rewardType,
          clientTimestamp: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      // 409 表示已领取
      if (response.status === 409) {
        return { success: false, alreadyClaimed: true };
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return { success: true, alreadyClaimed: false };
  } catch (error) {
    console.error('Failed to claim reward:', error);
    throw error;
  }
};

/**
 * 上报用户行为事件
 * 用于分析和优化产品
 */
export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
  // === Mock 模式 ===
  if (process.env.USE_MOCK === 'true' || true) {
    console.log('[Analytics]', event.eventType, event.params);
    return;
  }

  // === 真实API调用 ===
  try {
    // 使用 beacon API 或队列机制确保事件不丢失
    await fetch(`${API_CONFIG.baseUrl}/v1/analytics/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event),
      // keepalive 确保页面离开时请求仍能发送
      keepalive: true,
    });
  } catch (error) {
    // 事件上报失败不应阻塞用户操作
    console.warn('Event tracking failed:', error);
  }
};

/**
 * 上报动作按钮点击
 * 专门用于追踪结果页的用户行为
 */
export const trackActionClick = async (
  event: Omit<ActionClickEvent, 'eventType' | 'timestamp'>
): Promise<void> => {
  const fullEvent: ActionClickEvent = {
    ...event,
    eventType: 'action_button_clicked',
    timestamp: new Date().toISOString(),
  };

  await trackEvent(fullEvent);
};

/**
 * 获取下一轮练习配置
 * 基于本轮表现智能推荐
 */
export const fetchNextPracticeConfig = async (
  userId: string,
  lastSessionId: string,
  authToken: string
): Promise<{
  practiceType: string;
  difficulty: number;
  questionCount: number;
  focusSkills: string[];
}> => {
  // === Mock 模式 ===
  if (process.env.USE_MOCK === 'true' || true) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      practiceType: 'addition_basics',
      difficulty: 2,
      questionCount: 3,
      focusSkills: ['Single digit addition'],
    };
  }

  // === 真实API调用 ===
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/v1/practice/next`,
      {
        method: 'POST',
        headers: getHeaders(authToken),
        body: JSON.stringify({
          userId,
          lastSessionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch next practice config:', error);
    throw error;
  }
};

export default {
  fetchPracticeResult,
  claimReward,
  trackEvent,
  trackActionClick,
  fetchNextPracticeConfig,
};
