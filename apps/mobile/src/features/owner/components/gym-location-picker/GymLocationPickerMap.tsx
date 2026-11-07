import { MapCanvas, MapPin } from '@daghit/ui/maps';
import type { LatLng } from 'react-native-maps';
import { brand } from '@/constants/brand';
import { BEIRUT_CENTER, BEIRUT_REGION } from '@/features/discovery/location/geo';
import { styles } from './GymLocationPickerMap.styles';

type GymLocationPickerMapProps = {
  coordinate: LatLng;
  onCoordinateChange: (coordinate: LatLng) => void;
};

export function GymLocationPickerMap({ coordinate = BEIRUT_CENTER, onCoordinateChange }: GymLocationPickerMapProps) {
  return (
    <MapCanvas
      style={styles.map}
      initialRegion={BEIRUT_REGION}
      mapType="standard"
      onPress={event => onCoordinateChange(event.nativeEvent.coordinate)}
      showsCompass={false}
      toolbarEnabled={false}>
      <MapPin
        coordinate={coordinate}
        draggable
        pinColor={brand.teal}
        title="Gym location"
        description="Drag the pin or tap the map to adjust"
        onDragEnd={event => onCoordinateChange(event.nativeEvent.coordinate)}
      />
    </MapCanvas>
  );
}
