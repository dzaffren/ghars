import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const MIGRATION_PATH = join(
  process.cwd(),
  "supabase/migrations/0011_daily_intentions.sql"
);

describe("0011_daily_intentions.sql", () => {
  let sql: string;

  it("migration file exists and is readable", () => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
    expect(sql.length).toBeGreaterThan(0);
  });

  it("contains create table daily_intentions", () => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
    expect(sql).toContain("create table daily_intentions");
  });

  it("contains unique (user_id, local_date) constraint", () => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
    expect(sql).toContain("unique (user_id, local_date)");
  });

  it("contains both check constraints", () => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
    const checkCount = (sql.match(/check \(/g) ?? []).length;
    expect(checkCount).toBeGreaterThanOrEqual(2);
  });

  it("contains alter table daily_missions add column intention_suggestion", () => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
    expect(sql).toContain(
      "alter table daily_missions add column intention_suggestion"
    );
  });

  it("contains three RLS policy creation statements", () => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
    const policyCount = (sql.match(/create policy/g) ?? []).length;
    expect(policyCount).toBe(3);
  });

  it("contains the index on (user_id, local_date desc)", () => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
    expect(sql).toContain("create index daily_intentions_user_date_idx");
  });
});
