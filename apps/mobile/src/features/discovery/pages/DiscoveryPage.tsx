import { DataStatus } from '@/components/DataStatus';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Region } from 'react-native-maps';
import { DiscoveryMap } from '@/features/discovery/components/discovery-map/DiscoveryMap';
import { createDiscoveryViewport, BEIRUT_REGION } from '@/features/discovery/location/geo';
import { useDeviceLocation } from '@/features/discovery/hooks/useDeviceLocation';
import { Screen, Wordmark } from '@/components/prototype-ui';
import { brand } from '@/constants/brand';
import { useApiData } from '@/data/api-data-context';
import type { MapCategory, MapListing } from '@/data/models';

type ViewMode = 'map' | 'list';
type ViewportMode = 'nearby' | 'beirut' | 'no-results' | 'manual';

function getCategoryItems(discoveryMapData: Record<MapCategory, MapListing[]>, category: MapCategory, trainerPlace: 'All' | 'Gym / studio' | 'At home') {
  const items = discoveryMapData[category];
  if (category !== 'Personal training' || trainerPlace === 'All') return items;
  return items.filter(item => trainerPlace === 'At home' ? item.serviceMode === 'home' : item.serviceMode === 'studio');
}

function openListing(listing: MapListing, category: MapCategory) {
  if (category !== 'Gyms') {
    router.push({ pathname: '/service/details', params: { id: listing.id } });
  } else if (listing.gymId) {
    router.push({ pathname: '/gym/details', params: { id: listing.gymId } });
  }
}

