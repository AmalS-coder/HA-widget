# HA Status Widget

React + TypeScript implementation of the Figma HA pair and firewall cluster widgets.

## Development

Requires Node.js 22.18+ and npm.

```sh
npm install
npm run dev
```

The folders under `src` are organized by responsibility:

- `components`: pair diagram, lifecycle artwork, cluster accordion, and widget shell.
- `hooks`: cancellable loading, 10-second polling, and retry.
- `services`: API client, Zod response schema, types, mock fixtures, and tests.

## Mock Or Real API

Set these values in `.env.local` and restart Vite after changing them:

```dotenv
VITE_USE_MOCKS=true
VITE_MOCK_SCENARIO=updating
VITE_HA_API_URL=/api/ha-pairs
```

`VITE_USE_MOCKS` is the switch. When unset, development uses mocks and production uses the real API. Set it explicitly to `true` for a mock production preview, or `false` for real API development. Vite environment variables are public build-time settings, not secrets.

Available mock scenarios: `updating`, `no-volume`, `rebooting`, `traffic-b`, `offline`, and `clusters`. For example:

```sh
VITE_MOCK_SCENARIO=clusters npm run dev
```

Real mode performs `GET VITE_HA_API_URL`, validates the JSON, and reports HTTP, network, or schema failures with a Retry action. It never silently substitutes mock data. Configure your backend to serve this path, use a Vite proxy, or supply an absolute URL whose server permits your frontend origin via CORS. No backend endpoint is included in this repository.

## API Contract

The endpoint returns a dashboard object, not a bare array:

```json
{
	"title": "HA pair",
	"updatedAt": "2026-11-06T23:36:40Z",
	"live": true,
	"layout": "pair",
	"pairs": [{
		"id": "ha-pair",
		"name": "HA pair",
		"step": 2,
		"totalSteps": 8,
		"phase": "Installing 17.1.1 on Node B",
		"phaseStatus": "running",
		"nodes": [{
			"id": "a",
			"name": "Node A",
			"role": "active",
			"lifecycle": "online",
			"version": "16.1.4",
			"volume": "Volume 1"
		}, {
			"id": "b",
			"name": "Node B",
			"role": "standby",
			"lifecycle": "updating",
			"version": "16.1.4",
			"targetVersion": "17.1.1",
			"progress": 35,
			"volume": "Volume 2"
		}]
	}]
}
```

- `layout`: `pair` for a single pair, `clusters` for independently expandable firewall pairs. The cluster count comes from the array length; pair IDs must be unique.
- `role`: `active` or `standby`, independently of `lifecycle` (`online`, `updating`, `rebooting`, `offline`). At most one node may be active. Traffic is shown only for an online active node; standby, updating, rebooting, and offline nodes never receive traffic.
- `nodes`: exactly two, ordered `a`, then `b`. Either node can assume either role or any lifecycle.
- `volume`: omit it, set it to `null`, or use an empty string to remove only the volume text.
- `progress`: a number from 0 to 100. Updating nodes require this and `targetVersion`; their progressbar is hidden for other lifecycles.
- `message`: optional API-supplied node detail, such as `Not back after restart`; otherwise version text follows the lifecycle.
- `phaseStatus`: `running`, `failed`, or `complete`, controlling the current step colour. `step` starts at 1 and cannot exceed `totalSteps`.
- `updatedAt`: ISO UTC timestamp, displayed in UTC. `live` controls the Live/Paused label; requests continue polling in either case.
- `pairs: []`: supported empty state. Loading, error, empty, and collapsed states are also handled.

## Validation

```sh
npm run typecheck
npm test
npm run lint
npm run build
```

Service tests cover mock fixtures, routing, cancellation, real API requests, error propagation, and response validation. Browser checks cover each supplied scenario at desktop and 320px widths, missing volumes, local artwork loading, and independent expansion.
