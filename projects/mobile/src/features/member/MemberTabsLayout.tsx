import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '@/constants/brand';

const icons: Record<string, string> = { discover: '⌖', bookings: '▣', favorites: '♡', profile: '♙' };
const labels: Record<string, string> = { discover: 'Discover', bookings: 'Bookings', favorites: 'Favorites', profile: 'Profile' };

export default function MemberTabsLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    animation: 'none',
    animationEnabled: false,
    detachInactiveScreens: false,
    freezeOnBlur: false,
    tabBarActiveTintColor: brand.teal,
    tabBarInactiveTintColor: brand.muted,
    tabBarLabel: labels[route.name],
    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 21 }}>{icons[route.name]}</Text>,
    tabBarHideOnKeyboard: false,
    tabBarStyle: { backgroundColor: brand.white, borderTopColor: brand.line, height: 62 + insets.bottom, paddingTop: 5, paddingBottom: insets.bottom },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    sceneStyle: { backgroundColor: brand.canvas },
  })}>
    <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
    <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
    <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>;
}
