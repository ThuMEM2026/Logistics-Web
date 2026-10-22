# TTS static comparison site

Scope: `public/tts`. No live generation, keys, synthesis charges or teacher uploads.

Sources:
- Existing `display-manifest.json`: 15 short samples and their source/audio hashes.
- Existing `long/compare/comparison.json`: five Cai long samples.
- Existing `long/zhangwei/comparison.json`: three Zhang long samples.
- `assets/models.mjs`: dated prices, billing conversion, restrictions and official links.

Rebuild shared catalog with `python3 scripts/tts/build_catalog.py`; rebuild the three
entry-point shells with `python3 scripts/tts/build_pages.py`. All audio and detailed
Realtime audit stay in place. Do not use earlier external one-off HTML builders to
overwrite these shared entry points.

Check: `node --check public/tts/assets/app.mjs` and `node scripts/tts/verify.mjs`.
Also visually verify responsive layouts and interactions in a browser before release.
Old short feedback storage keys are preserved. New long feedback has a separate key.
Only user-entered hearing feedback is exported; it is never automatically uploaded.
