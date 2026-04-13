/** Row from GET /api/courses (Courses table only) — used in search. */
export interface CourseCatalogItem {
  id: string;
  code: string;
  name: string;
}

/**
 * A chosen section in the planner (GET /api/courses/:courseId/sections).
 * `id` is unique per section: `${courseId}-${crn}`.
 */
export interface Course {
  id: string;
  courseId: string;
  code: string;
  name: string;
  crn: number;
  credits: number;
  avgGpa: number | null;
  instructor: string;
  isExcellent: boolean;
  yearTerm: string | null;
  /** Short schedule line from DaysOfWeek / times / TypeCode */
  scheduleLabel: string | null;
}
