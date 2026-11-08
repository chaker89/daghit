# @daghit/typings

API-facing TypeScript contracts shared by mobile and Koa. Import them using `import type` so they add no runtime code. Do not import Expo, Koa, database implementation types, or application UI here. This package describes HTTP data; it is not a database schema or runtime validator.

Mobile and server declare explicit workspace dependencies so Lerna includes both consumers when contracts change. Build emits declarations to `dist`; workspace type checking resolves the source declarations.
