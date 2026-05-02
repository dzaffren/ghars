import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";

// Mock the oauth module
vi.mock("../../../lib/qf/oauth", () => ({
  getClientCredentialsToken: vi.fn(),
}));

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

import {
  qfReflectFetch,
  setReflectToken,
  getReflectTokenCached,
  getContentTokenCached,
} from "../../../lib/qf/client";
import { getClientCredentialsToken } from "../../../lib/qf/oauth";
import { captureResponseError, logQfError } from "../../../lib/qf/errors";

const mockGetToken = getClientCredentialsToken as unknown as MockInstance;
const mockCaptureError = captureResponseError as unknown as MockInstance;
const mockLogQfError = logQfError as unknown as MockInstance;

describe("qfReflectFetch — token caching", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Reset token state between tests
    setReflectToken("", -1); // force expiry
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("Test 1 — mints token once and reuses it across two calls", async () => {
    mockGetToken.mockResolvedValue({
      access_token: "rt_abc",
      expires_in: 3600,
    });

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

    // Token minted exactly once
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledWith("post.read comment.read");

    // Both fetch calls carried the token header
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const call of fetchMock.mock.calls) {
      const opts = call[1] as RequestInit & { headers: Record<string, string> };
      expect(opts.headers["x-auth-token"]).toBe("rt_abc");
    }
  });

  it("Test 2 — uses QF_REFLECT_BASE as the fetch URL prefix", async () => {
    mockGetToken.mockResolvedValue({
      access_token: "rt_xyz",
      expires_in: 3600,
    });

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
    mockGetToken.mockResolvedValue({
      access_token: "rt_err",
      expires_in: 3600,
    });

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
    mockGetToken.mockResolvedValue({
      access_token: "rt_only",
      expires_in: 3600,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ total: 0, data: [] }),
    });

    await qfReflectFetch("/quran-reflect/v1/posts/feed");

    expect(getContentTokenCached()).toBeNull();
  });
});
