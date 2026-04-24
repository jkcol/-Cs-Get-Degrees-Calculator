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
    return { ...base, socketPath: `/cloudsql/${connName}` };
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
function getPool() {
  if (!pool) pool = mysql.createPool(createPoolConfig());
  return pool;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/courses', async (_req, res) => {
  try {
    const [rows] = await getPool().query(COURSES_SQL);
    const courses = (Array.isArray(rows) ? rows : []).map(mapCourseCatalogRow);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed', detail: String(err.message) });
  }
});

app.get('/api/courses/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.json([]);
  try {
    const like = `%${q}%`;
    const [rows] = await getPool().query(
      `SELECT CourseID, CourseName FROM Courses
       WHERE CourseName LIKE ? OR CourseID LIKE ?
       ORDER BY CourseID
       LIMIT 50`,
      [like, like]
    );
    res.json((Array.isArray(rows) ? rows : []).map(mapCourseCatalogRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed', detail: String(err.message) });
  }
});

app.post('/api/courses', async (req, res) => {
  const { courseId, courseName } = req.body ?? {};
  if (!courseId || !courseName) {
    return res.status(400).json({ error: 'courseId and courseName are required' });
  }
  try {
    await getPool().query(
      `INSERT INTO Courses (CourseID, CourseName) VALUES (?, ?)`,
      [String(courseId).trim().toUpperCase(), String(courseName).trim()]
    );
    res.status(201).json({ ok: true, courseId });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A course with that ID already exists' });
    }
    res.status(500).json({ error: 'Insert failed', detail: String(err.message) });
  }
});

app.get('/api/courses/:courseId', async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const [rows] = await getPool().query(
      `SELECT CourseID, CourseName FROM Courses WHERE CourseID = ? LIMIT 1`,
      [courseId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(mapCourseCatalogRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed', detail: String(err.message) });
  }
});

app.put('/api/courses/:courseId', async (req, res) => {
  const courseId = req.params.courseId;
  const { courseName } = req.body ?? {};
  if (!courseName) {
    return res.status(400).json({ error: 'courseName is required' });
  }
  try {
    const [result] = await getPool().query(
      `UPDATE Courses SET CourseName = ? WHERE CourseID = ?`,
      [String(courseName).trim(), courseId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ ok: true, courseId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed', detail: String(err.message) });
  }
});

app.delete('/api/courses/:courseId', async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const [result] = await getPool().query(
      `DELETE FROM Courses WHERE CourseID = ?`,
      [courseId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ ok: true, courseId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed', detail: String(err.message) });
  }
});

app.get('/api/courses/:courseId/sections', async (req, res) => {
  const courseId = req.params.courseId;
  if (!courseId || !/^[A-Za-z0-9&]+$/.test(courseId)) {
    return res.status(400).json({ error: 'Invalid CourseID' });
  }
  try {
    const [rows] = await getPool().query(SECTIONS_FOR_COURSE_SQL, [courseId]);
    const sections = (Array.isArray(rows) ? rows : []).map(mapSectionRow);
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed', detail: String(err.message) });
  }
});

app.listen(PORT, () => {
  console.log(`team110-api listening on http://127.0.0.1:${PORT}`);
});
