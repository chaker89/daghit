import { SessionProvider } from '@/auth/SessionProvider';
import { Stack } from 'expo-router';
import { ApiDataProvider } from '@/data/api-data-context';

export default function RootLayout() {
  return <SessionProvider><ApiDataProvider><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} /></ApiDataProvider></SessionProvider>;
}
