import { MapExplorer, MapOverlay } from '@daghit/ui/maps';
import type { LatLng, Region } from 'react-native-maps';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { brand } from '@/constants/brand';
import type { MapCategory, MapListing } from '@/data/models';
import { styles } from './DiscoveryMap.styles';

type DiscoveryMapProps = {
  category: MapCategory;
  items: MapListing[];
  region: Region;
  userLocation: LatLng | null;
  canShowNearbyListings: boolean;
  isLocating: boolean;
  onOpen: (listing: MapListing) => void;
  onRegionChange: (region: Region) => void;
  onLocate: () => void;
  onExploreBeirut: () => void;
  onManualPan: () => void;
};

export function DiscoveryMap({ category, items, region, userLocation, canShowNearbyListings, isLocating, onOpen, onRegionChange, onLocate, onExploreBeirut, onManualPan }: DiscoveryMapProps) {
  const markerColor = category === 'Gyms' ? brand.teal : category === 'Classes' ? '#5280C7' : '#E18A4B';
  const mapItems = items.map(listing => ({
    id: listing.id,
    coordinate: { latitude: listing.latitude, longitude: listing.longitude },
    title: listing.title,
    subtitle: `${listing.type} · ${listing.area}`,
    markerColor,
    listing,
  }));

  return (
    <MapExplorer
      items={mapItems}
      onOpenItem={item => onOpen(item.listing)}
      detailsLabel={category === 'Gyms' ? 'View gym' : 'View details'}
      mapProps={{
        style: styles.map,
        region,
        onRegionChangeComplete: onRegionChange,
        onPanDrag: onManualPan,
        mapType: 'standard',
        showsUserLocation: userLocation !== null,
        showsCompass: false,
        toolbarEnabled: false,
        loadingEnabled: true,
      }}
      overlays={(
        <MapOverlay>
          <Pressable accessibilityRole="button" accessibilityLabel="Center map on my current location" disabled={isLocating} onPress={onLocate} style={styles.locateButton}>
            {isLocating ? <ActivityIndicator color={brand.tealDark} /> : <Text style={styles.locateIcon}>⌖</Text>}
          </Pressable>
          {userLocation && !canShowNearbyListings && <View style={styles.emptyNearby}>
            <Text style={styles.emptyNearbyTitle}>No nearby listings found</Text>
            <Text style={styles.emptyNearbyBody}>Try browsing another area.</Text>
            <Pressable accessibilityRole="button" onPress={onExploreBeirut} style={styles.exploreButton}><Text style={styles.exploreButtonText}>Explore Beirut</Text></Pressable>
          </View>}
        </MapOverlay>
      )} />
  );
}
