# Reusable UI and feature structure

## Reuse rule

Build UI as a shared component when it can work in another app without Daghit product rules. Place it in `projects/ui/`, and pass its content and actions as typed props. Keep Daghit-specific data mapping, branding, navigation, and business rules in `projects/mobile/src/features/`.

Organize every shared component in its own folder. Keep its TSX implementation, optional `*.styles.ts`, and `index.ts` export together. Use:

- `components/primitives/` for basic controls such as buttons and text fields.
- `components/composites/` for reusable combinations of controls.
- A named subpath such as `@daghit/ui/maps` for complex shared patterns.

Before adding a component, inspect the shared package for something that can be extended. Avoid copying a reusable component into a feature and avoid adding abstractions without a current use case.

## Map building blocks

`@daghit/ui/maps` provides both low-level map pieces and a reusable selection flow:

- `MapCanvas` hosts the map provider view.
- `MapPin` and `MapCallout` expose provider marker and callout behavior.
- `MapOverlay` places controls and panels over the map.
- `MapExplorer` accepts generic items with IDs, coordinates, titles, and optional subtitles and marker colors. Tapping a marker selects it and displays a small preview banner; tapping the banner calls the consumer's `onOpenItem` callback. The consuming app decides whether that opens a details route, sheet, or another view.

The map package owns no listing fixtures, app routes, brand tokens, authentication, location permission prompts, or business rules. A consumer can provide a different marker set and detail action without changing the shared component.

## Use the map in another project

Add `@daghit/ui` and its peer dependencies, including `react-native-maps`, to the consuming app. Give `MapExplorer` any item type that has the common map fields; keep the full domain object attached or look it up in the consumer's callback:

```tsx
import { MapExplorer } from '@daghit/ui/maps';
import type { Region } from 'react-native-maps';

type Place = {
  id: string;
  coordinate: { latitude: number; longitude: number };
  title: string;
  subtitle: string;
  markerColor?: string;
};

const places: Place[] = [
  {
    id: 'place-1',
    coordinate: { latitude: 33.8938, longitude: 35.5018 },
    title: 'Example place',
    subtitle: 'A short description',
    markerColor: '#087F78',
  },
];

const region: Region = {
  latitude: 33.8938,
  longitude: 35.5018,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

<MapExplorer
  items={places}
  mapProps={{ initialRegion: region, showsCompass: false }}
  detailsLabel="Open place"
  onOpenItem={place => openPlaceDetails(place.id)}
/>
```

The app supplies the region, items, styling overrides, overlays, and details action. In Daghit, the discovery feature adapts gym/class/trainer API records to this generic item shape, supplies the current map region and location controls, and routes the selected item to its own details page.

## Feature and route structure

- **Routes** live in `projects/mobile/src/app/` and stay as thin Expo Router entries.
- **Pages** live in `projects/mobile/src/features/<feature>/pages/`. They assemble shared UI and feature components and coordinate page-level state or navigation.
- **Feature components** live in `projects/mobile/src/features/<feature>/components/`. They are appropriate for UI whose content or behavior depends on Daghit domain concepts.
- **Data adapters** live outside UI components. Mobile endpoint functions and the Axios client live in `projects/mobile/src/api/`; domain view types/providers are in `projects/mobile/src/data/`. Read `BACKEND_INTEGRATION.md` for the current contract.

React Native styles use `StyleSheet` in TypeScript. Standalone CSS does not style native Android or iOS views; colocate native styles in `*.styles.ts` files.
