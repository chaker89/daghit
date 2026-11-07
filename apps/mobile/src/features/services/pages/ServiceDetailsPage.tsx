import { DataStatus } from '@/components/DataStatus';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Header, Screen } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';
import { useApiData } from '@/data/api-data-context';

export default function ServiceDetailsPage({ id }: { id?: string }) {
  const { catalog: { listings: discoveryMapData } } = useApiData();
  const listing = [...discoveryMapData.Classes, ...discoveryMapData['Personal training']].find(item => item.id === id);
  const gym = listing?.gymId ? discoveryMapData.Gyms.find(item => item.id === listing.gymId) : undefined;
  const isHomeVisit = listing?.serviceMode === 'home';
  const kind = listing?.type === 'Class' ? 'Fitness class' : isHomeVisit ? 'At-home personal training' : 'Personal training at a gym / studio';
  const backToMap = () => router.replace('/member/discover');
  if (!listing) return <Screen><Header title="Session details" onBack={() => router.back()} /><DataStatus /><Text>Session unavailable.</Text></Screen>;
  return <Screen>
    <Header title="Session details" onBack={() => router.back()} right={<Text onPress={backToMap} style={styles.mapLink}>Map</Text>} />
    <View style={styles.hero}><Text style={styles.heroIcon}>{listing?.type === 'Class' ? '▣' : isHomeVisit ? '⌂' : '✦'}</Text><Text style={styles.heroType}>{kind}</Text></View>
    <Text style={styles.title}>{listing?.title ?? 'Fitness session'}</Text>
    <Text style={styles.meta}>{gym ? `${gym.title} · ${listing?.area}` : listing?.area ?? 'Beirut, Lebanon'}</Text>
    <View style={styles.section}><Text style={styles.sectionTitle}>About this session</Text><Text style={styles.body}>{listing.description ?? 'No description available.'}</Text></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>Ways to book</Text><Text style={styles.body}>Daghit supports subscription-based credits and a one-off booking option.</Text><Text style={styles.note}>The service does not yet define whether one-off means purchasing credits or paying directly for a session. Subscription plans, credit amounts, session costs, and booking rules are not configured.</Text></View>
    <View style={styles.actions}><Button title="Continue to booking" onPress={() => Alert.alert('Booking unavailable', 'Booking and payment are not connected yet.')} /><Button title="Back to map" secondary onPress={backToMap} /></View>
  </Screen>;
}

const styles = StyleSheet.create({
  mapLink: { color: brand.teal, fontSize: 13, fontWeight: '800' },
  hero: { height: 180, borderRadius: 23, backgroundColor: brand.tealPale, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroIcon: { color: brand.teal, fontSize: 52 }, heroType: { color: brand.tealDark, fontWeight: '700', marginTop: 8 },
  title: { color: brand.ink, fontSize: 25, fontWeight: '800' }, meta: { color: brand.muted, marginTop: 6 },
  section: { marginTop: 24 }, sectionTitle: { color: brand.ink, fontSize: 16, fontWeight: '800', marginBottom: 7 }, body: { color: brand.ink, fontSize: 14, lineHeight: 22 }, note: { color: brand.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  actions: { gap: 10, marginTop: 26, paddingBottom: 10 },
});
