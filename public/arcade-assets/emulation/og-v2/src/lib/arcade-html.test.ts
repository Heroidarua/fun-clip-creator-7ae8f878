import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { rewriteArcadeHtml } from "./arcade-html";

describe("Arcade mirror document", () => {
  test("preserves game path for the partner router", () => {
    const html = rewriteArcadeHtml("<html><head></head><body></body></html>", "/retro-games/metal-slug", "testnonce");
    assert.ok(html.includes('history.replaceState(null,"","/retro-games/metal-slug")'));
  });

  test("preserves asset query strings and already encoded paths", () => {
    const html = rewriteArcadeHtml('<head><script src="/games/my%20game.js?v=2"></script></head>', "/minecraft", "testnonce");
    assert.ok(html.includes('/wasm-mirror/games/my%20game.js?v=2'));
    assert.ok(!html.includes('%2520'));
  });

  test("ignores blob URLs used by the emulator", async () => {
    const html = rewriteArcadeHtml("<head></head>", "/retro-games/metal-slug", "testnonce");
    const script = html.match(/<script nonce="testnonce">\s*\(function[\s\S]*?<\/script>/)?.[0];
    if (!script) throw new Error("Mirror bootstrap missing");
    const match = script.match(/function rw\(u\) \{([\s\S]*?)\n  \}/);
    if (!match) throw new Error("URL rewriter missing");
    const rewrite = new Function("u", "location", "S", "M", match[1]);
    const location = { href: "https://sos01.com.br/retro-games/metal-slug", origin: "https://sos01.com.br" };
    assert.equal(rewrite("blob:https://sos01.com.br/123", location, "https://wasmarcade.com", "/wasm-mirror"), "blob:https://sos01.com.br/123");
    assert.equal(rewrite("/emulation/core.wasm?v=2", location, "https://wasmarcade.com", "/wasm-mirror"), "/wasm-mirror/emulation/core.wasm?v=2");
  });
});