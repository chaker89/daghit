import { Redirect } from 'expo-router';
import WelcomePage from '@/features/auth/pages/WelcomePage';
import { useSession } from '@/auth/SessionProvider';
export default function LandingRoute() {
  const session = useSession();
  if (session) return <Redirect href={session.types.includes('owner') && !session.types.includes('member') ? '/owner' : '/member/discover'} />;
  return <WelcomePage />;
}
