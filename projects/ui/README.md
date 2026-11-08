# `@daghit/ui`

Reusable React Native UI for Daghit and other workspace apps.

- Import basic controls from `@daghit/ui`: `Button`, `TextField`, `Screen`, `Header`, and `Card`.
- Import the reusable map selection flow and lower-level map building blocks from `@daghit/ui/maps`: `MapExplorer`, `MapCanvas`, `MapPin`, `MapCallout`, and `MapOverlay`.
- Keep business rules and app-specific records out of this package. Compose reusable controls with app-specific data in a feature component.
- `MapExplorer` takes generic items with coordinates and labels, shows a preview when a pin is selected, and delegates the full-details action to `onOpenItem`.
- Keep this package platform-neutral where possible. React Native and `react-native-maps` are peer dependencies supplied by the consuming app.

See [`docs/REUSABLE_UI.md`](../../docs/REUSABLE_UI.md) for a map composition example and folder conventions.
