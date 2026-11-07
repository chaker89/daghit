import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { request, endpoints } from '@/api/client';
import { useSession } from '@/auth/SessionProvider';
import { getSession } from '@/auth/session';
import type { Catalog, OwnerGym, Booking, BookingStatus } from './models';
const empty: Catalog = { gyms: [], listings: { Gyms: [], Classes: [], 'Personal training': [] } };
function useApiDataValue() {
  const session = useSession();
  const [dataSession, setDataSession] = useState<typeof session>(null);
  const [catalog, setCatalog] = useState(empty);
  const [ownerGyms, setOwnerGyms] = useState<OwnerGym[]>([]);
  const [favoriteGymIds, setFavorites] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Record<BookingStatus, Booking[]>>({ upcoming: [], previous: [], canceled: [] });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(null); setCatalog(empty); setOwnerGyms([]); setFavorites([]); setBookings({ upcoming: [], previous: [], canceled: [] });
      setDataSession(session);
      const current = () => active && getSession() === session;
      const tasks: Promise<unknown>[] = [request<Catalog>(endpoints.catalog).then(data => { if (current()) setCatalog(data); })];
      if (session) {
        tasks.push(
          request<string[]>(endpoints.favorites, { authenticated: true }).then(data => { if (current()) setFavorites(data); }),
          request<Record<BookingStatus, Booking[]>>(endpoints.bookings, { authenticated: true }).then(data => { if (current()) setBookings(data); }),
        );
        if (session.types.includes('owner')) tasks.push(request<OwnerGym[]>(endpoints.ownerGyms, { authenticated: true }).then(data => { if (current()) setOwnerGyms(data); }));
      }
      const results = await Promise.allSettled(tasks);
      if (current()) {
        const failure = results.find(result => result.status === 'rejected');
        if (failure?.status === 'rejected') setError(failure.reason instanceof Error ? failure.reason.message : 'Unable to load data.');
        setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [session, reload]);
  const refresh = useCallback(() => setReload(value => value + 1), []);
  const addOwnerGym = async (gym: Omit<OwnerGym, 'id'>) => {
    const current = getSession();
    const saved = await request<OwnerGym>(endpoints.ownerGyms, { method: 'POST', body: gym, authenticated: true });
    if (getSession() === current) setOwnerGyms(items => [...items, saved]);
  };
  const toggleFavorite = async (gymId: string) => {
    const current = getSession();
    const next = await request<string[]>(`${endpoints.favorites}/${encodeURIComponent(gymId)}`, { method: favoriteGymIds.includes(gymId) ? 'DELETE' : 'PUT', authenticated: true });
    if (getSession() === current) setFavorites(next);
  };
  return { catalog, ownerGyms: session && dataSession === session ? ownerGyms : [], favoriteGymIds: session && dataSession === session ? favoriteGymIds : [], bookings: session && dataSession === session ? bookings : { upcoming: [], previous: [], canceled: [] }, addOwnerGym, toggleFavorite, error, loading, refresh };
}
const Context = createContext<ReturnType<typeof useApiDataValue> | null>(null);
export function ApiDataProvider({ children }: PropsWithChildren) { const value = useApiDataValue(); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useApiData() { const value = useContext(Context); if (!value) throw new Error('ApiDataProvider is missing'); return value; }
