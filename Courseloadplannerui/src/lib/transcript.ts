/** Parse a single cell as GPA (0–4) or letter grade. */
export function parseGradeOrGpa(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isNaN(n) && n >= 0 && n <= 4.5) return Math.min(4, n);

  const map: Record<string, number> = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.67,
    'B+': 3.33,
    B: 3.0,
    'B-': 2.67,
    'C+': 2.33,
    C: 2.0,
    'C-': 1.67,
    'D+': 1.33,
    D: 1.0,
    'D-': 0.67,
    F: 0,
    S: 4.0,
    P: 4.0,
    CR: 4.0,
  };
  const key = s.toUpperCase().replace(/\s+/g, '');
  if (map[key] !== undefined) return map[key];
  const loose = s.toUpperCase().match(/^([ABCDF][+-]?)$/);
  if (loose && map[loose[1]] !== undefined) return map[loose[1]];
  return null;
}

export interface TranscriptCourseRow {
  semester: string;
  courseCode: string;
  credits: number;
  gradeGpa: number;
}

/** Expected CSV: Semester,Course,Credits,Grade (grade can be 3.5 or B+) */
export function parseTranscriptCsv(text: string): TranscriptCourseRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const rows: TranscriptCourseRow[] = [];
  let start = 0;
  const first = lines[0].toLowerCase();
  if (first.includes('semester') && first.includes('course')) {
    start = 1;
  }

  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length < 4) continue;
    const [semester, courseCode, creditsRaw, gradeRaw] = parts;
    const credits = Number(creditsRaw);
    const gradeGpa = parseGradeOrGpa(gradeRaw);
    if (Number.isNaN(credits) || credits <= 0 || gradeGpa == null) continue;
    rows.push({
      semester: semester || 'Unknown',
      courseCode: courseCode || '—',
      credits,
      gradeGpa,
    });
  }
  return rows;
}

export interface SemesterBlock {
  semester: string;
  rows: TranscriptCourseRow[];
  semesterGpa: number;
  semesterCredits: number;
  cumulativeGpa: number;
  cumulativeCredits: number;
}

export function groupBySemester(rows: TranscriptCourseRow[]): SemesterBlock[] {
  if (rows.length === 0) return [];
  const order = [...new Set(rows.map((r) => r.semester))];
  const semesterOrder = (a: string, b: string) => {
    const parse = (s: string) => {
      const m = s.match(/(Fall|Spring|Summer|Winter)\s*(\d{4})/i);
      if (!m) return 0;
      const y = parseInt(m[2], 10);
      const term = /Fall/i.test(m[1]) ? 3 : /Summer/i.test(m[1]) ? 2 : /Spring/i.test(m[1]) ? 1 : 0;
      return y * 10 + term;
    };
    return parse(a) - parse(b);
  };
  order.sort(semesterOrder);

  let cumPoints = 0;
  let cumCredits = 0;

  return order.map((semester) => {
    const semRows = rows.filter((r) => r.semester === semester);
    let sp = 0;
    let sc = 0;
    for (const r of semRows) {
      sp += r.gradeGpa * r.credits;
      sc += r.credits;
    }
    const semesterGpa = sc > 0 ? sp / sc : 0;
    cumPoints += sp;
    cumCredits += sc;
    const cumulativeGpa = cumCredits > 0 ? cumPoints / cumCredits : 0;

    return {
      semester,
      rows: semRows,
      semesterGpa,
      semesterCredits: sc,
      cumulativeGpa,
      cumulativeCredits: cumCredits,
    };
  });
}
