import { describe, it, expect } from "vitest";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  buildAuthorizeUrl,
} from "../../lib/qf/oauth";

describe("OAuth PKCE helpers", () => {
  it("generates a code verifier of 43+ characters", () => {
    const v = generateCodeVerifier();
    expect(v.length).toBeGreaterThanOrEqual(43);
    expect(v).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates a deterministic code challenge from verifier", () => {
    const v = generateCodeVerifier();
    const c1 = generateCodeChallenge(v);
    const c2 = generateCodeChallenge(v);
    expect(c1).toBe(c2);
    expect(c1.length).toBeGreaterThan(0);
  });

  it("generates a unique state each time", () => {
    const s1 = generateState();
    const s2 = generateState();
    expect(s1).not.toBe(s2);
    expect(s1.length).toBe(32); // 16 bytes hex = 32 chars
  });

  it("buildAuthorizeUrl includes all required PKCE params", () => {
    process.env.QF_OAUTH_BASE = "https://oauth2.quran.foundation";
    process.env.QF_CLIENT_ID = "test_client";
    const url = buildAuthorizeUrl({
      redirectUri: "http://localhost:3000/api/auth/callback",
      state: "teststate",
      codeChallenge: "testchallenge",
    });
    expect(url).toContain("response_type=code");
    expect(url).toContain("code_challenge_method=S256");
    expect(url).toContain("state=teststate");
    expect(url).toContain("code_challenge=testchallenge");
  });
});
