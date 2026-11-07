import { useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { LatLng, MapViewProps } from 'react-native-maps';
import type { MapCanvasProps } from '../map-canvas';
import { MapCanvas } from '../map-canvas';
import { MapOverlay } from '../map-overlay';
import { MapPin } from '../map-pin';
import { styles } from './MapExplorer.styles';

export type MapExplorerItem = {
  id: string;
  coordinate: LatLng;
  title: string;
  subtitle?: string;
  markerColor?: string;
};

export type MapExplorerProps<Item extends MapExplorerItem> = {
  items: readonly Item[];
  mapProps?: Omit<MapCanvasProps, 'children' | 'overlays' | 'onPress'>;
  onMapPress?: MapViewProps['onPress'];
  onOpenItem: (item: Item) => void;
  onSelectItem?: (item: Item) => void;
  onDismissSelection?: () => void;
  overlays?: ReactNode;
  detailsLabel?: string;
};

/** A reusable map pattern: coordinate markers, a selected-item preview, and an app-owned details action. */
export function MapExplorer<Item extends MapExplorerItem>({
  items,
  mapProps,
  onMapPress,
  onOpenItem,
  onSelectItem,
  onDismissSelection,
  overlays,
  detailsLabel = 'View details',
}: MapExplorerProps<Item>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = items.find(item => item.id === selectedId) ?? null;

  const dismissSelection = () => {
    setSelectedId(null);
    onDismissSelection?.();
  };

  return (
    <MapCanvas
      {...mapProps}
      onPress={event => {
        dismissSelection();
        onMapPress?.(event);
      }}
      overlays={(
        <MapOverlay style={styles.overlay}>
          {overlays}
          {selectedItem && (
            <View style={styles.previewWrap}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${detailsLabel} for ${selectedItem.title}`}
                onPress={() => onOpenItem(selectedItem)}
                style={styles.preview}>
                <View style={styles.copy}>
                  <Text numberOfLines={1} style={styles.title}>{selectedItem.title}</Text>
                  {selectedItem.subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{selectedItem.subtitle}</Text> : null}
                </View>
                <Text style={styles.action}>{detailsLabel} ›</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss selected map item"
                hitSlop={8}
                onPress={dismissSelection}
                style={styles.close}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
          )}
        </MapOverlay>
      )}>
      {items.map(item => (
        <MapPin
          key={item.id}
          coordinate={item.coordinate}
          pinColor={item.markerColor}
          onPress={() => {
            setSelectedId(item.id);
            onSelectItem?.(item);
          }}
          tracksViewChanges={false} />
      ))}
    </MapCanvas>
  );
}
