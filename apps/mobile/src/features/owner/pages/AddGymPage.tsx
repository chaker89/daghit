import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LatLng } from 'react-native-maps';
import { GymLocationPickerMap } from '@/features/owner/components/gym-location-picker/GymLocationPickerMap';
import { Button, Field, Header, Screen } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';
import { useApiData } from '@/data/api-data-context';

export default function AddGymScreen() {
  const { addOwnerGym } = useApiData();
  const [name, setName] = useState(''); const [type, setType] = useState('Gym'); const [description, setDescription] = useState(''); const [city, setCity] = useState('Beirut'); const [address, setAddress] = useState(''); const [location, setLocation] = useState<LatLng>({ latitude: 33.8938, longitude: 35.5018 });
  const [busy, setBusy] = useState(false);
  const submit = async () => { if (busy) return; if (!name.trim() || !city.trim() || !address.trim()) { Alert.alert('A couple of details are missing', 'Please add a gym name, city, and street address.'); return; } setBusy(true); try { await addOwnerGym({ name: name.trim(), type, description: description.trim(), city: city.trim(), address: address.trim(), latitude: location.latitude, longitude: location.longitude }); Alert.alert('Gym saved', `${name.trim()} has been saved.`, [{ text: 'Done', onPress: () => router.replace('/owner') }]); } catch (e) { Alert.alert('Unable to save gym', e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); } };
  return <Screen><Header title="Add a gym" onBack={() => router.back()} /><Field label="Gym name" placeholder="e.g. Beirut Fitness Club" value={name} onChangeText={setName} required /><Text style={styles.label}>Gym type *</Text><View style={styles.types}>{['Gym', 'Studio', 'Yoga'].map(x => <Pressable onPress={() => setType(x)} key={x} style={[styles.type, x === type && styles.typeActive]}><Text style={[styles.typeText, x === type && { color: 'white' }]}>{x}</Text></Pressable>)}</View>
    <Field label="Description" placeholder="Tell members about your gym..." value={description} onChangeText={setDescription} multiline /><Field label="City" placeholder="Beirut" value={city} onChangeText={setCity} required /><Field label="Address" placeholder="e.g. Hamra, Bliss Street" value={address} onChangeText={setAddress} required />
    <Text style={[styles.label, { marginBottom: 9 }]}>Location *</Text><Text style={styles.helper}>Tap the map or drag the pin to set your gym’s location.</Text><View style={styles.map}><GymLocationPickerMap coordinate={location} onCoordinateChange={setLocation} /></View><Text style={styles.coords}>Coordinates: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
    <View style={{ paddingTop: 18, paddingBottom: 8 }}><Button title={busy ? "Saving…" : "Add gym"} disabled={busy} onPress={() => { void submit(); }} /></View>
  </Screen>;
}
const styles = StyleSheet.create({ label: { color: brand.ink, fontSize: 14, fontWeight: '700', marginBottom: 8 }, types: { flexDirection: 'row', gap: 8, marginBottom: 17 }, type: { borderWidth: 1, borderColor: brand.line, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: 'white' }, typeActive: { backgroundColor: brand.teal, borderColor: brand.teal }, typeText: { color: brand.ink, fontWeight: '600' }, map: { height: 220, borderRadius: 18, overflow: 'hidden' }, helper: { color: brand.muted, fontSize: 12, marginBottom: 10 }, coords: { marginTop: 14, color: brand.muted, fontSize: 12 } });
