# Vault Scripture

A single-user, self-hosted, offline-first Bible reading app styled as a
retro-terminal RPG. See [`CLAUDE.md`](./CLAUDE.md) for the full spec and
working agreement.

## Development

```bash
npm install
npm run dev       # dev server
npm test          # vitest
npm run ingest:bible   # re-pull the WEB text into src/data/bible/*.json
```

## Deploying on Unraid (Docker)

The app is a fully static build served by nginx — there is no backend and
no database to run. All reading history, XP, stats, loot, and caps are
stored in the *browser's* IndexedDB, not on the server, so the container
itself is stateless and needs no volumes.

**Because data lives in the browser, not the server:** opening the app
from a different device or browser gives you a separate, empty profile —
there's no account system or sync between them (that's intentional, see
`CLAUDE.md` §1's non-goals). Treat it as "one browser, one save file,"
even though the container is reachable from anywhere on your network.

### Option A — docker-compose (Compose Manager plugin)

```bash
docker compose up -d --build
```

Then open `http://<unraid-ip>:8080`. Edit the port mapping in
`docker-compose.yml` if 8080 is taken.

### Option B — plain `docker build` / `docker run`

```bash
docker build -t vault-scripture .
docker run -d --name vault-scripture -p 8080:80 --restart unless-stopped vault-scripture
```

### Option C — Unraid's Docker tab, from source

Add a container manually: point it at this repo (or a registry image you
push yourself), leave volumes empty, map container port `80` to whatever
host port you want, and set the WebUI field to
`http://[IP]:[PORT:8080]/` so it shows up with a launch icon.

### Reaching it off your LAN

By default the container is only reachable inside your home network. To
use it from outside (e.g. your phone off wifi), don't port-forward it
directly to the internet — put it behind a VPN back into your LAN
(Tailscale or WireGuard) instead. Whatever device you connect from still
gets its own separate browser profile/data, per the caveat above.
