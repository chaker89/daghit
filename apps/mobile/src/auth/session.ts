import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';

export type AccountType = 'member' | 'owner' | 'admin';
export type Session = {
  accessToken: string;
  userId: string;
  types: AccountType[];
  expiresAt: number;
};

const key = 'daghit.accessToken';
// Keep the active session in memory so screens and API requests can read the same identity.
let session: Session | null = null;
// A version counter prevents a slow storage read or login from restoring an older session.
let generation = 0;
const listeners = new Set<() => void>();
// Serialize writes so a late save cannot overwrite a newer logout or login.
let storageQueue = Promise.resolve();

const persist = (token: string | null) => {
  const write = async () => {
    // Native apps keep the token in the OS secure store. Web needs a cookie-based session contract.
    if (Platform.OS === 'web') {
      return;
    }

    if (token) {
      await SecureStore.setItemAsync(key, token);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  };

  storageQueue = storageQueue.catch(() => {}).then(write);
  return storageQueue;
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
  await persist(token);

  // A logout or newer login may have happened while secure storage was writing.
  if (version !== generation) {
    throw new Error('The session changed. Please log in again.');
  }

  publish(next);
  return next;
};

// Clear memory immediately, then remove the saved token from secure storage.
export const signOut = () => {
  publish(null);
  return persist(null);
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
