import { DataStatus } from '@/components/DataStatus';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Header, Screen, ui } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';
import { useApiData } from '@/data/api-data-context';

export default function OwnerDashboard() {
  const { ownerGyms } = useApiData();
  return <Screen><Header title="Owner dashboard" onBack={() => router.back()} /><View style={{ paddingTop: 8 }}><DataStatus /><Text style={ui.title}>Your gyms</Text><Text style={[ui.subtitle, { marginTop: 8, marginBottom: 24 }]}>Manage your locations and keep your listing up to date.</Text>
    {ownerGyms.length === 0 ? <View style={styles.empty}><Text style={styles.emptyIcon}>⌂</Text><Text style={styles.emptyTitle}>Add your first gym</Text><Text style={styles.emptyBody}>Add a gym to start your owner dashboard.</Text></View> : <View style={styles.list}>{ownerGyms.map(gym => <View key={gym.id} style={styles.gym}><View style={styles.gymIcon}><Text style={{ color: brand.teal, fontSize: 22 }}>⌂</Text></View><View style={{ flex: 1 }}><Text style={styles.gymName}>{gym.name}</Text><Text style={styles.gymMeta}>{gym.type} · {gym.address}, {gym.city}</Text><Text style={styles.draft}>Gym record</Text></View></View>)}</View>}
    <Button title="＋  Add a gym" onPress={() => router.push('/owner/add-gym')} />
    <View style={{ marginTop: 10 }}><Button title="Explore as a member" secondary onPress={() => router.push('/member/discover')} /></View>
    <View style={[ui.card, { marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 12 }]}><Text style={{ color: brand.teal, fontSize: 24 }}>◉</Text><View style={{ flex: 1 }}><Text style={{ color: brand.ink, fontWeight: '700' }}>Your owner profile</Text><Text style={{ color: brand.muted, fontSize: 12, marginTop: 3 }}>{ownerGyms.length} {ownerGyms.length === 1 ? 'gym' : 'gyms'} saved</Text></View><Text style={{ color: brand.muted, fontSize: 22 }}>›</Text></View>
  </View></Screen>;
}
const styles = StyleSheet.create({ empty: { borderRadius: 22, backgroundColor: '#EAF6F5', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 35, marginBottom: 18 }, emptyIcon: { fontSize: 38, color: brand.teal }, emptyTitle: { color: brand.ink, fontSize: 18, fontWeight: '800', marginTop: 10 }, emptyBody: { color: brand.muted, textAlign: 'center', fontSize: 13, lineHeight: 19, marginTop: 6 }, list: { gap: 11, marginBottom: 18 }, gym: { borderRadius: 18, borderWidth: 1, borderColor: brand.line, backgroundColor: 'white', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, gymIcon: { height: 50, width: 50, borderRadius: 14, backgroundColor: brand.tealPale, alignItems: 'center', justifyContent: 'center' }, gymName: { color: brand.ink, fontSize: 15, fontWeight: '800' }, gymMeta: { color: brand.muted, fontSize: 12, marginTop: 3 }, draft: { color: brand.tealDark, fontSize: 11, fontWeight: '700', marginTop: 5 } });
