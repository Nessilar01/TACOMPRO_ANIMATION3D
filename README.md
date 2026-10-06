# RAI Computer Programming Competition 2026 · 3D Match Viewer

A three.js 3D replay of the three full matches (ranking match clean run, ranking match with two drops, 8-robot final) on the real field.

- Live page: https://nessilar01.github.io/TACOMPRO_ANIMATION3D/ (enable GitHub Pages: Settings → Pages → Deploy from branch → `main` / root)
- Rebuild: `python3 build.py` (writes `index.html`)
- Source: `src/v3d.js` (3D renderer), `src/v3d.html` (page), `src/p2.js`–`p3d.js` (timeline engine and clips, shared with the 2D rulebook animation)
- three.js 0.128.0 is loaded from the jsDelivr CDN, so the page needs internet access.
