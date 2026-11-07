import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './Header.styles';

export type HeaderProps = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
};

export function Header({ title, onBack, right }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

