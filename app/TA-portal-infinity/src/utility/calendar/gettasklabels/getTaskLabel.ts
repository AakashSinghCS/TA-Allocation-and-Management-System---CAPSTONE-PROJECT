import type { AllocationType } from "../../../interfaces/allocation/Allocation";

export function getTaskLabel(task: AllocationType): string {
  switch (task) {
    case "GRADING":
      return "grading";
    case "LAB_PREP":
      return "lab‑prep";
    case "LAB":
      return "section";
    default:
      return task;
  }
}