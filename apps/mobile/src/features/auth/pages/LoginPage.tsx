import { request, endpoints } from '@/api/client';
import { signInToken } from '@/auth/session';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button, Field, Header, Screen, ui } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';

export default function LoginScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const login = async () => {
    if (busy) return;
    if (!email.trim() || !password.trim()) {
      Alert.alert('Complete your details', 'Enter your email and password to continue.');
      return;
    }
    setBusy(true);
    try {
      const result = await request<{ accessToken: string }>(endpoints.login, { method: 'POST', body: { email: email.trim(), password } });
      const session = await signInToken(result.accessToken);
      router.replace(session.types.includes('owner') && !session.types.includes('member') ? '/owner' : '/member/discover');
    } catch (e) { Alert.alert('Unable to log in', e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  };
  return <Screen><Header title="Log in" onBack={() => router.back()} /><View style={{ gap: 20, paddingTop: 12 }}><Text style={ui.title}>Welcome back</Text><Text style={ui.subtitle}>Log in to pick up where you left off.</Text><View style={{ marginTop: 12 }}><Field label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} required /><Field label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} required /></View><Button title={busy ? "Logging in…" : "Log in"} disabled={busy} onPress={() => { void login(); }} /><Text style={[ui.subtitle, { textAlign: 'center' }]}>New to Daghit? <Text onPress={() => router.push('/choose-path')} style={{ color: brand.teal, fontWeight: '700' }}>Create an account</Text></Text></View></Screen>;
}
