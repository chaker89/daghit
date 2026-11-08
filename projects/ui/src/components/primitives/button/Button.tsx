import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from './Button.styles';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

export function Button({ title, onPress, secondary = false, disabled = false, icon }: ButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, disabled && { opacity: 0.5 }, secondary && styles.secondary, pressed && styles.pressed]}>
      {icon}
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{title}</Text>
    </Pressable>
  );
}

