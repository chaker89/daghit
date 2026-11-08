import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Button, Screen, Wordmark, ui } from '@/components/prototype-ui';
import { getMyProfile } from '@/api/endpoints';
import { useSession } from '@/auth/SessionProvider';
import { signOut } from '@/auth/session';
export default function ProfilePage() {
  const session = useSession();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getMyProfile>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void getMyProfile().then(data => { if (active) { setProfile(data); setError(null); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [session, attempt]);
  return <Screen><Wordmark small /><Text style={ui.title}>My account</Text>
    {error ? <View><Text accessibilityRole="alert">{error}</Text><Button title="Try again" onPress={() => setAttempt(x => x + 1)} /></View> : !profile ? <ActivityIndicator /> : <View style={{ gap: 14, paddingVertical: 20 }}>
      <Text>{profile.name}</Text><Text>{profile.email}</Text><Text>{profile.phone}</Text>
      <Text>{profile.plan ? `${profile.plan.name}: ${profile.plan.remainingCredits} credits remaining` : 'No active plan'}</Text>
    </View>}
    {session?.types.includes('owner') && <Button title="Gym owner dashboard" onPress={() => router.push('/owner')} />}
    <Button title="Log out" secondary onPress={() => { void signOut().catch(() => Alert.alert('Unable to clear saved session', 'Please try logging out again before closing the app.')); }} />
  </Screen>;
}
