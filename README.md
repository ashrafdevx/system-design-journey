# BookMyShow API starter

A small Fastify + TypeScript API starter for the initial BookMyShow domains. Cities, cinemas, and shows use MongoDB persistence. Booking flows are intentionally out of scope.

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
    swagger.ts
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

Shared application errors live in `shared/errors/` and are translated to HTTP responses by `bootstrap/error-handler.ts`. Shared utilities used by multiple modules live in `shared/utils/`. Provider-specific clients belong under `integrations/`; MongoDB client creation is in `integrations/mongodb/`.

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
Swagger UI is available at `/docs` outside production. It is disabled when `NODE_ENV=production`.

## Endpoints

- `GET /health`
- `GET|POST /api/v1/cities`
- `GET|PUT|DELETE /api/v1/cities/:cityId`
- `GET|POST /api/v1/cinemas` (`GET` supports the `cityId` filter)
- `GET|PUT|DELETE /api/v1/cinemas/:cinemaId`
- `GET|POST /api/v1/shows` (`GET` supports `cityId` and `cinemaId` filters)
- `GET|PUT|DELETE /api/v1/shows/:showId`

Create requests return `201`; delete requests return `204`. IDs are MongoDB ObjectId strings. List responses use `{ "data": [...] }`; item responses use `{ "data": {...} }`. Missing resources return `404`; invalid payloads return `400`; deleting cities or cinemas that still have dependent records returns `409`. Responses read from MongoDB, so new databases return empty lists until records are created through these endpoints or seeded.

**Security:** write endpoints currently have no authentication or authorization. Keep this API on a trusted development network; do not expose it publicly until write access is protected.

## Run locally

Requires Node.js 22 or later.
The development command loads `.env` from the project root when present. It requires `MONGODB_URI` and `MONGODB_DATABASE` to be set in `.env` or the shell environment.

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
