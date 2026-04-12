/**
 * Maps a raw MySQL row to the Course Load Planner UI shape.
 * Works with many common column names; adjust if your DESCRIBE differs.
 */
export function mapCourseRow(row) {
  const pick = (...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return row[k];
    }
    return undefined;
  };

  const subject = pick('subject', 'course_subject', 'dept', 'department');
  const num = pick('number', 'course_num', 'course_number', 'num');
  const code =
    pick('code', 'course_code') ??
    (subject && num != null ? `${subject} ${num}`.trim() : undefined);

  const id = String(
    pick('id', 'course_id', 'CourseID', 'courseId') ?? code ?? Math.random().toString(36).slice(2)
  );

  const name = pick('name', 'title', 'course_title', 'course_name', 'courseTitle') ?? 'Unknown course';
  const credits = Number(pick('credits', 'credit_hours', 'hours', 'creditHours') ?? 3);
  const avgGpa = Number(pick('avgGpa', 'avg_gpa', 'average_gpa', 'gpa') ?? 3.0);
  const instructor = pick('instructor', 'instructor_name', 'professor', 'primary_instructor') ?? 'TBA';
  const ex = pick('isExcellent', 'is_excellent', 'excellent', 'excellent_instructor');
  const isExcellent = ex === true || ex === 1 || ex === '1';

  return { id, code: code ?? id, name, credits, avgGpa, instructor, isExcellent };
}
