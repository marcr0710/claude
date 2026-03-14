import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import type { Project } from "@/lib/types";

const PROJECTS_KEY = "projects";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, status, jiraTickets, notes, assignee } = body;
    const { id } = params;

    const existing = await kv.get<Project[]>(PROJECTS_KEY);
    const projects = existing ?? [];

    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects[index] = {
      ...projects[index],
      name: name ?? projects[index].name,
      status: status ?? projects[index].status,
      jiraTickets: jiraTickets ?? projects[index].jiraTickets,
      notes: notes ?? projects[index].notes,
      assignee: assignee ?? projects[index].assignee,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(PROJECTS_KEY, projects);
    return NextResponse.json(projects[index]);
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
    const { id } = params;

    const existing = await kv.get<Project[]>(PROJECTS_KEY);
    const projects = existing ?? [];

    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await kv.set(PROJECTS_KEY, filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
