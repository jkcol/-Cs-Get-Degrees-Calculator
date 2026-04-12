# team110-api

Small Express API that reads `team110_db` on Cloud SQL and exposes `GET /api/courses` for the Course Load Planner UI.

## 1. Create an app user (inside MySQL, not bash)

The error `-bash: CREATE: command not found` means you ran SQL in the **shell**. SQL only runs after `mysql>`.

```bash
gcloud sql connect db-sp26-team110 --user=root
```

Then at the `mysql>` prompt:

```sql
CREATE USER 'app_user'@'%' IDENTIFIED BY 'choose-a-strong-password';
GRANT SELECT ON team110_db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

(Or use **Cloud SQL → Users → Add user account** in the console: choose **Built-in authentication**, not Cloud IAM; username `app_user`, then put the same password in `team110-api/.env` as `DB_PASSWORD`.)

## 2. Local dev (your laptop)

1. Install [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/mysql/connect-auth-proxy).
2. Run proxy (example port 3307):

   ```bash
   cloud-sql-proxy root-matrix-441506-r9:us-central1:db-sp26-team110 --port 3307
   ```

3. Copy `.env.example` to `.env` and set `DB_USER`, `DB_PASSWORD`, `DB_PORT=3307`.

4. Install and start:

   ```bash
   cd team110-api
   npm install
   npm run dev
   ```

5. Open `http://127.0.0.1:8080/api/courses` — you should see JSON.

If columns don’t match the UI, run `DESCRIBE Courses;` in MySQL and either:

- Set `COURSES_SQL` in `.env` with aliases (`AS id`, `AS code`, …), or  
- Edit `mapCourseRow.mjs`.

## 3. Deploy to Cloud Run (production)

1. **Artifact Registry / build**: build a container image for this folder (Dockerfile or Cloud Build).
2. Deploy with **Cloud SQL** attached:

   - Instance: `root-matrix-441506-r9:us-central1:db-sp26-team110`
   - Env vars: `CLOUD_SQL_CONNECTION_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=team110_db`
   - Store password in **Secret Manager** and reference it in Cloud Run.

3. Grant the **Cloud Run service account** the role **Cloud SQL Client**.

4. Copy the service **HTTPS URL** into the frontend as `VITE_API_BASE_URL` (see Courseloadplannerui README / `.env.example`).

## Endpoints

- `GET /health` — liveness
- `GET /api/courses` — JSON array for the planner UI
