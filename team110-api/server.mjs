import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { mapCourseRow } from './mapCourseRow.mjs';

const PORT = Number(process.env.PORT ?? 8080);
const DB_NAME = process.env.DB_NAME ?? 'team110_db';

/** Override with your real JOIN if needed (run DESCRIBE Courses; in mysql). */
const COURSES_SQL =
  process.env.COURSES_SQL?.replace(/\\n/g, '\n') ??
  `SELECT * FROM Courses LIMIT 500`;

function createPoolConfig() {
  const connName = process.env.CLOUD_SQL_CONNECTION_NAME;
  const base = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    // Cloud SQL / some MySQL auth plugins request mysql_clear_password; safe via Auth Proxy or TLS.
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
    const courses = (Array.isArray(rows) ? rows : []).map(mapCourseRow);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Database query failed',
      hint: 'Run DESCRIBE Courses; and set COURSES_SQL or fix column names in mapCourseRow.mjs',
      detail: String(err.message),
    });
  }
});

app.listen(PORT, () => {
  console.log(`team110-api listening on http://127.0.0.1:${PORT}`);
});
