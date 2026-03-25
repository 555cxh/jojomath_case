/**
 * ActionButton 组件
 * 可定制的动作按钮，带有按压反馈
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SPACING } from '../constants/theme';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;           // Emoji图标
  rightContent?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  rightContent,
  disabled = false,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const base = {
      ...styles.button,
      ...sizeStyles[size],
    };

    if (disabled) {
      return { ...base, ...styles.disabled };
    }

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: COLORS.buttonPrimary };
      case 'secondary':
        return { ...base, backgroundColor: COLORS.buttonSecondary };
      case 'success':
        return { ...base, backgroundColor: COLORS.buttonSuccess };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: COLORS.primary,
        };
      default:
        return base;
    }
  };

  const getTextStyle = () => {
    const base = { ...styles.text, ...textSizeStyles[size] };

    if (variant === 'secondary') {
      return { ...base, color: COLORS.textPrimary };
    }
    if (variant === 'outline') {
      return { ...base, color: COLORS.primary };
    }
    return { ...base, color: COLORS.textLight };
  };

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[getButtonStyle(), fullWidth && styles.fullWidth]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.contentRow}>
          <Text style={getTextStyle()}>{label}</Text>
          {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const sizeStyles = StyleSheet.create({
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  large: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
  },
});

const textSizeStyles = StyleSheet.create({
  small: {
    fontSize: FONT_SIZES.small,
  },
  medium: {
    fontSize: FONT_SIZES.medium,
  },
  large: {
    fontSize: FONT_SIZES.large,
  },
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContent: {
    marginLeft: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
});

export default ActionButton;