export default function DiscoveryPage() {
  const { catalog } = useApiData();
  const discoveryMapData = catalog.listings;
  const [category, setCategory] = useState<MapCategory>('Gyms');
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [manualRegion, setManualRegion] = useState<Region | null>(null);
  const [trainerPlace, setTrainerPlace] = useState<'All' | 'Gym / studio' | 'At home'>('All');
  const { location, status: locationStatus, isLocating, locate } = useDeviceLocation();
  const mapItems = useMemo(() => getCategoryItems(discoveryMapData, category, trainerPlace), [discoveryMapData, category, trainerPlace]);
  const shouldUseBeirut = locationStatus === 'permission-denied' || locationStatus === 'unavailable';
  const autoViewport = location || shouldUseBeirut ? createDiscoveryViewport(location, mapItems) : null;
  const mapRegion = manualRegion ?? autoViewport?.region ?? BEIRUT_REGION;
  const viewportMode: ViewportMode = manualRegion
    ? 'manual'
    : location && autoViewport
      ? autoViewport.canShowNearbyListings ? 'nearby' : 'no-results'
      : 'beirut';
  const canShowNearbyListings = manualRegion ? true : autoViewport?.canShowNearbyListings ?? true;

  const moveToCurrentLocation = async () => {
    setManualRegion(null);
    await locate();
  };

  const exploreBeirut = () => {
    setManualRegion(createDiscoveryViewport(null, mapItems).region);
  };
  const chooseCategory = (nextCategory: MapCategory) => {
    setCategory(nextCategory);
    setManualRegion(null);
  };

  const resultLabel = viewMode === 'list'
    ? `${mapItems.length} ${category === 'Gyms' ? 'gyms' : category === 'Classes' ? 'classes' : 'sessions'}`
    : locationStatus === 'loading' && !location
            ? 'Finding your location…'
      : viewportMode === 'no-results'
        ? 'No listings near you'
        : viewportMode === 'nearby'
          ? `${mapItems.length} listings near you`
          : viewportMode === 'manual'
            ? `${mapItems.length} listings · map area`
            : `${mapItems.length} listings`;

  return <Screen scroll={false} bottomInset={false}><DataStatus />
    <View style={styles.top}><Wordmark small /><Pressable style={styles.bell} accessibilityLabel="Notifications" onPress={() => {}}><Text style={{ color: brand.ink, fontSize: 20 }}>♧</Text></Pressable></View>
    <View style={styles.categories}>{(['Gyms', 'Classes', 'Personal training'] as const).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: category === item }} onPress={() => chooseCategory(item)} style={[styles.pill, category === item && styles.pillActive]}><Text numberOfLines={1} style={[styles.pillText, category === item && styles.pillTextActive]}>{item}</Text></Pressable>)}</View>
    {category === 'Personal training' && <View style={styles.subcategories}>{(['All', 'Gym / studio', 'At home'] as const).map(place => <Pressable key={place} onPress={() => { setTrainerPlace(place); setManualRegion(null); }} style={[styles.subPill, trainerPlace === place && styles.subPillActive]}><Text style={[styles.subPillText, trainerPlace === place && styles.subPillTextActive]}>{place}</Text></Pressable>)}</View>}
    <View style={styles.modeRow}><Text style={styles.resultCount}>{resultLabel}</Text><View style={styles.switcher}>{(['map', 'list'] as const).map(mode => <Pressable key={mode} accessibilityRole="tab" accessibilityState={{ selected: viewMode === mode }} onPress={() => setViewMode(mode)} style={[styles.switchButton, viewMode === mode && styles.switchButtonActive]}><Text style={[styles.switchText, viewMode === mode && styles.switchTextActive]}>{mode === 'map' ? '⌖ Map' : '☷ List'}</Text></Pressable>)}</View></View>
    <View style={styles.results}>
      <View pointerEvents={viewMode === 'map' ? 'auto' : 'none'} style={[styles.mapLayer, viewMode !== 'map' && styles.hiddenLayer]}>
        <DiscoveryMap
          category={category}
          items={mapItems}
          region={mapRegion}
          userLocation={location}
          canShowNearbyListings={canShowNearbyListings}
          isLocating={isLocating}
          onOpen={listing => openListing(listing, category)}
          onRegionChange={region => setManualRegion(current => current ? region : null)}
          onLocate={() => { void moveToCurrentLocation(); }}
          onExploreBeirut={exploreBeirut}
          onManualPan={() => setManualRegion(current => current ?? mapRegion)}
        />
      </View>
      {viewMode === 'list' && <ScrollView style={styles.listLayer} contentContainerStyle={styles.listContent}>
        {mapItems.map(item => <Pressable key={item.id} onPress={() => openListing(item, category)} style={styles.listCard}>
          <View style={styles.listIcon}><Text style={styles.listEmoji}>{category === 'Gyms' ? '⌂' : category === 'Classes' ? '▣' : item.serviceMode === 'home' ? '⌂' : '✦'}</Text></View>
          <View style={styles.listCopy}><Text style={styles.listTitle}>{item.title}</Text><Text style={styles.listMeta}>{item.type} · {item.area}</Text>{category === 'Gyms' ? <Text style={styles.listExtra}>★ {item.rating} · Listing</Text> : <Text style={styles.listExtra}>{item.gymId ? `At ${discoveryMapData.Gyms.find(gym => gym.id === item.gymId)?.title ?? 'studio'}` : 'Home visit'}</Text>}</View><Text style={styles.chevron}>›</Text>
        </Pressable>)}
      </ScrollView>}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  top: { height: 52, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bell: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  categories: { height: 54, flexDirection: 'row', paddingHorizontal: 14, gap: 7, alignItems: 'center', backgroundColor: 'white', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  pill: { flex: 1, height: 36, borderRadius: 20, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF7F7' },
  pillActive: { backgroundColor: brand.teal }, pillText: { fontSize: 12, color: brand.ink, fontWeight: '600' }, pillTextActive: { color: 'white' },
  subcategories: { height: 42, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  subPill: { borderRadius: 16, borderWidth: 1, borderColor: brand.line, paddingHorizontal: 11, paddingVertical: 6, backgroundColor: 'white' }, subPillActive: { borderColor: brand.teal, backgroundColor: brand.tealPale }, subPillText: { fontSize: 11, color: brand.muted, fontWeight: '600' }, subPillTextActive: { color: brand.tealDark },
  modeRow: { height: 52, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, resultCount: { flex: 1, color: brand.muted, fontSize: 11, fontWeight: '600', marginRight: 8 },
  switcher: { flexDirection: 'row', padding: 3, borderRadius: 18, backgroundColor: '#EAF2F1' }, switchButton: { borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6 }, switchButtonActive: { backgroundColor: 'white', elevation: 1 }, switchText: { color: brand.muted, fontSize: 12, fontWeight: '700' }, switchTextActive: { color: brand.tealDark },
  results: { flex: 1, margin: 12, marginTop: 0, position: 'relative' }, mapLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 22, overflow: 'hidden' }, hiddenLayer: { opacity: 0 }, listLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 22, backgroundColor: brand.canvas }, listContent: { paddingBottom: 15, gap: 10 },
  listCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 18, borderWidth: 1, borderColor: brand.line, padding: 12, gap: 11 }, listIcon: { width: 54, height: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.tealPale }, listEmoji: { color: brand.teal, fontSize: 25 }, listCopy: { flex: 1 }, listTitle: { color: brand.ink, fontSize: 13, fontWeight: '800' }, listMeta: { color: brand.muted, fontSize: 11, marginTop: 3 }, listExtra: { color: brand.tealDark, fontSize: 11, marginTop: 5, fontWeight: '600' }, chevron: { color: brand.tealDark, fontSize: 28, paddingRight: 4 },
});
