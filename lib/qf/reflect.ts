import { qfReflectFetch } from "./client";

export interface ReflectPost {
  id: number;
  body: string; // raw HTML — callers must sanitize
  verified: boolean;
  featuredAt: string | null;
  moderationStatus: string;
  languageName: string;
  likesCount: number;
  commentsCount: number;
}

export interface AyahAnswer {
  id: string;
  type: "TAFSIR" | "CLARIFICATION";
  body: string; // raw HTML — callers must sanitize
  status: string;
  language: string;
  answeredBy: string;
}

export interface AyahQuestion {
  id: string;
  body: string; // plain text question
  answers: AyahAnswer[];
}

// Guard: a reflect post must be verified, English, APPROVED, and not draft/hidden/removed
function isValidReflectPost(p: Record<string, unknown>): boolean {
  return (
    p.verified === true &&
    (p.languageName as string)?.toLowerCase() === "english" &&
    p.moderationStatus === "APPROVED" &&
    p.draft !== true &&
    p.hidden !== true &&
    p.removed !== true
  );
}

// Map a raw API post object to the typed ReflectPost
function mapPost(p: Record<string, unknown>): ReflectPost {
  return {
    id: p.id as number,
    body: (p.body as string) ?? "",
    verified: p.verified as boolean,
    featuredAt: (p.featuredAt as string | null) ?? null,
    moderationStatus: p.moderationStatus as string,
    languageName: p.languageName as string,
    likesCount: (p.likesCount as number) ?? 0,
    commentsCount: (p.commentsCount as number) ?? 0,
  };
}

// Map a raw API answer object to the typed AyahAnswer
function mapAnswer(
  a: Record<string, unknown>,
  questionType: string
): AyahAnswer {
  return {
    id: a.id as string,
    type: (questionType as "TAFSIR" | "CLARIFICATION") ?? "CLARIFICATION",
    body: (a.body as string) ?? "",
    status: a.status as string,
    language: a.language as string,
    answeredBy: (a.answeredBy as string) ?? "",
  };
}

// Guard: an answer must be Published and in English
function isValidAnswer(a: Record<string, unknown>): boolean {
  return (
    a.status === "Published" &&
    (a.language === "en" || a.language === "English")
  );
}

/**
 * Fetch community reflection posts for a specific ayah.
 * Filters to verified, English, APPROVED, non-draft/hidden/removed posts.
 * Returns { total: 0, posts: [] } on any error — never throws.
 */
export async function listReflectPostsForAyah(
  verseKey: string,
  opts?: { limit?: number }
): Promise<{ total: number; posts: ReflectPost[] }> {
  const limit = opts?.limit ?? 5;
  const [chapterId, ayahStr] = verseKey.split(":");
  const ayah = parseInt(ayahStr, 10);

  const path =
    `/quran-reflect/v1/posts/feed` +
    `?filter[references][0][chapterId]=${chapterId}` +
    `&filter[references][0][from]=${ayah}` +
    `&filter[references][0][to]=${ayah}` +
    `&filter[verifiedOnly]=true` +
    `&filter[languages]=en` +
    `&sort=featured` +
    `&limit=${limit}`;

  try {
    const data = await qfReflectFetch(path);
    const raw: Record<string, unknown>[] = Array.isArray(data.data)
      ? data.data
      : [];
    const posts = raw
      .filter((p) => isValidReflectPost(p))
      .map((p) => mapPost(p));
    return { total: posts.length, posts };
  } catch {
    return { total: 0, posts: [] };
  }
}

/**
 * Fetch scholar answers (Q&A) for a specific ayah.
 * Filters each question's answers to Published English only.
 * Questions with no valid answers are excluded.
 * TAFSIR questions are sorted before CLARIFICATION.
 * Returns { total: 0, questions: [] } on any error — never throws.
 */
export async function listAyahAnswers(
  verseKey: string,
  opts?: { pageSize?: number }
): Promise<{ total: number; questions: AyahQuestion[] }> {
  const pageSize = opts?.pageSize ?? 5;
  const path = `/content/api/v4/ayah-answers?ayah_key=${verseKey}&status=Published&language=en&pageSize=${pageSize}`;

  try {
    const data = await qfReflectFetch(path);
    const rawQuestions: Record<string, unknown>[] = Array.isArray(
      data.questions
    )
      ? data.questions
      : [];

    const questions: AyahQuestion[] = rawQuestions
      .map((q) => {
        const rawAnswers: Record<string, unknown>[] = Array.isArray(q.answers)
          ? (q.answers as Record<string, unknown>[])
          : [];
        const questionType = (q.type as string) ?? "CLARIFICATION";
        const validAnswers = rawAnswers
          .filter((a) => isValidAnswer(a))
          .map((a) => mapAnswer(a, questionType));
        return {
          id: q.id as string,
          body: (q.body as string) ?? "",
          answers: validAnswers,
        };
      })
      .filter((q) => q.answers.length > 0);

    // Sort: TAFSIR questions before CLARIFICATION
    questions.sort((a, b) => {
      const aType = a.answers[0]?.type ?? "CLARIFICATION";
      const bType = b.answers[0]?.type ?? "CLARIFICATION";
      if (aType === "TAFSIR" && bType !== "TAFSIR") return -1;
      if (aType !== "TAFSIR" && bType === "TAFSIR") return 1;
      return 0;
    });

    return { total: questions.length, questions };
  } catch {
    return { total: 0, questions: [] };
  }
}

/**
 * Fetch a single reflect post by its numeric id.
 * Returns null if the post fails the verified/English/APPROVED guard, or on any error.
 */
export async function getReflectPostById(
  id: number
): Promise<ReflectPost | null> {
  try {
    const data = await qfReflectFetch(`/quran-reflect/v1/posts/${id}`);
    if (!isValidReflectPost(data as Record<string, unknown>)) {
      return null;
    }
    return mapPost(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Fetch a single ayah answer question by its id.
 * Returns the question + its top Published English answer (TAFSIR preferred), or null on error.
 */
export async function getAyahAnswerById(
  questionId: string
): Promise<{ question: AyahQuestion; topAnswer: AyahAnswer } | null> {
  try {
    const data = await qfReflectFetch(
      `/content/api/v4/ayah-answers/${questionId}`
    );
    const rawAnswers: Record<string, unknown>[] = Array.isArray(data.answers)
      ? (data.answers as Record<string, unknown>[])
      : [];
    const questionType = (data.type as string) ?? "CLARIFICATION";

    const validAnswers = rawAnswers
      .filter((a) => isValidAnswer(a))
      .map((a) => mapAnswer(a, questionType));

    if (validAnswers.length === 0) {
      return null;
    }

    // Prefer TAFSIR over CLARIFICATION for top answer
    const topAnswer =
      validAnswers.find((a) => a.type === "TAFSIR") ?? validAnswers[0];

    const question: AyahQuestion = {
      id: data.id as string,
      body: (data.body as string) ?? "",
      answers: validAnswers,
    };

    return { question, topAnswer };
  } catch {
    return null;
  }
}
