// data/projects.ts

import { Project } from "../types/project";

export const projects: Project[] = [
  {
    id: "1",
    name: "Mucyo House",
    status: "Pending",
    location: "Kigali, Gasabo",
    budget: 0,
    progress: 3,
  },
  {
    id: "2",
    name: "Modern Villa",
    status: "Active",
    location: "Kicukiro",
    budget: 15000000,
    progress: 45,
  },
  {
    id: "3",
    name: "Office Building",
    status: "Completed",
    location: "Nyarugenge",
    budget: 50000000,
    progress: 100,
  },
];