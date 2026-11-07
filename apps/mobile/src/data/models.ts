export type MapCategory = 'Gyms' | 'Classes' | 'Personal training';
export type MapListing = { id: string; title: string; type: string; area: string; latitude: number; longitude: number; gymId?: string; serviceMode?: 'studio' | 'home'; description?: string; rating?: string; reviews?: number };
export type Gym = { id: string; name: string; type: string; area: string; latitude: number; longitude: number; description: string; rating: string; reviews: number };
export type OwnerGym = { id: string; name: string; type: string; description: string; city: string; address: string; latitude: number; longitude: number };
export type BookingStatus = 'upcoming' | 'previous' | 'canceled';
export type Booking = { id: string; title: string; provider: string; location: string; date: string; time: string; kind: 'Class' | 'Personal training' };
export type Catalog = { gyms: Gym[]; listings: Record<MapCategory, MapListing[]> };
export type Profile = { id: string; name: string; email: string; phone: string; plan: { name: string; startingCredits: number; remainingCredits: number; renewalLabel: string } | null };
