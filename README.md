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

### Recommended: pull the published image (supports Unraid's Update button)

Every push to `master` is automatically built and published to GitHub
Container Registry by `.github/workflows/docker-publish.yml`, at
`ghcr.io/cbarker777/vault-scripture:latest` — no login needed, the
package is public.

**Via Unraid's Docker tab:** Docker → Add Container → set Repository to
`ghcr.io/cbarker777/vault-scripture:latest`, map container port `80` to
whatever host port you want (e.g. `8181`), leave volumes empty, and set
the WebUI field to `http://[IP]:[PORT:8181]/`. Because this pulls from a
real registry (unlike building from source locally), Unraid's **Check
for Updates** / **Update** button works on it exactly like your other
containers — no terminal needed to update it anymore.

**Via the CLI**, equivalently:

```bash
docker run -d --name vault-scripture -p 8181:80 --restart unless-stopped ghcr.io/cbarker777/vault-scripture:latest
```

### Alternative: build from source

Useful if you want to test local changes before they're pushed.

```bash
docker build -t vault-scripture .
docker run -d --name vault-scripture -p 8181:80 --restart unless-stopped vault-scripture
```

or `docker compose up -d --build` (edit the port in `docker-compose.yml`
first if 8080 is taken). To update a source-built deployment, `bash
update.sh` pulls the latest commit, rebuilds, and swaps the running
container for a fresh one — see the script for the
`HOST_PORT`/`CONTAINER_NAME` variables if your setup differs from the
defaults. Either way, reading progress is untouched by any of this — it
lives in the browser, not the container.

### Reaching it off your LAN

By default the container is only reachable inside your home network. To
use it from outside (e.g. your phone off wifi), don't port-forward it
directly to the internet — put it behind a VPN back into your LAN
(Tailscale or WireGuard) instead. Whatever device you connect from still
gets its own separate browser profile/data, per the caveat above.
