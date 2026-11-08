import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';

import type { AccountType } from '@daghit/typings';
export type { AccountType } from '@daghit/typings';
export type Session = {
  accessToken: string;
  userId: string;
  types: AccountType[];
  expiresAt: number;
};

// SecureStore saves values under a text key. This key names the one value containing our JWT.
const key = 'daghit.accessToken';
// This copy is only in app memory. It lets screens and requests use the session without reading storage each time.
let session: Session | null = null;
// A version counter prevents a slow storage read or login from restoring an older session.
let generation = 0;
const listeners = new Set<() => void>();
// SecureStore writes are asynchronous. Queue them in order so an older save cannot finish after a newer logout.
let storageWriteQueue = Promise.resolve();

// Save a token on iOS/Android, or remove it when token is null. The returned promise lets login/logout wait for storage.
const storeToken = (token: string | null) => {
  const writeToken = async () => {
    // Expo SecureStore uses the device's secure storage. We do not persist a token on web;
    // web login needs a backend cookie contract before it can survive a page reload.
    if (Platform.OS === 'web') {
      return;
    }

    if (token) {
      // Login: write the new JWT under the key above, replacing any previous value.
      await SecureStore.setItemAsync(key, token);
      return;
    }

    // Logout or expiry: remove the saved JWT so the next launch cannot restore it.
    await SecureStore.deleteItemAsync(key);
  };

  // Keep this write behind the previous one. If that write failed, catch lets this one still run.
  storageWriteQueue = storageWriteQueue.catch(() => {}).then(writeToken);
  return storageWriteQueue;
};

// Read the identity and capabilities the UI needs from the server-issued JWT.
// Decoding checks the token's shape and expiry, but does not verify its signature;
// the backend must verify the token and permissions on every protected request.
export const decodeSession = (accessToken: string): Session => {
  const isMalformed =
    typeof accessToken !== 'string' ||
    accessToken.split('.').length !== 3 ||
    !accessToken.split('.')[2];

  if (isMalformed) {
    throw new Error('The server returned an invalid session.');
  }

  const header = jwtDecode<{ alg?: string }>(accessToken, { header: true });
  const isUnsigned = !header.alg || header.alg.toLowerCase() === 'none';

  if (isUnsigned) {
    throw new Error('The server returned an unsigned session.');
  }

  const claims = jwtDecode<{
    userId?: string;
    sub?: string;
    type?: AccountType | AccountType[];
    exp?: number;
  }>(accessToken);
  const userId = claims.userId ?? claims.sub;
  // A user can have more than one capability, such as both member and owner.
  const types = Array.isArray(claims.type) ? claims.type : [claims.type];
  const validTypes = types.length > 0 && types.every(type =>
    type === 'member' || type === 'owner' || type === 'admin');
  const validExpiry = typeof claims.exp === 'number' &&
    Number.isFinite(claims.exp) && claims.exp * 1000 > Date.now();

  if (typeof userId !== 'string' || !userId || !validTypes || !validExpiry) {
    throw new Error('The server returned an invalid or expired session.');
  }

  return {
    accessToken,
    userId,
    types: types as AccountType[],
    expiresAt: claims.exp! * 1000,
  };
};

export const getSession = () => session;

export const subscribeSession = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const publish = (value: Session | null) => {
  generation++;
  session = value;
  listeners.forEach(listener => listener());
};

// Save a successful login token before exposing it to the rest of the app.
export const signInToken = async (token: string) => {
  const next = decodeSession(token);
  const version = ++generation;
  // Wait until the token is saved before publishing the session or opening signed-in screens.
  await storeToken(token);

  // A logout or newer login may have happened while secure storage was writing.
  if (version !== generation) {
    throw new Error('The session changed. Please log in again.');
  }

  publish(next);
  return next;
};

// Remove the in-memory session immediately, then delete the saved token from secure storage.
export const signOut = () => {
  publish(null);
  return storeToken(null);
};

// Axios calls this just before sending a protected request; expired tokens are discarded.
export const getAccessToken = () => {
  if (session && session.expiresAt <= Date.now()) {
    void signOut().catch(() => {});
    return null;
  }

  return session?.accessToken ?? null;
};

// Restore a saved native token when the app starts. Invalid or expired tokens are cleared.
export const restoreSession = async () => {
  const version = generation;

  try {
    const token = Platform.OS === 'web' ? null : await SecureStore.getItemAsync(key);

    if (version === generation && token) {
      publish(decodeSession(token));
    }
  } catch {
    if (version === generation) {
      await signOut();
    }
  }
};
