# JELLY TOWER · K_games Tiny Play Lab

[Play free](https://mrbeside.github.io/orbit-flip/) · [X](https://x.com/mottyan005) · [YouTube](https://www.youtube.com/channel/UCTdlvA_Z4UXAkALixNthxUQ)

Tap or press Space to drop a wobbly jelly. Align it with the tower: overhangs fall off, perfect drops keep the full width. Reach 12 layers to win. P / Escape pauses; the game also pauses on focus loss. Replay instantly after a miss.

English, Japanese, Spanish, Portuguese and French. Local personal best, optional synthesized sound, reduced-motion support. No account, advertisements, analytics SDK or backend. Optional Google Fonts fall back to local fonts.

## Files

- index.html / style.css: responsive page and creator links.
- engine.js: deterministic simulation and Canvas renderer, shared by the game and promotional input replays.
- game.js: browser controls, localization, sound, local best and pause handling.
- archive/orbit-flip-v1/: preserved original experiment.
- tools/test.cjs: physics, state transitions and localization checks. Run with node tools/test.cjs.
- tools/server.cjs: local preview on 127.0.0.1:4173. Run with node tools/server.cjs.
- tools/render-video.cjs: local production script using @napi-rs/canvas and an explicit FFmpeg path; adapt the local font/runtime paths on other machines.

No build step: open index.html, or serve this directory. GitHub Pages publishes main, root, with .nojekyll.

## Media provenance

Promotional footage is an input replay through the shipped game engine. Game rules, speeds, collisions and scores are unchanged. It is not represented as a human player's record. The renderer adds headings and records the original input times; sound effects are synthesized, with no third-party music.

This is experiment 002, a new visual mechanic for the creator's short-game series. It is a hypothesis about visual clarity, not evidence that the first experiment performed poorly.

MIT license.
