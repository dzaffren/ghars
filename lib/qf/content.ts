import { qfContentFetch } from "./client";

export interface VersePackage {
  verse_key: string;
  surah_name: string;
  ayah_number: number;
  arabic: string;
}

export interface TranslationResult {
  text: string;
}

export interface AudioResult {
  audio_url: string;
}

export interface TafsirResult {
  verse_key: string;
  text: string;
  source_name: string;
}

// Get Uthmani Arabic text for a verse key (e.g. "96:1")
export async function getVerseByKey(verseKey: string): Promise<VersePackage> {
  // QF API: GET /verses/by_key/{verse_key}?fields=...
  const data = await qfContentFetch(
    `/verses/by_key/${verseKey}?fields=text_uthmani,verse_key,verse_number`
  );
  const v = data.verse ?? data;
  const [chapter] = verseKey.split(":");
  return {
    verse_key: verseKey,
    surah_name: getSurahName(parseInt(chapter)),
    ayah_number: v.verse_number ?? parseInt(verseKey.split(":")[1]),
    arabic: v.text_uthmani ?? "",
  };
}

// Get translation text for a verse key
export async function getTranslation(
  verseKey: string,
  translationId = "131"
): Promise<TranslationResult> {
  // QF API: GET /verses/by_key/{key}?translations={id}&fields=text_uthmani
  try {
    const data = await qfContentFetch(
      `/verses/by_key/${verseKey}?translations=${translationId}&fields=text_uthmani`
    );
    const translations = data.verse?.translations ?? data.translations ?? [];
    const t = translations[0];
    return { text: t?.text ?? "" };
  } catch {
    return { text: "" };
  }
}

// Get audio URL for a verse
export async function getAudioUrl(
  verseKey: string,
  reciterId = "7"
): Promise<AudioResult> {
  // QF API: GET /recitations/{recitation_id}/by_ayah/{verse_key}
  try {
    const data = await qfContentFetch(
      `/recitations/${reciterId}/by_ayah/${verseKey}`
    );
    const url = data.audio_files?.[0]?.url ?? data.url ?? "";
    const fullUrl = url.startsWith("http")
      ? url
      : `https://audio.qurancdn.com/${url}`;
    return { audio_url: fullUrl };
  } catch {
    return { audio_url: "" };
  }
}

// Get full tafsir text for a verse (for the expandable drawer)
export async function getFullTafsir(
  verseKey: string,
  tafsirId = "169"
): Promise<TafsirResult> {
  // QF API: GET /quran/tafsirs/{tafsir_id}?verse_key={key} — tafsir_id 169 = Ibn Kathir English
  try {
    const data = await qfContentFetch(
      `/quran/tafsirs/${tafsirId}?verse_key=${verseKey}`
    );
    const t = data.tafsirs?.[0] ?? data.tafsir;
    return {
      verse_key: verseKey,
      text: t?.text ?? "",
      source_name: t?.resource_name ?? "Ibn Kathir",
    };
  } catch {
    return { verse_key: verseKey, text: "", source_name: "Ibn Kathir" };
  }
}

// Simple surah name lookup (first 10 surahs sufficient for corpus starter)
function getSurahName(chapter: number): string {
  const names: Record<number, string> = {
    1: "Al-Fatihah",
    2: "Al-Baqarah",
    3: "Al-Imran",
    4: "An-Nisa",
    5: "Al-Maidah",
    6: "Al-Anam",
    7: "Al-Araf",
    8: "Al-Anfal",
    9: "At-Tawbah",
    10: "Yunus",
    13: "Ar-Rad",
    17: "Al-Isra",
    18: "Al-Kahf",
    24: "An-Nur",
    25: "Al-Furqan",
    31: "Luqman",
    36: "Ya-Sin",
    49: "Al-Hujurat",
    55: "Ar-Rahman",
    57: "Al-Hadid",
    59: "Al-Hashr",
    62: "Al-Jumuah",
    67: "Al-Mulk",
    73: "Al-Muzzammil",
    74: "Al-Muddathir",
    75: "Al-Qiyamah",
    76: "Al-Insan",
    78: "An-Naba",
    87: "Al-Ala",
    89: "Al-Fajr",
    90: "Al-Balad",
    91: "Ash-Shams",
    93: "Ad-Duha",
    94: "Ash-Sharh",
    95: "At-Tin",
    96: "Al-Alaq",
    97: "Al-Qadr",
    98: "Al-Bayyinah",
    99: "Az-Zalzalah",
    100: "Al-Adiyat",
    101: "Al-Qariah",
    102: "At-Takathur",
    103: "Al-Asr",
    104: "Al-Humazah",
    105: "Al-Fil",
    106: "Quraysh",
    107: "Al-Maun",
    108: "Al-Kawthar",
    109: "Al-Kafirun",
    110: "An-Nasr",
    111: "Al-Masad",
    112: "Al-Ikhlas",
    113: "Al-Falaq",
    114: "An-Nas",
  };
  return names[chapter] ?? `Surah ${chapter}`;
}
