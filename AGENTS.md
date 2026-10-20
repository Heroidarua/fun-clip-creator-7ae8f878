# Project decisions

- Initiate YouTube file downloads through a temporary hidden iframe, not top-level navigation, so the tool remains available for consecutive links.
- Mirror Arcade game documents and assets through same-origin routes with game-specific nonces and same-origin framing; keep the site's global anti-framing policy intact.
