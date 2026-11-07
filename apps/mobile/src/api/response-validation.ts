import type { BookingStatus, Catalog, Profile, Booking, OwnerGym } from '@/data/models';

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

const hasStringId = (value: unknown): value is Record<string, unknown> => {
  return isObject(value) && typeof value.id === 'string';
}

const isRecordArray = (value: unknown): value is Record<string, unknown>[] => {
  return Array.isArray(value) && value.every(hasStringId);
}

const isMapListing = (value: unknown) => {
  if (!isObject(value))
  {
    return false;
  }

  const hasCoordinates =
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180;

  return typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    hasCoordinates;
}

export const isCatalogResponse = (value: unknown): value is Catalog => {
  if (!isObject(value) || !isRecordArray(value.gyms) || !isObject(value.listings))
  {
    return false;
  }

  const listingsByCategory = value.listings;
  const categories = ['Gyms', 'Classes', 'Personal training'];
  return categories.every(category => {
    const listings = listingsByCategory[category];
    return Array.isArray(listings) && listings.every(isMapListing);
  });
}

export const isBookingsResponse = (value: unknown): value is Record<BookingStatus, Booking[]> => {
  return isObject(value) &&
    isRecordArray(value.upcoming) &&
    isRecordArray(value.previous) &&
    isRecordArray(value.canceled);
}

export const isProfileResponse = (value: unknown): value is Profile => {
  return isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.phone === 'string' &&
    (value.plan === null || isObject(value.plan));
}

export const isAccessTokenResponse = (value: unknown): value is { accessToken: string } => {
  return isObject(value) && typeof value.accessToken === 'string';
}

export const isFavoritesResponse = (value: unknown): value is string[] => {
  return isStringArray(value);
}

export const isOwnerGymsResponse = (
  value: unknown,
  isCreateRequest: boolean,
): value is OwnerGym[] | OwnerGym => {
  if (isCreateRequest)
  {
    return hasStringId(value);
  }

  return isRecordArray(value);
}
