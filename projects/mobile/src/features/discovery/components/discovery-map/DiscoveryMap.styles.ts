import { StyleSheet } from 'react-native';
import { brand } from '@/constants/brand';

export const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 180, borderRadius: 22, overflow: 'hidden' },
  locateButton: { position: 'absolute', top: 14, right: 14, width: 46, height: 46, borderRadius: 23, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#143A3C', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  locateIcon: { color: brand.tealDark, fontSize: 25, fontWeight: '800' },
  emptyNearby: { position: 'absolute', left: 12, right: 12, bottom: 14, padding: 16, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', elevation: 4 },
  emptyNearbyTitle: { color: brand.ink, fontSize: 14, fontWeight: '800' },
  emptyNearbyBody: { color: brand.muted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  exploreButton: { marginTop: 12, paddingHorizontal: 17, paddingVertical: 10, borderRadius: 18, backgroundColor: brand.teal },
  exploreButtonText: { color: 'white', fontSize: 12, fontWeight: '800' },
});
