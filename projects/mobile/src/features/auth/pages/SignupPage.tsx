import { signUp } from '@/api/endpoints';
import { signInToken } from '@/auth/session';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button, Field, Header, Screen, ui } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';

export default function SignupScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const createAccount = async () => {
    if (busy)
    {
      return;
    }
    const missingCredentials = !name.trim() || !email.trim() || !password.trim();
    if (missingCredentials)
    {
      Alert.alert('Complete your details', 'Enter your name, email, and password to continue.');
      return;
    }
    setBusy(true);
    try {
      const result = await signUp({ name: name.trim(), email: email.trim(), password, onboardingPreference: role === 'owner' ? 'owner' : 'member' });
      const session = await signInToken(result.accessToken);
      router.replace(session.types.includes('owner') && !session.types.includes('member') ? '/owner' : '/member/discover');
    } catch (e) { Alert.alert('Unable to create account', e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  };

  return <Screen>
    <Header title="Create an account" onBack={() => router.back()} />
    <View style={{ gap: 16, paddingTop: 12 }}>
      <Text style={ui.title}>Join Daghit</Text>
      <Text style={ui.subtitle}>Create your {role === 'owner' ? 'gym owner' : 'member'} profile. You can access both experiences later.</Text>
      <View style={{ marginTop: 10 }}>
        <Field label="Full name" placeholder="Your name" value={name} onChangeText={setName} required />
        <Field label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} required />
        <Field label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} required />
      </View>
      <Button title={busy ? "Creating account…" : "Create account"} disabled={busy} onPress={() => { void createAccount(); }} />
      <Text style={[ui.subtitle, { textAlign: 'center' }]}>Already have an account? <Text onPress={() => router.push('/login')} style={{ color: brand.teal, fontWeight: '700' }}>Log in</Text></Text>
    </View>
  </Screen>;
}
