# ORBIT FLIP

A tiny, instant-play arcade game for the whole world. Switch between two orbits, dodge red obstacles, and collect gold stars.

## Play

Open `index.html` in a modern browser. Tap the playfield or press **Space** to change orbit. Gold stars give **5 points**; survival gives **1 point per second**. A red obstacle ends the run. Press **P** or **Escape** to pause. The game also pauses when it loses focus.

English, Japanese, Spanish, Portuguese, and French are supported. The browser language is selected automatically; use the language menu to override it. Sound is off by default. Personal best and preferences stay in the current browser. No account, analytics, advertisements, or backend.

## Development

Plain HTML, CSS, JavaScript, and Canvas. No build step or package dependencies. Optional Google Fonts fall back to installed fonts if unavailable. All gameplay runs offline after the files are downloaded.

Serve this directory using any static web server, or open `index.html` directly.

## GitHub Pages

Publish the `main` branch, root directory, under repository **Settings → Pages → Deploy from a branch**. The `.nojekyll` file allows the files to be served unchanged.

## License

MIT. See [LICENSE](LICENSE).
