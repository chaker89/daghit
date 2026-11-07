import type { PropsWithChildren, ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { type MapViewProps } from 'react-native-maps';
import { styles } from './MapCanvas.styles';

export type MapCanvasProps = PropsWithChildren<Omit<MapViewProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  overlays?: ReactNode;
}>;

export function MapCanvas({ children, overlays, style, ...mapProps }: MapCanvasProps) {
  return (
    <View style={[styles.container, style]}>
      <MapView {...mapProps} style={styles.map}>{children}</MapView>
      {overlays}
    </View>
  );
}

