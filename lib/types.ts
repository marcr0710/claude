export type ProjectStatus =
  | "Not Started"
  | "In Progress"
  | "Blocked"
  | "On Hold"
  | "Testing"
  | "Completed";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  jiraTickets: string;
  notes: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_OPTIONS: ProjectStatus[] = [
  "Not Started",
  "In Progress",
  "Blocked",
  "On Hold",
  "Testing",
  "Completed",
];

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  "Not Started": "bg-gray-200 text-gray-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Blocked: "bg-red-100 text-red-800",
  "On Hold": "bg-yellow-100 text-yellow-800",
  Testing: "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
};
