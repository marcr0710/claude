import { sql } from "@vercel/postgres";

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT        PRIMARY KEY,
      name        TEXT        NOT NULL,
      status      TEXT        NOT NULL,
      jira_tickets TEXT       NOT NULL DEFAULT '',
      notes       TEXT        NOT NULL DEFAULT '',
      assignee    TEXT        NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export { sql };
