import { NextResponse } from "next/server";
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTable();
    const { id } = params;
    const body = await request.json();
    const { name, status, jiraTickets, notes, assignee } = body;

    const { rows } = await sql`
      UPDATE projects
      SET
        name         = COALESCE(${name}, name),
        status       = COALESCE(${status}, status),
        jira_tickets = COALESCE(${jiraTickets}, jira_tickets),
        notes        = COALESCE(${notes}, notes),
        assignee     = COALESCE(${assignee}, assignee),
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(dbRowToProject(rows[0]));
  } catch {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTable();
    const { id } = params;

    const { rowCount } = await sql`
      DELETE FROM projects WHERE id = ${id}
    `;

    if (rowCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
