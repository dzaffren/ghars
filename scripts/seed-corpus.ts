/* eslint-disable @typescript-eslint/no-require-imports */
import { createClient } from "@supabase/supabase-js";

const corpusData = require("../data/corpus-shortlist.json");

async function seedCorpus() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  console.log(`Seeding ${corpusData.length} corpus entries...`);
  for (const entry of corpusData) {
    const { error } = await supabase
      .from("corpus_entries")
      .upsert(entry, { onConflict: "verse_key" });
    if (error) {
      console.error(`Failed: ${entry.verse_key}`, error.message);
      process.exit(1);
    }
    console.log(`✓ ${entry.verse_key} (${entry.theme})`);
  }
  console.log("Done.");
}

seedCorpus().catch((e) => {
  console.error(e);
  process.exit(1);
});
