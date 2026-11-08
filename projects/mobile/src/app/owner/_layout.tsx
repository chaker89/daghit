import { Stack } from 'expo-router';
import { AccountGate } from '@/auth/SessionProvider';
export default function OwnerLayout() { return <AccountGate type="owner"><Stack screenOptions={{ headerShown: false }} /></AccountGate>; }
