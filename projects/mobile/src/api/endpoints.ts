import { execute } from './client';
import {
  isAccessTokenResponse,
  isBookingsResponse,
  isCatalogResponse,
  isFavoritesResponse,
  isOwnerGymsResponse,
  isProfileResponse,
} from './response-validation';
import type { Booking, Catalog, OwnerGym, Profile } from '@/data/models';

import type { LoginCredentials, SignupDetails } from '@daghit/typings';
export type { LoginCredentials, SignupDetails } from '@daghit/typings';

export const signIn = (credentials: LoginCredentials) => {
  return execute<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: credentials,
    validate: isAccessTokenResponse,
  });
}

export const signUp = (details: SignupDetails) => {
  return execute<{ accessToken: string }>('/auth/signup', {
    method: 'POST',
    body: details,
    validate: isAccessTokenResponse,
  });
}

export const getDiscovery = () => {
  return execute<Catalog>('/discovery', {
    validate: isCatalogResponse,
  });
}

export const getMyProfile = () => {
  return execute<Profile>('/me', {
    authenticated: true,
    validate: isProfileResponse,
  });
}

export const getMyBookings = () => {
  return execute<Record<'upcoming' | 'previous' | 'canceled', Booking[]>>(
    '/me/bookings',
    {
      authenticated: true,
      validate: isBookingsResponse,
    },
  );
}

export const getMyFavorites = () => {
  return execute<string[]>('/me/favorites', {
    authenticated: true,
    validate: isFavoritesResponse,
  });
}

export const saveFavorite = (gymId: string) => {
  // The gym ID is the resource path, so this PUT intentionally has no body.
  return execute<string[]>(`/me/favorites/${encodeURIComponent(gymId)}`, {
    method: 'PUT',
    authenticated: true,
    validate: isFavoritesResponse,
  });
}

export const removeFavorite = (gymId: string) => {
  return execute<string[]>(`/me/favorites/${encodeURIComponent(gymId)}`, {
    method: 'DELETE',
    authenticated: true,
    validate: isFavoritesResponse,
  });
}

export const getOwnerGyms = () => {
  return execute<OwnerGym[]>('/owner/gyms', {
    authenticated: true,
    validate: data => isOwnerGymsResponse(data, false),
  });
}

export const createOwnerGym = (gym: Omit<OwnerGym, 'id'>) => {
  return execute<OwnerGym>('/owner/gyms', {
    method: 'POST',
    body: gym,
    authenticated: true,
    validate: data => isOwnerGymsResponse(data, true),
  });
}
