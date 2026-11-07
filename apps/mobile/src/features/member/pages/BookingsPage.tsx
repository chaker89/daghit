import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen, Wordmark, ui } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';
import { useApiData } from '@/data/api-data-context';
import type { BookingStatus, Booking } from '@/data/models';
import { DataStatus } from '@/components/DataStatus';

const bookingTabs: { id: BookingStatus; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'previous', label: 'Previously booked' },
  { id: 'canceled', label: 'Canceled' },
];

function BookingCard({ booking, status }: { booking: Booking; status: BookingStatus }) {
  const statusLabel = status === 'upcoming' ? 'UPCOMING' : status === 'previous' ? 'COMPLETED' : 'CANCELED';
  return <View style={styles.card}>
    <View style={styles.cardTop}><View style={styles.kindBadge}><Text style={styles.kindText}>{booking.kind}</Text></View><Text style={[styles.status, status === 'canceled' && styles.canceledStatus]}>{statusLabel}</Text></View>
    <Text style={styles.bookingTitle}>{booking.title}</Text>
    <Text style={styles.provider}>{booking.provider}</Text>
    <View style={styles.cardDivider} />
    <View style={styles.detailsRow}><View><Text style={styles.detailLabel}>DATE</Text><Text style={styles.detailValue}>{booking.date}</Text></View><View><Text style={styles.detailLabel}>TIME</Text><Text style={styles.detailValue}>{booking.time}</Text></View><Text style={styles.location} numberOfLines={2}>⌖ {booking.location}</Text></View>
    
  </View>;
}

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming');
  const { bookings: records } = useApiData();
  const bookings = records[activeTab];
  return <Screen bottomInset={false}>
    <View style={styles.content}><DataStatus />
      <Wordmark small />
      <Text style={[ui.title, { marginTop: 22 }]}>Bookings</Text>
      <Text style={[ui.subtitle, { marginTop: 5 }]}>Your fitness sessions in one place</Text>
      <View style={styles.tabs}>
        {bookingTabs.map(tab => <Pressable key={tab.id} accessibilityRole="tab" accessibilityState={{ selected: activeTab === tab.id }} onPress={() => setActiveTab(tab.id)} style={[styles.tab, activeTab === tab.id && styles.activeTab]}><Text numberOfLines={1} style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text></Pressable>)}
      </View>
      {bookings.length ? <View style={styles.list}>{bookings.map(booking => <BookingCard key={booking.id} booking={booking} status={activeTab} />)}</View> : <View style={styles.empty}><Text style={styles.emptyIcon}>▣</Text><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.emptyBody}>This section will show your {activeTab === 'upcoming' ? 'upcoming sessions' : activeTab === 'previous' ? 'past sessions' : 'canceled sessions'}.</Text></View>}
      <View style={styles.footer}><Button title="Explore services" onPress={() => router.navigate('/member/discover')} /></View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: 14, paddingBottom: 20 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 16, backgroundColor: '#EAF2F1', marginTop: 21, gap: 3 },
  tab: { flex: 1, minHeight: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  activeTab: { backgroundColor: brand.white, elevation: 1 },
  tabText: { color: brand.muted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  activeTabText: { color: brand.tealDark },
  list: { gap: 12, marginTop: 16 },
  card: { backgroundColor: brand.white, borderRadius: 19, borderWidth: 1, borderColor: brand.line, padding: 15 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kindBadge: { backgroundColor: brand.tealPale, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  kindText: { color: brand.tealDark, fontSize: 10, fontWeight: '700' },
  status: { color: brand.teal, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  canceledStatus: { color: '#B85A61' },
  bookingTitle: { color: brand.ink, fontSize: 16, fontWeight: '800', marginTop: 12 },
  provider: { color: brand.muted, fontSize: 12, marginTop: 4 },
  cardDivider: { height: 1, backgroundColor: brand.line, marginVertical: 12 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailLabel: { color: brand.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  detailValue: { color: brand.ink, fontSize: 11, fontWeight: '700', marginTop: 4 },
  location: { flex: 1, color: brand.muted, textAlign: 'right', fontSize: 10, lineHeight: 15 },
  sampleLabel: { color: '#8A9499', fontSize: 9, marginTop: 11 },
  empty: { flex: 1, minHeight: 170, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25 },
  emptyIcon: { color: brand.teal, fontSize: 38 }, emptyTitle: { color: brand.ink, fontSize: 17, fontWeight: '800', marginTop: 10 }, emptyBody: { color: brand.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 5 },
  footer: { gap: 10, marginTop: 'auto', paddingTop: 18 },
  disclaimer: { color: brand.muted, textAlign: 'center', fontSize: 10 },
});
