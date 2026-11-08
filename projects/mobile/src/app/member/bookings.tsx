import { AccountGate } from '@/auth/SessionProvider';
import Page from '@/features/member/pages/BookingsPage';
export default function Route() { return <AccountGate><Page /></AccountGate>; }
