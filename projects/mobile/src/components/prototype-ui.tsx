import { StyleSheet, Text, View } from 'react-native';
import { TextField } from '@daghit/ui';
import { brand } from '@/constants/brand';

export { Button, Header, Screen } from '@daghit/ui';
export const Field = TextField;

export function Wordmark({ small = false }: { small?: boolean }) {
  return <View style={styles.wordmark}><Text style={styles.logoMark}>➤</Text><Text style={[styles.logoText, small && styles.logoSmall]}>Daghit</Text></View>;
}

export const ui = StyleSheet.create({
  title: { color: brand.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: brand.muted, fontSize: 15, lineHeight: 23 },
  card: { backgroundColor: brand.white, borderRadius: 22, borderWidth: 1, borderColor: brand.line, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
});

const styles = StyleSheet.create({
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoMark: { color: brand.teal, fontSize: 28, fontWeight: '900', transform: [{ rotate: '-18deg' }] },
  logoText: { color: brand.tealDark, fontSize: 27, fontWeight: '800', letterSpacing: -1.2 },
  logoSmall: { fontSize: 20 },
});
