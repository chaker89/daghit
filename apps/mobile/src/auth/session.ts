import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type AccountType = 'member' | 'owner' | 'admin';
export type Session = { accessToken: string; userId: string; types: AccountType[]; expiresAt: number };
const key = 'daghit.accessToken';
let session: Session | null = null;
let generation = 0;
const listeners = new Set<() => void>();
let storageQueue = Promise.resolve();
const persist = (token: string | null) => {
  const write = async () => {
    // Web uses memory only until an HttpOnly cookie backend contract is supplied.
    if (Platform.OS === 'web') return;
    if (token) await SecureStore.setItemAsync(key, token);
    else await SecureStore.deleteItemAsync(key);
  };
  storageQueue = storageQueue.catch(() => {}).then(write);
  return storageQueue;
};
export function decodeSession(accessToken: string): Session {
  if (typeof accessToken !== 'string' || accessToken.split('.').length !== 3 || !accessToken.split('.')[2]) throw new Error('The server returned an invalid session.');
  const header = jwtDecode<{ alg?: string }>(accessToken, { header: true });
  if (!header.alg || header.alg.toLowerCase() === 'none') throw new Error('The server returned an unsigned session.');
  const claims = jwtDecode<{ userId?: string; sub?: string; type?: AccountType | AccountType[]; exp?: number }>(accessToken);
  const userId = claims.userId ?? claims.sub;
  const types = Array.isArray(claims.type) ? claims.type : [claims.type];
  if (typeof userId !== 'string' || !userId || !types.length || types.some(type => !['member', 'owner', 'admin'].includes(type ?? '')) || typeof claims.exp !== 'number' || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) throw new Error('The server returned an invalid or expired session.');
  return { accessToken, userId, types: types as AccountType[], expiresAt: claims.exp * 1000 };
}
export const getSession = () => session;
export const subscribeSession = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const publish = (value: Session | null) => { generation++; session = value; listeners.forEach(listener => listener()); };
export async function signInToken(token: string) { const next = decodeSession(token); const version = ++generation; await persist(token); if (version !== generation) throw new Error('The session changed. Please log in again.'); publish(next); return next; }
export function signOut() { publish(null); return persist(null); }
export function getAccessToken() {
  if (session && session.expiresAt <= Date.now()) { void signOut().catch(() => {}); return null; }
  return session?.accessToken ?? null;
}
export async function restoreSession() {
  const version = generation;
  try {
    const token = Platform.OS === 'web' ? null : await SecureStore.getItemAsync(key);
    if (version === generation && token) publish(decodeSession(token));
  } catch { if (version === generation) await signOut(); }
}
