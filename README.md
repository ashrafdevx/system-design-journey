# BookMyShow API starter

A small Fastify + TypeScript API starter for the initial BookMyShow domains. The current endpoints use in-memory sample data; persistence and booking flows are intentionally out of scope.

## Structure

```text
src/
  app.ts
  server.ts
  modules/
    cities/
      routes.ts
      service.ts
      types.ts
    cinemas/
      routes.ts
      service.ts
      types.ts
    shows/
      routes.ts
      service.ts
      types.ts
```

Each domain owns its route registration, service functions, and data types.

## Endpoints

- `GET /health`
- `GET /api/v1/cities`
- `GET /api/v1/cities/:cityId`
- `GET /api/v1/cinemas?cityId=city-mumbai`
- `GET /api/v1/cinemas/:cinemaId`
- `GET /api/v1/shows?cityId=city-mumbai&cinemaId=cinema-mumbai-central`
- `GET /api/v1/shows/:showId`

List responses use `{ "data": [...] }`; item responses use `{ "data": {...} }`. Unknown item IDs return `404`.

## Run locally

Requires Node.js 22 or later.

```bash
pnpm install
pnpm dev
```

Useful commands: `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm start`.
