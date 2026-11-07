import { useEffect, useState, useSyncExternalStore, type PropsWithChildren } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { Redirect } from 'expo-router';
import { getSession, restoreSession, signOut, subscribeSession, type AccountType } from './session';
export const useSession = () => useSyncExternalStore(subscribeSession, getSession, () => null);
export function SessionProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const session = useSession();
  useEffect(() => { void restoreSession().catch(() => {}).finally(() => setReady(true)); }, []);
  useEffect(() => {
    if (!session) return;
    const expire = () => { if (Date.now() >= session.expiresAt) void signOut().catch(() => {}); };
    const timer = setInterval(expire, 1000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') expire(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [session]);
  return ready ? children : <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
}
export function AccountGate({ children, type }: PropsWithChildren<{ type?: AccountType }>) {
  const session = useSession();
  if (!session) return <Redirect href="/login" />;
  if (type && !session.types.includes(type)) return <Redirect href="/member/discover" />;
  return children;
}
