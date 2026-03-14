"use client";

import { useState } from "react";
import { STATUS_COLORS, type Project } from "@/lib/types";
import ProjectForm from "./ProjectForm";

interface ProjectCardProps {
  project: Project;
  onUpdate: (id: string, data: Partial<Project>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectCard({
  project,
  onUpdate,
  onDelete,
}: ProjectCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleUpdate(data: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    await onUpdate(project.id, data);
    setEditing(false);
  }

  async function handleDelete() {
    await onDelete(project.id);
  }

  if (editing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Edit Project
        </h3>
        <ProjectForm
          initial={project}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {project.name}
          </h3>
          {project.assignee && (
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-medium">Assignee:</span> {project.assignee}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            STATUS_COLORS[project.status]
          }`}
        >
          {project.status}
        </span>
      </div>

      {project.jiraTickets && (
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Jira Tickets
          </span>
          <p className="text-sm text-gray-800 font-mono mt-0.5">
            {project.jiraTickets}
          </p>
        </div>
      )}

      {project.notes && (
        <div className="mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Notes
          </span>
          <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap break-words">
            {project.notes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Updated {formatDate(project.updatedAt)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
          {confirmDelete ? (
            <span className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-gray-400 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
