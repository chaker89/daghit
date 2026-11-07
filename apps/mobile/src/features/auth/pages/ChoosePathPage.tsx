import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Header, Screen, Wordmark, ui } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';

export default function ChoosePathScreen() {
  const [path, setPath] = useState<'member' | 'owner'>('member');
  return <Screen><Header title="Choose your path" onBack={() => router.back()} /><View style={styles.brand}><Wordmark small /></View><Text style={ui.title}>How will you use Daghit?</Text><Text style={[ui.subtitle, { marginTop: 8, marginBottom: 22 }]}>You can always change or access both later.</Text>
    <Pressable onPress={() => setPath('member')} style={[styles.choice, path === 'member' && styles.choiceSelected]}><Text style={styles.icon}>♙</Text><View style={styles.copy}><Text style={styles.choiceTitle}>I’m a member</Text><Text style={styles.choiceBody}>Discover gyms, browse classes, and book with my subscription.</Text></View><Text style={styles.radio}>{path === 'member' ? '●' : '○'}</Text></Pressable>
    <Pressable onPress={() => setPath('owner')} style={[styles.choice, path === 'owner' && styles.choiceSelected]}><Text style={styles.icon}>▣</Text><View style={styles.copy}><Text style={styles.choiceTitle}>I’m a gym owner</Text><Text style={styles.choiceBody}>List and manage my gym(s), classes, and schedules.</Text></View><Text style={styles.radio}>{path === 'owner' ? '●' : '○'}</Text></Pressable>
    <View style={styles.bottom}><Button title="Continue" onPress={() => router.push({ pathname: '/signup', params: { role: path } })} /></View>
  </Screen>;
}
const styles = StyleSheet.create({ brand: { alignItems: 'center', marginBottom: 28, marginTop: 5 }, choice: { flexDirection: 'row', alignItems: 'center', borderColor: brand.line, borderWidth: 1.2, borderRadius: 20, padding: 17, gap: 14, marginBottom: 14, backgroundColor: brand.white }, choiceSelected: { borderColor: '#B8E0DC', backgroundColor: '#F3FBFA' }, icon: { fontSize: 29, color: brand.teal, width: 38, textAlign: 'center' }, copy: { flex: 1, gap: 5 }, choiceTitle: { color: brand.ink, fontSize: 16, fontWeight: '800' }, choiceBody: { color: brand.muted, fontSize: 13, lineHeight: 18 }, radio: { color: brand.teal, fontSize: 21 }, bottom: { flex: 1, justifyContent: 'flex-end', paddingTop: 22 } });
