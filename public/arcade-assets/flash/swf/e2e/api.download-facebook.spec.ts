import { test, expect } from "../playwright-fixture";

// Smoke + contract test for /api/download-facebook.
// Validates:
//  1. Invalid URLs return a friendly Portuguese error and success=false.
//  2. A real public Facebook URL either returns a usable media_url + proxy_url,
//     or a friendly error when every upstream provider fails (never a 500
//     or an opaque/empty payload).

const PUBLIC_FB_URL = "https://www.facebook.com/watch/?v=10153231379946729";

test.describe("/api/download-facebook", () => {
  test("rejects invalid URLs with a friendly error", async ({ request }) => {
    const res = await request.post("/api/download-facebook", {
      data: { url: "https://example.com/not-facebook" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe("string");
    expect(body.error.toLowerCase()).toContain("facebook");
  });

  test("rejects empty body with a friendly error", async ({ request }) => {
    const res = await request.post("/api/download-facebook", { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeTruthy();
  });

  test("OPTIONS preflight returns CORS headers", async ({ request }) => {
    const res = await request.fetch("/api/download-facebook", { method: "OPTIONS" });
    expect(res.status()).toBe(204);
    expect(res.headers()["access-control-allow-origin"]).toBe("*");
    expect(res.headers()["access-control-allow-methods"]).toContain("POST");
  });

  test("public Facebook URL returns media or a friendly error", async ({ request }) => {
    const res = await request.post("/api/download-facebook", {
      data: { url: PUBLIC_FB_URL },
      timeout: 45_000,
    });
    // Must always be 200 — handler never throws to the client.
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("success");

    if (body.success) {
      expect(body.data).toBeTruthy();
      expect(typeof body.data.media_url).toBe("string");
      expect(body.data.media_url.length).toBeGreaterThan(0);
      expect(body.data.media_type).toBe("video");
      // Proxy URL is required so the browser can stream without CORS issues.
      expect(body.data.proxy_url).toContain("/api/download-facebook?action=proxy");
      expect(typeof body.data.title).toBe("string");
    } else {
      // Friendly, user-facing error in Portuguese (no stack traces / raw provider text).
      expect(typeof body.error).toBe("string");
      expect(body.error.length).toBeGreaterThan(10);
      expect(body.error).not.toMatch(/undefined|\[object|TypeError|RapidAPI/i);
    }
  });

  test("proxy rejects non-allowlisted media_url", async ({ request }) => {
    const res = await request.get(
      "/api/download-facebook?action=proxy&media_url=" +
        encodeURIComponent("https://evil.example.com/x.mp4"),
    );
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});