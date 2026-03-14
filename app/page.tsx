"use client";

import { useCallback, useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import ProjectForm from "@/components/ProjectForm";
import { STATUS_OPTIONS, type Project, type ProjectStatus } from "@/lib/types";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(data);
    } catch {
      setError("Could not load projects. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    // Auto-refresh every 60 seconds so team sees updates without reloading
    const interval = setInterval(fetchProjects, 60_000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  async function addProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add");
    const created: Project = await res.json();
    setProjects((prev) => [...prev, created]);
    setShowForm(false);
  }

  async function updateProject(id: string, data: Partial<Project>) {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update");
    const updated: Project = await res.json();
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function deleteProject(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = projects
    .filter((p) => filterStatus === "All" || p.status === filterStatus)
    .filter(
      (p) =>
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.assignee.toLowerCase().includes(search.toLowerCase()) ||
        p.jiraTickets.toLowerCase().includes(search.toLowerCase())
    )
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const counts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = projects.filter((p) => p.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Warehouse Project Tracker
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {projects.length} project{projects.length !== 1 ? "s" : ""} total
              &mdash; auto-refreshes every 60 seconds
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="self-start sm:self-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold px-5 py-2 rounded-lg text-sm transition-colors shadow"
          >
            {showForm ? "Cancel" : "+ Add Project"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Add project form */}
        {showForm && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              New Project
            </h2>
            <ProjectForm onSubmit={addProject} onCancel={() => setShowForm(false)} />
          </section>
        )}

        {/* Status summary chips */}
        <section className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("All")}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              filterStatus === "All"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            All ({projects.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                filterStatus === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {s} ({counts[s] ?? 0})
            </button>
          ))}
        </section>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project name, assignee, or Jira ticket..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />

        {/* Project grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">
              {projects.length === 0
                ? "No projects yet. Add the first one!"
                : "No projects match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={updateProject}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
