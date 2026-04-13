import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { mapCourseCatalogRow, mapSectionRow } from './mapCourseRow.mjs';

const PORT = Number(process.env.PORT ?? 8080);
const DB_NAME = process.env.DB_NAME ?? 'team110_db';

const COURSES_SQL =
  process.env.COURSES_SQL?.replace(/\\n/g, '\n') ??
  `SELECT CourseID, CourseName FROM Courses ORDER BY CourseID`;

const SECTIONS_FOR_COURSE_SQL = `
SELECT
  s.CRN,
  s.CourseID,
  c.CourseName,
  s.CreditHours,
  s.AvgGPA,
  s.IsExcellent,
  s.YearTerm,
  s.StartTime,
  s.EndTime,
  s.DaysOfWeek,
  s.TypeCode,
  i.InstructorName
FROM Sections s
JOIN Courses c ON s.CourseID = c.CourseID
JOIN Instructors i ON s.InstructorID = i.InstructorID
WHERE s.CourseID = ?
ORDER BY s.YearTerm DESC, s.AvgGPA DESC, s.CRN ASC
`.trim();

function createPoolConfig() {
  const connName = process.env.CLOUD_SQL_CONNECTION_NAME;
  const base = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    enableCleartextPlugin: true,
  };
  if (connName) {
    return {
      ...base,
      socketPath: `/cloudsql/${connName}`,
    };
  }
  return {
    ...base,
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
  };
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

let pool;

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/courses', async (_req, res) => {
  try {
    if (!pool) pool = mysql.createPool(createPoolConfig());
    const [rows] = await pool.query(COURSES_SQL);
    const courses = (Array.isArray(rows) ? rows : []).map(mapCourseCatalogRow);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Database query failed',
      detail: String(err.message),
    });
  }
});

app.get('/api/courses/:courseId/sections', async (req, res) => {
  const courseId = req.params.courseId;
  if (!courseId || !/^[A-Za-z0-9&]+$/.test(courseId)) {
    return res.status(400).json({ error: 'Invalid CourseID' });
  }
  try {
    if (!pool) pool = mysql.createPool(createPoolConfig());
    const [rows] = await pool.query(SECTIONS_FOR_COURSE_SQL, [courseId]);
    const sections = (Array.isArray(rows) ? rows : []).map(mapSectionRow);
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Database query failed',
      detail: String(err.message),
    });
  }
});

app.listen(PORT, () => {
  console.log(`team110-api listening on http://127.0.0.1:${PORT}`);
});
