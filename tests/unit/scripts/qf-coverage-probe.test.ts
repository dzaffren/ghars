import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Mock lib/qf/reflect before importing runProbe
vi.mock("@/lib/qf/reflect", () => ({
  listReflectPostsForAyah: vi.fn(),
  listAyahAnswers: vi.fn(),
}));

// Import the mocks to control them
import { listReflectPostsForAyah, listAyahAnswers } from "@/lib/qf/reflect";

const VERSE_KEYS = [
  "2:153",
  "2:286",
  "3:139",
  "3:200",
  "13:28",
  "14:7",
  "39:53",
  "65:3",
  "94:5",
  "94:6",
  "49:13",
  "17:23",
  "31:14",
  "9:51",
  "2:255",
  "59:18",
  "33:41",
  "4:103",
  "16:90",
  "23:1",
];

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "probe-test-"));
}

async function makeShortlistFile(
  entries: { verse_key: string }[]
): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "probe-shortlist-"));
  const filePath = path.join(dir, "probe-shortlist.json");
  await fs.writeFile(filePath, JSON.stringify(entries), "utf8");
  return filePath;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ────────────────────────────────────────────────────────────
// Test 1: proceed verdict when ≥15 usable
// ────────────────────────────────────────────────────────────
describe("runProbe — proceed verdict when ≥15 usable", () => {
  it("returns proceed verdict and writes correct files when 17/20 have posts", async () => {
    const usableKeys = new Set(VERSE_KEYS.slice(0, 17));

    vi.mocked(listReflectPostsForAyah).mockImplementation(async (verseKey) => {
      if (usableKeys.has(verseKey)) {
        return {
          total: 1,
          posts: [
            {
              id: 1,
              body: "<p>Steady.</p>",
              verified: true,
              featuredAt: null,
              moderationStatus: "APPROVED",
              languageName: "English",
              likesCount: 5,
              commentsCount: 2,
            },
          ],
        };
      }
      return { total: 0, posts: [] };
    });
    vi.mocked(listAyahAnswers).mockResolvedValue({ total: 0, questions: [] });

    const outputDir = await makeTempDir();
    const shortlistPath = await makeShortlistFile(
      VERSE_KEYS.map((v) => ({ verse_key: v }))
    );

    const { runProbe } = await import("@/scripts/qf-coverage-probe");
    const result = await runProbe({ shortlistPath, outputDir });

    expect(result.usableCount).toBe(17);
    expect(result.verdict).toBe("proceed");

    // Check CSV exists
    const csvContent = await fs.readFile(
      path.join(outputDir, "probe-report.csv"),
      "utf8"
    );
    expect(csvContent).toContain("verse_key,posts_total,answers_total,usable");

    // Check MD exists and contains correct verdict
    const mdContent = await fs.readFile(
      path.join(outputDir, "probe-report.md"),
      "utf8"
    );
    expect(mdContent).toContain("**Verdict:** proceed (17/20 usable)");
  });
});

// ────────────────────────────────────────────────────────────
// Test 2: pause verdict when <15 usable
// ────────────────────────────────────────────────────────────
describe("runProbe — pause verdict when <15 usable", () => {
  it("returns pause verdict when only 8/20 have answers", async () => {
    const usableKeys = new Set(VERSE_KEYS.slice(0, 8));

    vi.mocked(listReflectPostsForAyah).mockResolvedValue({
      total: 0,
      posts: [],
    });
    vi.mocked(listAyahAnswers).mockImplementation(async (verseKey) => {
      if (usableKeys.has(verseKey)) {
        return {
          total: 1,
          questions: [
            {
              id: "q1",
              body: "Why does patience come before prayer?",
              answers: [
                {
                  id: "a1",
                  type: "TAFSIR" as const,
                  body: "An answer.",
                  status: "Published",
                  language: "English",
                  answeredBy: "Dr A",
                },
              ],
            },
          ],
        };
      }
      return { total: 0, questions: [] };
    });

    const outputDir = await makeTempDir();
    const shortlistPath = await makeShortlistFile(
      VERSE_KEYS.map((v) => ({ verse_key: v }))
    );

    const { runProbe } = await import("@/scripts/qf-coverage-probe");
    const result = await runProbe({ shortlistPath, outputDir });

    expect(result.usableCount).toBe(8);
    expect(result.verdict).toBe("pause");

    const mdContent = await fs.readFile(
      path.join(outputDir, "probe-report.md"),
      "utf8"
    );
    expect(mdContent).toContain(
      "**Verdict:** pause — reopen discovery (8/20 usable)"
    );
  });
});

