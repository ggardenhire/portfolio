# portfolio

Self-hosted resume / portfolio site for **Garret Gardenhire — Senior DevSecOps Engineer**.

- **React + TypeScript + Vite** single-page app
- Restrained **90s desktop aesthetic** (beveled window chrome, title bars, a live taskbar clock) — professional, no `<blink>`
- Deployed via **[Podium](https://github.com/ggardenhire/podium)**, a self-updating runner container: it polls GitHub `main` and rebuilds the site when you push. No image rebuilds, no manual deploys.

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

## Deployment

The site is served by **[Podium](https://github.com/ggardenhire/podium)**, a
generic self-updating runner container. This repo ships no Dockerfile — it just
holds the site; Podium clones it, builds it (`npm ci && npm run build` → `dist/`),
serves it with nginx, and polls `main` to rebuild on every push.

Build the Podium image once, then bring up the stack from [`docker-compose.yml`](docker-compose.yml):

```bash
git clone https://github.com/ggardenhire/podium.git
docker build -t podium:latest ./podium

docker compose up -d
# site: http://localhost:8080   (host 8080 -> container 80)
```

`docker-compose.yml` points Podium at this repo via `REPO_URL`. See Podium's
README for the full env-var reference (`REPO_BRANCH`, `POLL_INTERVAL`,
`BUILD_CMD`, `OUTPUT_DIR`, `PORT`), unraid setup, and reverse-proxy notes.

## Security notes

- `npm audit` is clean (0 vulnerabilities) on Vite 8 / `@vitejs/plugin-react` 6. Keep it that way with periodic `npm audit` + dependency bumps.
- nginx headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) and TLS/HSTS/CSP are handled by Podium and your reverse proxy — see the Podium README.

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
docker-compose.yml    # runs the Podium image against this repo
```
