/**
 * 导航配置
 * 定义App的页面导航结构和转场动画
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PracticeCompleteScreen,
  ResultFeedbackScreen,
  DetailReviewScreen,
  RewardScreen,
  NextPracticeScreen,
} from '../screens';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="NextPractice"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        {/* Demo入口/下一轮练习 */}
        <Stack.Screen
          name="NextPractice"
          component={NextPracticeScreen}
          options={{
            animation: 'fade',
          }}
        />

        {/* 练习完成过渡页 */}
        <Stack.Screen
          name="PracticeComplete"
          component={PracticeCompleteScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false, // 禁止手势返回
          }}
        />

        {/* 结果反馈页（核心页面） */}
        <Stack.Screen
          name="ResultFeedback"
          component={ResultFeedbackScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />

        {/* 详情查看页 */}
        <Stack.Screen
          name="DetailReview"
          component={DetailReviewScreen}
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />

        {/* 奖励/进度中心 */}
        <Stack.Screen
          name="RewardCenter"
          component={RewardScreen}
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
