import { Marker, type LatLng, type MapMarkerProps } from 'react-native-maps';

export type MapPinProps = Omit<MapMarkerProps, 'coordinate'> & {
  coordinate: LatLng;
};

export function MapPin(props: MapPinProps) {
  return <Marker {...props} />;
}
