// types/project.ts

export type ProjectStatus =
  | "All"
  | "Pending"
  | "Active"
  | "Completed"
  | "Cancelled";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  location: string;
  budget: number;
  progress: number;
}