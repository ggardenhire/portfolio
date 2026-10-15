# Images

Drop your image files here. Anything in `public/` is served from the site root,
so a file at `public/images/me.jpg` is referenced in code as `/images/me.jpg`.

Expected files (referenced from [`src/data/resume.ts`](../../src/data/resume.ts)):

| File                   | Used for                          | Suggested size            |
| ---------------------- | --------------------------------- | ------------------------- |
| `me.jpg`               | Hero headshot (`avatar`)          | ~400×400, square          |
| `photo-1.jpg`          | About gallery                     | ~800×600                  |
| `photo-2.jpg`          | About gallery                     | ~800×600                  |

Notes:

- If `me.jpg` is missing, the hero falls back to your initials — no broken image.
- To change which photos show (or hide the gallery), edit the `avatar` and
  `photos` fields in `src/data/resume.ts`.
- `.jpg`, `.png`, and `.webp` all work; just match the filename to the data file.
- Commit the images and push to `main` — the container will pick them up on its
  next poll and rebuild automatically.
