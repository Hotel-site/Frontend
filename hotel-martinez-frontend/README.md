# Hotel Martinez Frontend

React + TypeScript + Vite SPA with a new Local Entertainment and City Guide page at route /local.

## Install

```bash
npm install
```

If you need to install required packages manually:

```bash
npm install @react-google-maps/api date-fns clsx react-router-dom
npm install -D jest @types/jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Google Maps Setup

Create .env file in the project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Map is code-split and lazy loaded in LocalPage.

## Routing

The /local route is mounted in src/App.tsx.

A standalone routing example is also provided in src/routes.tsx.

## Test Example

Sample test file:

- tests/AttractionCard.test.tsx

Run example test:

```bash
npx jest tests/AttractionCard.test.tsx
```

## Replace Mock API With Real Backend

Current mock service: src/services/localApi.ts

Available functions:

- fetchAttractions(params)
- fetchAttractionById(id)

Migration steps:

1. Replace in-memory attractions with HTTP requests (for example via axios).
2. Keep function signatures unchanged so UI components do not need refactoring.
3. Return the same paginated shape used by the hook.
4. Replace submitBookingRequest with your real booking endpoint call.
