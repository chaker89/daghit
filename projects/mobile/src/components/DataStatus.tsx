import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@daghit/ui';
import { useApiData } from '@/data/api-data-context';
export function DataStatus() {
  const { error, loading, refresh } = useApiData();
  return <View style={{ padding: 12 }}>{loading ? <ActivityIndicator /> : error ? <><Text accessibilityRole="alert">{error}</Text><Button title="Try again" onPress={refresh} /></> : null}</View>;
}
