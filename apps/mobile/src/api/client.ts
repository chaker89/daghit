import { createApiClient } from '@daghit/api-client';
import { getAccessToken, getSession, signOut } from '@/auth/session';
export const endpoints = {
  login: '/auth/login', signup: '/auth/signup', profile: '/me', catalog: '/discovery',
  bookings: '/me/bookings', favorites: '/me/favorites', ownerGyms: '/owner/gyms',
};
const transport = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? '', allowInsecure: __DEV__, getToken: getAccessToken,
  onUnauthorized: token => { if (getSession()?.accessToken === token) void signOut().catch(() => {}); },
});

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: unknown): boolean => Array.isArray(value) && value.every(x => typeof x === 'string');
const records = (value: unknown): boolean => Array.isArray(value) && value.every(x => object(x) && typeof x.id === 'string');
export async function request<T>(path: string, options: Parameters<typeof transport>[1] = {}): Promise<T> {
  const data = await transport<unknown>(path, options);
  let valid = true;
  if (path === endpoints.login || path === endpoints.signup) valid = object(data) && typeof data.accessToken === 'string';
  else if (path === endpoints.catalog) valid = object(data) && records(data.gyms) && object(data.listings) && ['Gyms', 'Classes', 'Personal training'].every(key => object(data.listings) && Array.isArray(data.listings[key]) && data.listings[key].every((item: unknown) => object(item) && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.latitude === 'number' && Number.isFinite(item.latitude) && Math.abs(item.latitude) <= 90 && typeof item.longitude === 'number' && Number.isFinite(item.longitude) && Math.abs(item.longitude) <= 180));
  else if (path === endpoints.bookings) valid = object(data) && ['upcoming', 'previous', 'canceled'].every(key => records(data[key]));
  else if (path.startsWith(endpoints.favorites)) valid = strings(data);
  else if (path === endpoints.ownerGyms) valid = options.method === 'POST' ? object(data) && typeof data.id === 'string' : records(data);
  else if (path === endpoints.profile) valid = object(data) && typeof data.id === 'string' && typeof data.name === 'string' && typeof data.email === 'string' && typeof data.phone === 'string' && (data.plan === null || object(data.plan));
  if (!valid) throw new Error('The service returned an unexpected response. Please try again later.');
  return data as T;
}
