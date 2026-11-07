import type { PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './Screen.styles';

export type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  bottomInset?: boolean;
}>;

export function Screen({ children, scroll = true, bottomInset = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={bottomInset ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{children}</ScrollView> : children}
    </SafeAreaView>
  );
}

