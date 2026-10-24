# BookMyShow API starter

A small Fastify + TypeScript API starter for the initial BookMyShow domains. The HTTP APIs currently use in-memory sample data; MongoDB is connected for infrastructure setup and health checks. Persistence and booking flows are intentionally out of scope.

## Structure

```text
src/
  index.ts
  server.ts
  shared/
    errors/
      app-error.ts
      not-found-error.ts
  bootstrap/
    index.ts
    config.ts
    mongo.ts
    helmet.ts
    cors.ts
    rate-limit.ts
    error-handler.ts
    health.ts
  integrations/
    mongodb/
      client.ts
  types/
    fastify.d.ts
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

`bootstrap/` contains one focused configuration module per shared concern, composed by `bootstrap/index.ts`. The main `index.ts` creates Fastify, applies the bootstrap, and registers feature routes. `server.ts` loads configuration and starts listening.

Docker files live under `docker/`; project helper scripts live under `scripts/`.

Shared application errors live in `shared/errors/` and are translated to HTTP responses by `bootstrap/error-handler.ts`. Use `AppError` for typed HTTP errors and `NotFoundError` for missing resources. Shared utilities should be added when an actual helper is reused across features; avoid creating generic utility code prematurely. Provider-specific clients belong under `integrations/`; MongoDB client creation is in `integrations/mongodb/`.

## Configuration

Set these environment variables before starting the app:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | — | MongoDB connection URL (`mongodb://` or `mongodb+srv://`). |
| `MONGODB_DATABASE` | Yes | — | Database name to use. |
| `CORS_ORIGINS` | No | No origins allowed | Comma-separated HTTP(S) origins, without paths. |
| `PORT` | No | `3000` | Listen port. |
| `HOST` | No | `0.0.0.0` | Listen interface. |
| `LOG_LEVEL` | No | `info` | Pino log level. |
| `RATE_LIMIT_MAX` | No | `100` | Requests allowed per rate-limit window. |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate-limit window in milliseconds. |

The bootstrap fails startup if MongoDB settings are missing or the connection fails. Fastify's Pino logger redacts common credential fields; MongoDB command payload logging is not enabled.

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

Useful commands: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm check`, and `pnpm start`.

## Docker

Run the API and a local MongoDB instance with Docker Compose:

```bash
docker compose -f docker/compose.yaml up --build
```

The API is available at `http://localhost:3000`; the MongoDB data is stored in the named `mongodb-data` volume. Set `CORS_ORIGINS` in your environment to a comma-separated list of allowed frontend origins. Stop the services with `docker compose -f docker/compose.yaml down`; use `docker compose -f docker/compose.yaml down --volumes` only when you intentionally want to remove the local database volume.
