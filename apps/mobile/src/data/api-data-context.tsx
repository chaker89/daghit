import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import {
  createOwnerGym,
  getDiscovery,
  getMyBookings,
  getMyFavorites,
  getOwnerGyms,
  removeFavorite,
  saveFavorite,
} from '@/api/endpoints';
import { useSession } from '@/auth/SessionProvider';
import { getSession } from '@/auth/session';
import type { Catalog, OwnerGym, Booking, BookingStatus } from './models';

const emptyCatalog: Catalog = {
  gyms: [],
  listings: { Gyms: [], Classes: [], 'Personal training': [] },
};
const emptyBookings: Record<BookingStatus, Booking[]> = {
  upcoming: [],
  previous: [],
  canceled: [],
};

function useApiDataValue() {
  const session = useSession();
  const [dataSession, setDataSession] = useState<typeof session>(null);
  const [catalog, setCatalog] = useState(emptyCatalog);
  const [ownerGyms, setOwnerGyms] = useState<OwnerGym[]>([]);
  const [favoriteGymIds, setFavorites] = useState<string[]>([]);
  const [bookings, setBookings] = useState(emptyBookings);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      setCatalog(emptyCatalog);
      setOwnerGyms([]);
      setFavorites([]);
      setBookings(emptyBookings);
      setDataSession(session);

      const isCurrentSession = () => active && getSession() === session;
      const tasks: Promise<unknown>[] = [
        getDiscovery().then(data => {
          if (isCurrentSession()) {
            setCatalog(data);
          }
        }),
      ];

      if (session) {
        tasks.push(
          getMyFavorites().then(data => {
            if (isCurrentSession()) {
              setFavorites(data);
            }
          }),
          getMyBookings().then(data => {
            if (isCurrentSession()) {
              setBookings(data);
            }
          }),
        );

        if (session.types.includes('owner')) {
          tasks.push(getOwnerGyms().then(data => {
            if (isCurrentSession()) {
              setOwnerGyms(data);
            }
          }));
        }
      }

      const results = await Promise.allSettled(tasks);
      if (isCurrentSession()) {
        const failure = results.find(result => result.status === 'rejected');
        if (failure?.status === 'rejected') {
          setError(failure.reason instanceof Error ? failure.reason.message : 'Unable to load data.');
        }
        setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [session, reload]);

  const refresh = useCallback(() => setReload(value => value + 1), []);

  const addOwnerGym = async (gym: Omit<OwnerGym, 'id'>) => {
    const currentSession = getSession();
    const saved = await createOwnerGym(gym);

    if (getSession() === currentSession) {
      setOwnerGyms(items => [...items, saved]);
    }
  };

  const toggleFavorite = async (gymId: string) => {
    const currentSession = getSession();
    const next = favoriteGymIds.includes(gymId)
      ? await removeFavorite(gymId)
      : await saveFavorite(gymId);

    if (getSession() === currentSession) {
      setFavorites(next);
    }
  };

  const ownsData = session !== null && dataSession === session;
  return {
    catalog,
    ownerGyms: ownsData ? ownerGyms : [],
    favoriteGymIds: ownsData ? favoriteGymIds : [],
    bookings: ownsData ? bookings : emptyBookings,
    addOwnerGym,
    toggleFavorite,
    error,
    loading,
    refresh,
  };
}

const Context = createContext<ReturnType<typeof useApiDataValue> | null>(null);

export function ApiDataProvider({ children }: PropsWithChildren) {
  const value = useApiDataValue();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApiData() {
  const value = useContext(Context);
  if (!value) {
    throw new Error('ApiDataProvider is missing');
  }
  return value;
}