// ────────────────────────────────────────────────────────────
// Test 3: excerpts are stripped of HTML tags
// ────────────────────────────────────────────────────────────
describe("runProbe — HTML stripping", () => {
  it("strips HTML tags from top_post_excerpt including script tags", async () => {
    vi.mocked(listReflectPostsForAyah).mockResolvedValue({
      total: 1,
      posts: [
        {
          id: 1,
          body: "<p>Steady, and asking.</p><script>alert(1)</script>",
          verified: true,
          featuredAt: null,
          moderationStatus: "APPROVED",
          languageName: "English",
          likesCount: 3,
          commentsCount: 1,
        },
      ],
    });
    vi.mocked(listAyahAnswers).mockResolvedValue({ total: 0, questions: [] });

    const outputDir = await makeTempDir();
    const shortlistPath = await makeShortlistFile(
      VERSE_KEYS.map((v) => ({ verse_key: v }))
    );

    const { runProbe } = await import("@/scripts/qf-coverage-probe");
    await runProbe({ shortlistPath, outputDir });

    const csvContent = await fs.readFile(
      path.join(outputDir, "probe-report.csv"),
      "utf8"
    );
    expect(csvContent).not.toContain("<p>");
    expect(csvContent).not.toContain("<script>");
    expect(csvContent).toContain("Steady, and asking.");

    const mdContent = await fs.readFile(
      path.join(outputDir, "probe-report.md"),
      "utf8"
    );
    expect(mdContent).not.toContain("<p>");
    expect(mdContent).not.toContain("<script>");
    expect(mdContent).toContain("Steady, and asking.");
  });
});

// ────────────────────────────────────────────────────────────
// Test 4: idempotent — second run overwrites first
// ────────────────────────────────────────────────────────────
describe("runProbe — idempotent (second run overwrites first)", () => {
  it("second run's data replaces first run's data", async () => {
    const outputDir = await makeTempDir();
    const shortlistPath = await makeShortlistFile(
      VERSE_KEYS.map((v) => ({ verse_key: v }))
    );

    const { runProbe } = await import("@/scripts/qf-coverage-probe");

    // First run: 20/20 usable
    vi.mocked(listReflectPostsForAyah).mockResolvedValue({
      total: 1,
      posts: [
        {
          id: 1,
          body: "First run.",
          verified: true,
          featuredAt: null,
          moderationStatus: "APPROVED",
          languageName: "English",
          likesCount: 1,
          commentsCount: 0,
        },
      ],
    });
    vi.mocked(listAyahAnswers).mockResolvedValue({ total: 0, questions: [] });
    await runProbe({ shortlistPath, outputDir });

    // Second run: 0/20 usable
    vi.mocked(listReflectPostsForAyah).mockResolvedValue({
      total: 0,
      posts: [],
    });
    vi.mocked(listAyahAnswers).mockResolvedValue({ total: 0, questions: [] });
    const result = await runProbe({ shortlistPath, outputDir });

    expect(result.usableCount).toBe(0);
    expect(result.verdict).toBe("pause");

    const mdContent = await fs.readFile(
      path.join(outputDir, "probe-report.md"),
      "utf8"
    );
    // Second run's verdict should be present
    expect(mdContent).toContain(
      "**Verdict:** pause — reopen discovery (0/20 usable)"
    );
    // First run's verdict should NOT be present
    expect(mdContent).not.toContain("proceed");
    expect(mdContent).not.toContain("20/20");
  });
});

// ────────────────────────────────────────────────────────────
// Test 5: shortlist with wrong count fails clearly
// ────────────────────────────────────────────────────────────
describe("runProbe — shortlist validation", () => {
  it("rejects with an error containing '20' when shortlist has only 5 entries", async () => {
    vi.mocked(listReflectPostsForAyah).mockResolvedValue({
      total: 0,
      posts: [],
    });
    vi.mocked(listAyahAnswers).mockResolvedValue({ total: 0, questions: [] });

    const outputDir = await makeTempDir();
    const shortlistPath = await makeShortlistFile(
      VERSE_KEYS.slice(0, 5).map((v) => ({ verse_key: v }))
    );

    const { runProbe } = await import("@/scripts/qf-coverage-probe");

    await expect(runProbe({ shortlistPath, outputDir })).rejects.toThrow(/20/);
  });
});
