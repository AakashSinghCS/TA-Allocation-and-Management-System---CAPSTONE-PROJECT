import type { AllocationType } from "../../../interfaces/allocation/Allocation";

export function getTaskLabel(task: AllocationType): string {
  switch (task) {
    case "GRADING":
      return "Grading";
    case "LAB_PREP":
      return "Lab-Prep";
    case "LAB":
      return "Lab TA";
    default:
      return task;
  }
}