/**
 * NextPracticeScreen
 * 后续练习入口 / Demo场景选择页
 * 在Demo中用于切换不同表现场景
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
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
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NextPractice'>;
type RouteProps = RouteProp<RootStackParamList, 'NextPractice'>;

const SCENARIO_OPTIONS = [
  { label: '对3题', scenarioIndex: 0 },
  { label: '对2题', scenarioIndex: 1 },
  { label: '对1题', scenarioIndex: 2 },
];

const NextPracticeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const [selectedScenario, setSelectedScenario] = useState(0);

  const isContinuousPractice = route.params?.isContinuousPractice ?? false;
  const continuousPracticeCount = route.params?.continuousPracticeCount ?? 0;
  const bonusStarPending = (route.params?.bonusStarPending ?? false) && isContinuousPractice;

  const handleStartPractice = () => {
    // 进入Demo流程，携带当前选择场景
    navigation.navigate('PracticeComplete', {
      sessionId: `demo_${Date.now()}`,
      demoScenarioIndex: selectedScenario,
      isContinuousPractice,
      continuousPracticeCount,
      bonusStarPending,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/jojo_write.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.bottomPanel}>
          <Text style={styles.sectionTitle}>选择练习结果</Text>
          <Text style={styles.sectionSubtitle}>请选择本次答对题数</Text>

          <View style={styles.scenarioList}>
            {SCENARIO_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.scenarioCard,
                selectedScenario === option.scenarioIndex && styles.scenarioCardSelected,
              ]}
              onPress={() => setSelectedScenario(option.scenarioIndex)}
            >
              <Text style={styles.scenarioLabel}>{option.label}</Text>
              {selectedScenario === option.scenarioIndex && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>已选择</Text>
                </View>
              )}
            </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionsSection}>
            <ActionButton
              label="完成答题，进入 Demo"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleStartPractice}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  background: {
    flex: 1,
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    textAlign: 'center',
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  scenarioList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  scenarioCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: '#E7E1FF',
  },
  scenarioCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F4F0FF',
  },
  scenarioLabel: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  selectedText: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 'auto',
  },
});

export default NextPracticeScreen;
