# portfolio

Self-hosted resume / portfolio site for **Garret Gardenhire — Senior DevSecOps Engineer**.

- **React + TypeScript + Vite** single-page app
- Restrained **90s desktop aesthetic** (beveled window chrome, title bars, a live taskbar clock) — professional, no `<blink>`
- Ships as a **self-updating Docker container**: it polls GitHub `main` and rebuilds itself when you push. No image rebuilds, no manual deploys.

---

## Updating the site

Everything on the page comes from one file: [`src/data/resume.ts`](src/data/resume.ts). Edit it, commit, and push to `main`:

```bash
# edit src/data/resume.ts
git add -A && git commit -m "Update experience" && git push origin main
```

Within `POLL_INTERVAL` seconds (default 5 min) the running container pulls the change, rebuilds, and swaps the live site. A failed build (e.g. a syntax error) is logged and the **previous version stays live**.

### Photos

Put image files in [`public/images/`](public/images/) and reference them from `resume.ts`:

- `avatar` → hero headshot (`/images/me.jpg`). If the file is missing, the hero shows your initials instead of a broken image.
- `photos[]` → the gallery strip in the About section. Set it to `[]` to hide the gallery.

See [`public/images/README.md`](public/images/README.md) for expected filenames and sizes.

### Projects

Add entries to the `projects[]` array in `resume.ts`. Each renders a card with tags and optional **Live site** / **Source** buttons (e.g. [Curtain](https://github.com/ggardenhire/curtain) → gardenshire.net).

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## How the container works

The Docker image is a thin "runner" (nginx + node + git + a watch script). It does **not** bake in the site source. On startup [`docker/entrypoint.sh`](docker/entrypoint.sh):

1. Clones `REPO_URL` at branch `REPO_BRANCH`.
2. Runs `npm ci && npm run build` and publishes `dist/` to nginx's web root.
3. Starts nginx (serves on container port `80`, with a `/healthz` endpoint).
4. Loops forever: every `POLL_INTERVAL` seconds it `git fetch`es; if the remote HEAD moved, it pulls, rebuilds, and atomically swaps the live site.

| Env var         | Default                                             | Purpose                                   |
| --------------- | --------------------------------------------------- | ----------------------------------------- |
| `REPO_URL`      | `https://github.com/ggardenhire/portfolio.git`      | Repo to deploy. Private? See note below.  |
| `REPO_BRANCH`   | `main`                                              | Branch to track.                          |
| `POLL_INTERVAL` | `300`                                               | Seconds between update checks.            |

> **Private repo:** use a token in the URL, e.g. `https://<user>:<token>@github.com/you/repo.git` (a fine-grained PAT with read-only Contents scope). Prefer injecting it via an unraid variable rather than committing it.

## Build & run with Docker

```bash
docker compose up -d --build
# site: http://localhost:8080   (host 8080 -> container 80)
```

Or plain Docker:

```bash
docker build -t portfolio:latest .
docker run -d --name portfolio -p 8080:80 --restart unless-stopped portfolio:latest
```

## Deploying on unraid

1. Build the image somewhere with the repo checked out (or push it to a registry / GHCR and pull it on unraid).
2. **Add Container** → set:
   - **Repository:** `portfolio:latest` (or your registry path)
   - **Port:** container `80` → a host port, e.g. `8080`
   - **Variables:** `REPO_URL`, `REPO_BRANCH`, `POLL_INTERVAL` as needed
   - **Restart policy:** `unless-stopped`
3. No bind mounts are required — the site is pulled from GitHub on each boot and kept current while running.

### Reverse proxy

Point your reverse proxy (Nginx Proxy Manager, SWAG, Traefik, Caddy, …) at the container's host port:

- Upstream: `http://<unraid-ip>:8080`
- Health check path: `/healthz`
- Terminate TLS at the proxy; the container speaks plain HTTP on `80`.

Example Nginx Proxy Manager proxy host: Forward Hostname `<unraid-ip>`, Forward Port `8080`, Websockets off, Block Common Exploits on, SSL via Let's Encrypt.

## Security notes

- `npm audit` is clean (0 vulnerabilities) on Vite 8 / `@vitejs/plugin-react` 6. Keep it that way with periodic `npm audit` + dependency bumps.
- nginx sets `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`. Add HSTS/CSP at your TLS-terminating reverse proxy.

## Structure

```
public/
  images/             # <- drop your photos here (me.jpg, photo-1.jpg, …)
src/
  data/resume.ts      # <- all site content lives here
  App.tsx             # layout, nav, taskbar
  sections.tsx        # About / Skills / Experience / Projects / … windows
  components/         # Window chrome, Avatar (initials fallback), taskbar clock
  styles/             # reset, theme tokens, app styles
docker/
  entrypoint.sh       # clone → build → serve → poll-and-redeploy loop
  nginx.conf          # static serving + SPA fallback + /healthz
Dockerfile            # thin runner image
docker-compose.yml
```
