import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { LatLng } from 'react-native-maps';

export type DeviceLocationStatus = 'loading' | 'ready' | 'permission-denied' | 'unavailable';

type LocationAttempt = {
  location: LatLng | null;
  status: Exclude<DeviceLocationStatus, 'loading'>;
};

export function useDeviceLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const locationRef = useRef<LatLng | null>(null);
  const [status, setStatus] = useState<DeviceLocationStatus>('loading');
  const [isLocating, setIsLocating] = useState(true);

  const locate = useCallback(async (): Promise<LatLng | null> => {
    setIsLocating(true);
    setStatus('loading');
    const result = await readDeviceLocation(locationRef.current);
    locationRef.current = result.location;
    setLocation(result.location);
    setStatus(result.status);
    setIsLocating(false);
    return result.location;
  }, []);

  useEffect(() => {
    let active = true;
    void readDeviceLocation(null).then(result => {
      if (!active) return;
      locationRef.current = result.location;
      setLocation(result.location);
      setStatus(result.status);
      setIsLocating(false);
    });

    return () => { active = false; };
  }, []);

  return { location, status, isLocating, locate };
}

async function readDeviceLocation(fallback: LatLng | null): Promise<LocationAttempt> {
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { location: null, status: 'permission-denied' };

    const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 120_000, requiredAccuracy: 1_000 });
    try {
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return {
        location: { latitude: current.coords.latitude, longitude: current.coords.longitude },
        status: 'ready',
      };
    } catch {
      if (lastKnown) {
        return {
          location: { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude },
          status: 'ready',
        };
      }
      return { location: fallback, status: 'unavailable' };
    }
  } catch {
    return { location: fallback, status: 'unavailable' };
  }
}
