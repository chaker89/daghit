import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, Wordmark, Button } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';
import { WelcomeCarousel } from '@/features/auth/components/WelcomeCarousel';

export default function WelcomeScreen() {
  return <Screen>
    <View style={styles.top}><Wordmark /><Text style={styles.skip} onPress={() => router.push('/member/discover')}>Explore as guest</Text></View>
    <WelcomeCarousel />
    <View style={styles.actions}><Button title="Create an account" onPress={() => router.push('/choose-path')} /><Button title="Log in" secondary onPress={() => router.push('/login')} /></View>
    <Text style={styles.footnote}>Your next favorite workout is closer than you think.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  skip: { color: brand.teal, fontWeight: '700', fontSize: 13 },
  actions: { gap: 10, paddingTop: 18 },
  footnote: { textAlign: 'center', color: brand.muted, fontSize: 12, paddingVertical: 14 },
});
