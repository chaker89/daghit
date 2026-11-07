import { useLocalSearchParams } from 'expo-router';
import GymDetailsPage from '@/features/gyms/pages/GymDetailsPage';

export default function GymDetailsRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <GymDetailsPage id={id} />;
}
