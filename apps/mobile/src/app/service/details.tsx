import { useLocalSearchParams } from 'expo-router';
import ServiceDetailsPage from '@/features/services/pages/ServiceDetailsPage';

export default function ServiceDetailsRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ServiceDetailsPage id={id} />;
}
