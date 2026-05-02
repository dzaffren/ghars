import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock qfReflectFetch from the client module
vi.mock("../../../lib/qf/client", () => ({
  qfReflectFetch: vi.fn(),
}));

import { qfReflectFetch } from "../../../lib/qf/client";
import {
  listReflectPostsForAyah,
  listAyahAnswers,
  getReflectPostById,
  getAyahAnswerById,
} from "../../../lib/qf/reflect";

const mockFetch = qfReflectFetch as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listReflectPostsForAyah", () => {
  it("Test 1 — filters out unverified, non-English, and non-APPROVED posts", async () => {
    mockFetch.mockResolvedValue({
      total: 3,
      data: [
        {
          id: 1,
          verified: true,
          languageName: "English",
          moderationStatus: "APPROVED",
          draft: false,
          hidden: false,
          removed: false,
          body: "<p>text</p>",
          featuredAt: "2025-01-01T00:00:00Z",
          likesCount: 5,
          commentsCount: 2,
        },
        {
          id: 2,
          verified: false,
          languageName: "English",
          moderationStatus: "APPROVED",
          draft: false,
          hidden: false,
          removed: false,
          body: "...",
          featuredAt: null,
          likesCount: 1,
          commentsCount: 0,
        },
        {
          id: 3,
          verified: true,
          languageName: "Arabic",
          moderationStatus: "APPROVED",
          draft: false,
          hidden: false,
          removed: false,
          body: "...",
          featuredAt: null,
          likesCount: 2,
          commentsCount: 0,
        },
      ],
    });

    const result = await listReflectPostsForAyah("2:153");

    expect(result.total).toBe(1);
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe(1);
    expect(result.posts[0].body).toBe("<p>text</p>");
    expect(result.posts[0].verified).toBe(true);
    expect(result.posts[0].languageName).toBe("English");
    expect(result.posts[0].moderationStatus).toBe("APPROVED");
    expect(result.posts[0].featuredAt).toBe("2025-01-01T00:00:00Z");
    expect(result.posts[0].likesCount).toBe(5);
    expect(result.posts[0].commentsCount).toBe(2);
  });

  it("Test 2 — returns { total: 0, posts: [] } on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await listReflectPostsForAyah("2:153");

    expect(result).toEqual({ total: 0, posts: [] });
  });
});

describe("listAyahAnswers", () => {
  it("Test 3 — filters to Published English answers only and excludes questions with no valid answers", async () => {
    mockFetch.mockResolvedValue({
      totalCount: 2,
      questions: [
        {
          id: "q1",
          body: "Why?",
          type: "TAFSIR",
          answers: [
            {
              id: "a1",
              status: "Published",
              language: "English",
              body: "<p>ans</p>",
              answeredBy: "Dr A",
            },
          ],
        },
        {
          id: "q2",
          body: "How?",
          type: "CLARIFICATION",
          answers: [
            {
              id: "a2",
              status: "Draft",
              language: "English",
              body: "...",
              answeredBy: "Dr B",
            },
          ],
        },
      ],
    });

    const result = await listAyahAnswers("2:153");

    expect(result.total).toBe(1);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].id).toBe("q1");
    expect(result.questions[0].body).toBe("Why?");
    expect(result.questions[0].answers).toHaveLength(1);
    expect(result.questions[0].answers[0].id).toBe("a1");
    expect(result.questions[0].answers[0].status).toBe("Published");
    expect(result.questions[0].answers[0].language).toBe("English");
  });

  it("Test 4 — returns { total: 0, questions: [] } on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await listAyahAnswers("2:153");

    expect(result).toEqual({ total: 0, questions: [] });
  });
});

describe("getReflectPostById", () => {
  it("Test 5 — returns null for a post that fails the verified guard", async () => {
    mockFetch.mockResolvedValue({
      id: 99,
      verified: false,
      languageName: "English",
      moderationStatus: "APPROVED",
      draft: false,
      hidden: false,
      removed: false,
      body: "...",
      featuredAt: null,
      likesCount: 0,
      commentsCount: 0,
    });

    const result = await getReflectPostById(99);

    expect(result).toBeNull();
  });

  it("Test 6 — returns null on fetch error (e.g. 404)", async () => {
    mockFetch.mockRejectedValue(
      new Error("QF reflect 404: /quran-reflect/v1/posts/999")
    );

    const result = await getReflectPostById(999);

    expect(result).toBeNull();
  });
});

describe("getAyahAnswerById", () => {
  it("returns null on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await getAyahAnswerById("q-nonexistent");

    expect(result).toBeNull();
  });

  it("returns null when no valid Published English answer exists", async () => {
    mockFetch.mockResolvedValue({
      id: "q-draft",
      body: "What does this mean?",
      type: "TAFSIR",
      answers: [
        {
          id: "a-draft",
          status: "Draft",
          language: "English",
          body: "...",
          answeredBy: "Scholar",
        },
      ],
    });

    const result = await getAyahAnswerById("q-draft");

    expect(result).toBeNull();
  });

  it("returns question and top answer for valid data, preferring TAFSIR", async () => {
    mockFetch.mockResolvedValue({
      id: "q1",
      body: "Why is this verse significant?",
      type: "TAFSIR",
      answers: [
        {
          id: "a1",
          status: "Published",
          language: "English",
          body: "<p>Explanation</p>",
          answeredBy: "Dr Scholar",
        },
      ],
    });

    const result = await getAyahAnswerById("q1");

    expect(result).not.toBeNull();
    expect(result!.question.id).toBe("q1");
    expect(result!.question.body).toBe("Why is this verse significant?");
    expect(result!.topAnswer.id).toBe("a1");
    expect(result!.topAnswer.status).toBe("Published");
    expect(result!.topAnswer.language).toBe("English");
  });
});
