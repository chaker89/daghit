import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { AccountType, Booking, BookingStatus, Gym, OwnerGym } from '@daghit/typings';

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  types: AccountType[];
};

// Only this module knows about SQLite. Replace it with a database-service adapter later.
export const createRepository = (path: string) => {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gyms (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      published INTEGER NOT NULL DEFAULT 0,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT REFERENCES users(id),
      gym_id TEXT REFERENCES gyms(id),
      PRIMARY KEY(user_id, gym_id)
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      status TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `);
  const readUser = (row: unknown): User | undefined => {
    if (!row)
    {
      return undefined;
    }
    return JSON.parse((row as { payload: string }).payload);
  };
  const userById = (id: string) => readUser(db.prepare('SELECT payload FROM users WHERE id = ?').get(id));
  const userByEmail = (email: string) => readUser(db.prepare('SELECT payload FROM users WHERE email = ?').get(email));
  const createUser = (input: Omit<User, 'id'>) => {
    const user = {
      ...input,
      id: randomUUID(),
    };
    db.prepare('INSERT INTO users VALUES (?, ?, ?)').run(user.id, user.email, JSON.stringify(user));
    return user;
  };
  const grantOwner = (email: string) => {
    const user = userByEmail(email);
    if (!user)
    {
      throw new Error('User not found');
    }
    user.types = [...new Set<AccountType>([...user.types, 'owner'])];
    db.prepare('UPDATE users SET payload = ? WHERE id = ?').run(JSON.stringify(user), user.id);
  };
  const ownerGyms = (userId: string): OwnerGym[] => db
    .prepare('SELECT payload FROM gyms WHERE owner_id = ?')
    .all(userId)
    .map(row => JSON.parse(row.payload as string));
  const createGym = (userId: string, input: Omit<OwnerGym, 'id'>): OwnerGym => {
    const gym = {
      ...input,
      id: randomUUID(),
    };
    db.prepare('INSERT INTO gyms (id, owner_id, payload) VALUES (?, ?, ?)').run(gym.id, userId, JSON.stringify(gym));
    return gym;
  };
  const publicGyms = (): Gym[] => db.prepare('SELECT payload FROM gyms WHERE published = 1').all().map(row => {
    const gym: OwnerGym = JSON.parse(row.payload as string);
    return {
      ...gym,
      area: `${gym.address}, ${gym.city}`,
      rating: '',
      reviews: 0,
    };
  });
  const favorites = (userId: string): string[] => db
    .prepare('SELECT gym_id FROM favorites WHERE user_id = ?')
    .all(userId)
    .map(row => row.gym_id as string);
  const favoriteExists = (gymId: string) => Boolean(db.prepare('SELECT id FROM gyms WHERE id = ? AND published = 1').get(gymId));
  const setFavorite = (userId: string, gymId: string, saved: boolean) => {
    if (saved)
    {
      db.prepare('INSERT OR IGNORE INTO favorites VALUES (?, ?)').run(userId, gymId);
    }
    else
    {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND gym_id = ?').run(userId, gymId);
    }
    return favorites(userId);
  };
  const bookings = (userId: string): Record<BookingStatus, Booking[]> => {
    const result: Record<BookingStatus, Booking[]> = {
      upcoming: [],
      previous: [],
      canceled: [],
    };
    for (const row of db.prepare('SELECT status, payload FROM bookings WHERE user_id = ?').all(userId))
    {
      const status = row.status as BookingStatus;
      if (status in result)
      {
        result[status].push(JSON.parse(row.payload as string));
      }
    }
    return result;
  };
  return {
    userById,
    userByEmail,
    createUser,
    grantOwner,
    ownerGyms,
    createGym,
    publicGyms,
    favorites,
    favoriteExists,
    setFavorite,
    bookings,
    close: () => db.close(),
  };
};
export type Repository = ReturnType<typeof createRepository>;
