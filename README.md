# The "C's Get Degrees" Calculator

Course Load Planner for UIUC students: plan a semester, see a difficulty-style meter, and load the live course catalog from **Google Cloud SQL (MySQL)** via a small **Node.js** API.

**Repository:** [github.com/jkcol/-Cs-Get-Degrees-Calculator](https://github.com/jkcol/-Cs-Get-Degrees-Calculator)

## Repository layout

| Folder | Purpose |
|--------|---------|
| `Courseloadplannerui/` | React + Vite frontend (port **3000**) |
| `team110-api/` | Express API + MySQL (port **8080**) |
| `tools/` | Optional local [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/mysql/sql-proxy) binary (`cloud-sql-proxy.exe` on Windows) |
| `run-local.ps1` | Windows helper: starts proxy (if available), API, and UI in separate windows |

## Prerequisites

- **Node.js** 18+ (includes `npm`)
- **Google Cloud** access to the team Cloud SQL instance (your instructor / team project)
- **Cloud SQL Auth Proxy** (either on your `PATH` as `cloud-sql-proxy`, or download into `tools/` — see step 3)
- **Google Cloud SDK** (optional but recommended) so you can run `gcloud` — install from [Cloud SDK install](https://cloud.google.com/sdk/docs/install). On Windows, if `gcloud` is not found, it may live under `%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd`.

## One-time: Google auth for the proxy

The proxy needs **Application Default Credentials** (ADC):

```powershell
gcloud auth application-default login
```

If `gcloud` is not on your `PATH`, use the full path to `gcloud.cmd` (see Prerequisites), then run `auth application-default login` again.

## One-time: MySQL application user (Cloud SQL)

Your API connects with a **built-in** MySQL user (username + password), **not** Cloud IAM for this app.

1. In [Google Cloud Console](https://console.cloud.google.com/) → **SQL** → your instance → **Users** → **Add user account**.
2. Choose **Built-in authentication** (not Cloud IAM).
3. Set username (e.g. `app_user`) and a strong password; save the password for `.env`.
4. In MySQL (e.g. `gcloud sql connect <INSTANCE> --user=root`), grant read access to your app database, for example:

   ```sql
   GRANT SELECT ON team110_db.* TO 'app_user'@'%';
   FLUSH PRIVILEGES;
   ```

## One-time: Cloud SQL Auth Proxy (local dev)

From the **repo root**, you can download the Windows x64 v2 proxy (adjust version if needed):

```powershell
New-Item -ItemType Directory -Force -Path .\tools | Out-Null
Invoke-WebRequest `
  -Uri "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.21.2/cloud-sql-proxy.x64.exe" `
  -OutFile ".\tools\cloud-sql-proxy.exe"
```

**Connection name** (example used in this project — confirm with your team if it changed):

`root-matrix-441506-r9:us-central1:db-sp26-team110`

Start the proxy (leave this terminal open; uses port **3307**):

```powershell
.\tools\cloud-sql-proxy.exe root-matrix-441506-r9:us-central1:db-sp26-team110 --port 3307
```

Or, if `cloud-sql-proxy` is on your `PATH`:

```powershell
cloud-sql-proxy root-matrix-441506-r9:us-central1:db-sp26-team110 --port 3307
```

## One-time: API environment file

```powershell
cd team110-api
copy .env.example .env
```

Edit `team110-api/.env`:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3307` (must match `--port` on the proxy)
- `DB_USER` / `DB_PASSWORD` — the built-in MySQL user you created
- `DB_NAME` — your database name (default in example: `team110_db`)

**Never commit `.env`.** It is listed in `.gitignore`.

If the password contains special characters, you can wrap it in double quotes in `.env`, for example: `DB_PASSWORD="your!complex'pass"`.

## Run the demo (local)

You need **three** terminals (or use `.\run-local.ps1` from the repo root on Windows).

### Terminal A — Cloud SQL Auth Proxy

```powershell
.\tools\cloud-sql-proxy.exe root-matrix-441506-r9:us-central1:db-sp26-team110 --port 3307
```

Wait until you see that the proxy is listening / ready for connections.

### Terminal B — API

```powershell
cd team110-api
npm install
npm run dev
```

Confirm: [http://127.0.0.1:8080/health](http://127.0.0.1:8080/health) returns `{"ok":true}` and [http://127.0.0.1:8080/api/courses](http://127.0.0.1:8080/api/courses) returns JSON.

### Terminal C — Frontend

```powershell
cd Courseloadplannerui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With `VITE_API_BASE_URL` empty, Vite **proxies** `/api` and `/health` to `http://127.0.0.1:8080` (see `Courseloadplannerui/vite.config.ts`).

## Troubleshooting

| Symptom | What to check |
|--------|----------------|
| `ECONNREFUSED 127.0.0.1:3307` | Proxy not running or wrong `--port` vs `DB_PORT` in `.env` |
| `could not find default credentials` | Run `gcloud auth application-default login` |
| `Access denied ... (using password: YES)` | User missing in Cloud SQL, wrong password in `.env`, or missing `GRANT` / wrong host (`'%'`) |
| `EADDRINUSE` on port 8080 | Another `node` / old API still running — stop it or change `PORT` in `.env` |
| `HTTP 500` on the UI for courses | Open `/api/courses` directly; read the JSON `detail` field for the MySQL error |
| Course titles show as "Unknown course" | Your `Courses` column names may differ from what `mapCourseRow.mjs` expects — run `DESCRIBE Courses;` and adjust `COURSES_SQL` in `.env` or the mapper |

## Production (optional)

Deploy `team110-api` to **Cloud Run** with the Cloud SQL connection and env vars; set the service URL in `Courseloadplannerui` as `VITE_API_BASE_URL` for production builds.

## Team

UIUC CS411 — Team 110 (project stage submissions describe design, GCP schema, and indexing).

## License / course use

For academic course submission; adjust license as required by your course staff.
