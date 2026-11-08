import { AccountGate } from '@/auth/SessionProvider';
import Page from '@/features/member/pages/FavoritesPage';
export default function Route() { return <AccountGate><Page /></AccountGate>; }
