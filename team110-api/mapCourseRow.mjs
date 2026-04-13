export function formatCourseCode(courseId) {
  const s = String(courseId ?? '').trim();
  if (!s) return '';
  const m = s.match(/^([A-Za-z&]+)(\d[\w]*)$/);
  if (m) return `${m[1].toUpperCase()} ${m[2]}`;
  return s.toUpperCase();
}

export function parseIsExcellent(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  if (v == null) return false;
  const t = String(v).trim().toLowerCase();
  return t === '1' || t === 'true' || t === 'yes' || t === 'y' || t === 'excellent';
}

export function mapCourseCatalogRow(row) {
  const courseId = row.CourseID;
  const nameRaw = row.CourseName;
  const name = nameRaw != null ? String(nameRaw).trim() : '';
  return {
    id: String(courseId ?? ''),
    code: formatCourseCode(courseId) || String(courseId ?? ''),
    name,
  };
}

function formatTime(t) {
  if (t == null || t === '') return '';
  const s = String(t);
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return s;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ampm}`;
}

function buildScheduleLabel(row) {
  const days = row.DaysOfWeek;
  const start = row.StartTime;
  const end = row.EndTime;
  const typeCode = row.TypeCode;
  const bits = [];
  if (days != null && String(days).trim() !== '') bits.push(String(days).trim());
  const st = formatTime(start);
  const en = formatTime(end);
  if (st && en) bits.push(`${st}–${en}`);
  if (typeCode != null && String(typeCode).trim() !== '') bits.push(String(typeCode).trim());
  return bits.length ? bits.join(' · ') : null;
}

export function mapSectionRow(row) {
  const courseId = row.CourseID;
  const crn = Number(row.CRN);
  const id = `${courseId}-${crn}`;

  const courseName = row.CourseName;
  const name = courseName != null ? String(courseName).trim() : '';

  const ch = row.CreditHours;
  const credits = ch != null && ch !== '' ? Number(ch) : NaN;

  const ag = row.AvgGPA;
  const avgGpa = ag != null && ag !== '' ? Number(ag) : null;
  const avgGpaOut = avgGpa != null && !Number.isNaN(avgGpa) ? avgGpa : null;

  const instructorRaw = row.InstructorName;
  const instructor =
    instructorRaw != null && String(instructorRaw).trim() !== '' ? String(instructorRaw).trim() : '';

  const isExcellent = parseIsExcellent(row.IsExcellent);

  const yt = row.YearTerm;
  const yearTerm = yt != null && String(yt).trim() !== '' ? String(yt).trim() : null;

  return {
    id,
    courseId: String(courseId ?? ''),
    code: formatCourseCode(courseId) || String(courseId ?? ''),
    name,
    crn: Number.isFinite(crn) ? crn : 0,
    credits: Number.isFinite(credits) ? credits : 0,
    avgGpa: avgGpaOut,
    instructor,
    isExcellent,
    yearTerm,
    scheduleLabel: buildScheduleLabel(row),
  };
}
