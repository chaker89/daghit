import { DataStatus } from '@/components/DataStatus';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen, Wordmark, ui } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';
import { useApiData } from '@/data/api-data-context';


export default function FavoritesScreen() {
  const { favoriteGymIds, catalog: { gyms } } = useApiData();
  const favorites = gyms.filter(gym => favoriteGymIds.includes(gym.id));
  return <Screen scroll={false} bottomInset={false}><View style={styles.header}><Wordmark small /><Text style={[ui.title, { marginTop: 22 }]}>Favorites</Text></View>
    <ScrollView contentContainerStyle={styles.list}><DataStatus />
      {favorites.length ? favorites.map(gym => <Pressable key={gym.id} onPress={() => router.push({ pathname: '/gym/details', params: { id: gym.id } })} style={styles.card}><View style={styles.thumb}><Text style={styles.thumbIcon}>⌂</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{gym.name}</Text><Text style={styles.meta}>{gym.type} · {gym.area}</Text><Text style={styles.rating}>★ {gym.rating} <Text style={styles.meta}>({gym.reviews})</Text></Text></View><Text style={styles.chevron}>›</Text></Pressable>) : <View style={styles.empty}><Text style={styles.heart}>♡</Text><Text style={styles.emptyTitle}>Your saved studios show up here</Text><Text style={styles.emptyBody}>Tap the heart on a gym’s details to save it.</Text></View>}
    </ScrollView></Screen>;
}

const styles = StyleSheet.create({ header: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 16 }, list: { flexGrow: 1, paddingHorizontal: 18, paddingBottom: 18, gap: 12 }, card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: brand.line, backgroundColor: 'white' }, thumb: { height: 58, width: 58, borderRadius: 15, backgroundColor: brand.tealPale, alignItems: 'center', justifyContent: 'center' }, thumbIcon: { color: brand.teal, fontSize: 26 }, name: { color: brand.ink, fontSize: 14, fontWeight: '800' }, meta: { color: brand.muted, fontSize: 11, marginTop: 3 }, rating: { color: '#E5A000', fontWeight: '800', fontSize: 12, marginTop: 4 }, chevron: { color: brand.tealDark, fontSize: 28 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }, heart: { color: brand.teal, fontSize: 50 }, emptyTitle: { color: brand.ink, fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 12 }, emptyBody: { color: brand.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 5 } });
