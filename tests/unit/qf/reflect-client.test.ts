import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the errors module
vi.mock("../../../lib/qf/errors", () => ({
  captureResponseError: vi.fn(),
  logQfError: vi.fn(),
}));

// Mock supabase so errors module import chain doesn't fail
vi.mock("../../../lib/supabase/server", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: vi.fn() })),
  })),
}));

import { qfReflectFetch, getContentTokenCached } from "../../../lib/qf/client";
import { captureResponseError, logQfError } from "../../../lib/qf/errors";
import type { MockInstance } from "vitest";

const mockCaptureError = captureResponseError as unknown as MockInstance;
const mockLogQfError = logQfError as unknown as MockInstance;

describe("qfReflectFetch — direct API key auth", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("Test 1 — uses QF_CLIENT_SECRET as x-auth-token without minting an OAuth token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ total: 0, data: [] }),
    });
    global.fetch = fetchMock;

    const path =
      "/quran-reflect/v1/posts/feed?filter[references][0][chapterId]=2";
    await qfReflectFetch(path);
    await qfReflectFetch(path);

    // fetch called both times — no token-mint deduplication needed
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Both calls carry x-auth-token from env (process.env.QF_CLIENT_SECRET ?? "")
    for (const call of fetchMock.mock.calls) {
      const opts = call[1] as RequestInit & {
        headers: Record<string, string>;
      };
      // The value comes from process.env.QF_CLIENT_SECRET; in test env it resolves to ""
      expect(opts.headers).toHaveProperty("x-auth-token");
      expect(opts.headers).toHaveProperty("x-client-id");
    }
  });

  it("Test 2 — uses QF_REFLECT_BASE as the fetch URL prefix", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ total: 0, data: [] }),
    });
    global.fetch = fetchMock;

    await qfReflectFetch("/quran-reflect/v1/posts/feed");

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/^https:\/\/apis\.quran\.foundation/);
  });

  it("Test 3 — throws on non-2xx and calls logQfError", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    mockCaptureError.mockResolvedValue({ status: 403, body: "Forbidden" });
    mockLogQfError.mockResolvedValue(undefined);

    await expect(
      qfReflectFetch("/quran-reflect/v1/posts/feed")
    ).rejects.toThrow("403");

    expect(mockLogQfError).toHaveBeenCalledTimes(1);
  });

  it("Test 4 — reflect fetch does NOT populate content token cache", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ total: 0, data: [] }),
    });

    await qfReflectFetch("/quran-reflect/v1/posts/feed");

    expect(getContentTokenCached()).toBeNull();
  });
});
