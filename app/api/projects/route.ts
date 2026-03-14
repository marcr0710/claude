import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { Project } from "@/lib/types";

const PROJECTS_KEY = "projects";

export async function GET() {
  try {
    const projects = await kv.get<Project[]>(PROJECTS_KEY);
    return NextResponse.json(projects ?? []);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, status, jiraTickets, notes, assignee } = body;

    if (!name || !status) {
      return NextResponse.json(
        { error: "Project name and status are required" },
        { status: 400 }
      );
    }

    const existing = await kv.get<Project[]>(PROJECTS_KEY);
    const projects = existing ?? [];

    const newProject: Project = {
      id: uuidv4(),
      name,
      status,
      jiraTickets: jiraTickets ?? "",
      notes: notes ?? "",
      assignee: assignee ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    await kv.set(PROJECTS_KEY, projects);

    return NextResponse.json(newProject, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
