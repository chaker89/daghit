import type { LatLng, Region } from 'react-native-maps';
import type { MapListing } from '@/data/models';

export const BEIRUT_CENTER: LatLng = { latitude: 33.8938, longitude: 35.5018 };
export const BEIRUT_REGION: Region = {
  ...BEIRUT_CENTER,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const INITIAL_RESULTS_TO_FIT = 3;
const MIN_REGION_DELTA = 0.025;
const MAX_AUTO_FIT_DELTA = 0.3;
const USER_FOCUS_DELTA = 0.045;

export type DiscoveryViewport = {
  region: Region;
  listingIds: string[];
  canShowNearbyListings: boolean;
};

export function createDiscoveryViewport(userLocation: LatLng | null, listings: MapListing[]): DiscoveryViewport {
  const origin = userLocation ?? BEIRUT_CENTER;
  const nearestListings = userLocation
    ? [...listings].sort((a, b) => distanceKm(userLocation, a) - distanceKm(userLocation, b)).slice(0, INITIAL_RESULTS_TO_FIT)
    : listings.slice(0, INITIAL_RESULTS_TO_FIT);

  if (!nearestListings.length) {
    return {
      region: userLocation ? around(userLocation) : BEIRUT_REGION,
      listingIds: [],
      canShowNearbyListings: !userLocation,
    };
  }

  const points = [origin, ...nearestListings.map(listing => ({ latitude: listing.latitude, longitude: listing.longitude }))];
  const bounds = boundsToRegion(points);
  if (userLocation && Math.max(bounds.latitudeDelta, bounds.longitudeDelta) > MAX_AUTO_FIT_DELTA) {
    return { region: around(userLocation), listingIds: [], canShowNearbyListings: false };
  }

  return {
    region: bounds,
    listingIds: nearestListings.map(listing => listing.id),
    canShowNearbyListings: true,
  };
}

function around(coordinate: LatLng): Region {
  return { ...coordinate, latitudeDelta: USER_FOCUS_DELTA, longitudeDelta: USER_FOCUS_DELTA };
}

function boundsToRegion(points: LatLng[]): Region {
  const latitudes = points.map(point => point.latitude);
  const longitudes = points.map(point => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.4, MIN_REGION_DELTA),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.4, MIN_REGION_DELTA),
  };
}

function distanceKm(from: LatLng, to: Pick<MapListing, 'latitude' | 'longitude'>): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDifference = radians(to.latitude - from.latitude);
  const longitudeDifference = radians(to.longitude - from.longitude);
  const fromLatitude = radians(from.latitude);
  const toLatitude = radians(to.latitude);
  const haversine = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDifference / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
