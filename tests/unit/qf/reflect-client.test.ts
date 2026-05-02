import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";

vi.mock("../../../lib/qf/oauth", () => ({
  getClientCredentialsToken: vi.fn(),
}));

vi.mock("../../../lib/qf/errors", () => ({
  captureResponseError: vi.fn(),
  logQfError: vi.fn(),
}));

vi.mock("../../../lib/supabase/server", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: vi.fn() })),
  })),
}));

import {
  qfReflectFetch,
  setContentToken,
  getContentTokenCached,
} from "../../../lib/qf/client";
import { getClientCredentialsToken } from "../../../lib/qf/oauth";
import { captureResponseError, logQfError } from "../../../lib/qf/errors";

const mockGetToken = getClientCredentialsToken as unknown as MockInstance;
const mockCaptureError = captureResponseError as unknown as MockInstance;
const mockLogQfError = logQfError as unknown as MockInstance;

describe("qfReflectFetch — shares content token", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    setContentToken("", -1); // force expiry
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("Test 1 — mints content token once and reuses it across two calls", async () => {
    mockGetToken.mockResolvedValue({
      access_token: "ct_abc",
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

    // Token minted exactly once, reused on second call
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const call of fetchMock.mock.calls) {
      const opts = call[1] as RequestInit & {
        headers: Record<string, string>;
      };
      expect(opts.headers["x-auth-token"]).toBe("ct_abc");
    }
  });

  it("Test 2 — uses QF_REFLECT_BASE as the fetch URL prefix", async () => {
    mockGetToken.mockResolvedValue({
      access_token: "ct_xyz",
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
      access_token: "ct_err",
      expires_in: 3600,
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    mockCaptureError.mockResolvedValue({ status: 403, body: "Forbidden" });
    mockLogQfError.mockResolvedValue(undefined);

    await expect(
      qfReflectFetch("/quran-reflect/v1/posts/feed")
    ).rejects.toThrow("403");
    expect(mockLogQfError).toHaveBeenCalledTimes(1);
  });

  it("Test 4 — reflect fetch populates the shared content token cache", async () => {
    mockGetToken.mockResolvedValue({
      access_token: "ct_shared",
      expires_in: 3600,
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ total: 0, data: [] }),
    });

    await qfReflectFetch("/quran-reflect/v1/posts/feed");

    // The shared content token is now cached
    expect(getContentTokenCached()).toBe("ct_shared");
  });
});
