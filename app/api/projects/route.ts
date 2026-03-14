import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sql, ensureTable } from "@/lib/db";
import type { Project } from "@/lib/types";

function dbRowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    status: row.status as Project["status"],
    jiraTickets: row.jira_tickets as string,
    notes: row.notes as string,
    assignee: row.assignee as string,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export async function GET() {
  try {
    await ensureTable();
    const { rows } = await sql`
      SELECT * FROM projects ORDER BY updated_at DESC
    `;
    return NextResponse.json(rows.map(dbRowToProject));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isConfig = msg.includes("POSTGRES") || msg.includes("connect");
    return NextResponse.json(
      {
        error: isConfig
          ? "Database not configured. Please link a Vercel Postgres store to this project in the Vercel dashboard (Storage → Create → Postgres), then redeploy."
          : "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { name, status, jiraTickets = "", notes = "", assignee = "" } = body;

    if (!name || !status) {
      return NextResponse.json(
        { error: "Project name and status are required" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const { rows } = await sql`
      INSERT INTO projects (id, name, status, jira_tickets, notes, assignee)
      VALUES (${id}, ${name}, ${status}, ${jiraTickets}, ${notes}, ${assignee})
      RETURNING *
    `;

    return NextResponse.json(dbRowToProject(rows[0]), { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isConfig = msg.includes("POSTGRES") || msg.includes("connect");
    return NextResponse.json(
      {
        error: isConfig
          ? "Database not configured. Please link a Vercel Postgres store in the Vercel dashboard."
          : "Failed to create project",
      },
      { status: 500 }
    );
  }
}
