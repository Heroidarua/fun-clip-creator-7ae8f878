import { describe, expect, test } from "bun:test";
import { rewriteArcadeHtml } from "./arcade-html";

describe("Arcade mirror document", () => {
  test("preserves game path for the partner router", () => {
    const html = rewriteArcadeHtml("<html><head></head><body></body></html>", "/retro-games/metal-slug", "testnonce");
    expect(html).toContain('history.replaceState(null,"","/retro-games/metal-slug")');
  });

  test("preserves asset query strings and already encoded paths", () => {
    const html = rewriteArcadeHtml('<head><script src="/games/my%20game.js?v=2"></script></head>', "/minecraft", "testnonce");
    expect(html).toContain('/wasm-mirror/games/my%20game.js?v=2');
    expect(html).not.toContain('%2520');
  });

  test("ignores blob URLs used by the emulator", async () => {
    const html = rewriteArcadeHtml("<head></head>", "/retro-games/metal-slug", "testnonce");
    const script = html.match(/<script nonce="testnonce">\s*\(function[\s\S]*?<\/script>/)?.[0];
    if (!script) throw new Error("Mirror bootstrap missing");
    const match = script.match(/function rw\(u\) \{([\s\S]*?)\n  \}/);
    if (!match) throw new Error("URL rewriter missing");
    const rewrite = new Function("u", "location", "S", "M", match[1]);
    const location = { href: "https://sos01.com.br/retro-games/metal-slug", origin: "https://sos01.com.br" };
    expect(rewrite("blob:https://sos01.com.br/123", location, "https://wasmarcade.com", "/wasm-mirror")).toBe("blob:https://sos01.com.br/123");
    expect(rewrite("/emulation/core.wasm?v=2", location, "https://wasmarcade.com", "/wasm-mirror")).toBe("/wasm-mirror/emulation/core.wasm?v=2");
  });
});