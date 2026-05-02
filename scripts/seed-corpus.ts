/* eslint-disable @typescript-eslint/no-require-imports */
import { createClient } from "@supabase/supabase-js";
import { getFullTafsir } from "../lib/qf/content";

const corpusData = require("../data/corpus-shortlist.json");

const EXTRACT_MAX = 190; // leave headroom under the 200-char DB CHECK

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFromTafsir(fullText: string): string {
  const plain = stripHtml(fullText);
  if (!plain) return "";

  // Take text up to the first sentence boundary within EXTRACT_MAX chars
  const truncated = plain.slice(0, EXTRACT_MAX);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastBang = truncated.lastIndexOf("!");

  const cutAt = Math.max(lastPeriod, lastBang);
  if (cutAt > 80) return truncated.slice(0, cutAt + 1).trim();

  // No clean sentence boundary — hard truncate with ellipsis
  return plain.slice(0, EXTRACT_MAX - 1).trim() + "…";
}

async function seedCorpus() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(`Seeding ${corpusData.length} corpus entries...`);

  for (const entry of corpusData) {
    let tafsirExtract: string = entry.tafsir_extract ?? "";

    // Auto-fetch tafsir extract from QF if not provided in the shortlist
    if (!tafsirExtract) {
      process.stdout.write(`  Fetching tafsir for ${entry.verse_key}... `);
      const tafsir = await getFullTafsir(entry.verse_key);
      tafsirExtract = extractFromTafsir(tafsir.text);
      if (!tafsirExtract) {
        console.error(
          `\n  ✗ Could not extract tafsir for ${entry.verse_key} — skipping`
        );
        continue;
      }
      console.log(`got ${tafsirExtract.length} chars`);
    }

    const row = {
      verse_key: entry.verse_key,
      theme: entry.theme,
      tafsir_extract: tafsirExtract,
      action_prompt_1: entry.action_prompt_1,
      action_prompt_2: entry.action_prompt_2,
      human_reviewed_at: entry.human_reviewed_at ?? new Date().toISOString(),
    };

    const { error } = await supabase
      .from("corpus_entries")
      .upsert(row, { onConflict: "verse_key" });

    if (error) {
      console.error(`✗ Failed: ${entry.verse_key}`, error.message);
      process.exit(1);
    }

    console.log(`✓ ${entry.verse_key} (${entry.theme})`);
  }

  console.log("\nDone.");
}

seedCorpus().catch((e) => {
  console.error(e);
  process.exit(1);
});
