import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from './MapOverlay.styles';

export type MapOverlayProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
}>;

export function MapOverlay({ children, style, pointerEvents = 'box-none' }: MapOverlayProps) {
  return <View pointerEvents={pointerEvents} style={[styles.overlay, style]}>{children}</View>;
}
