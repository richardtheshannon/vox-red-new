VOX-RED-NEW


production
Architecture
Observability
Logs
Settings

Share








Activity


vox-red-new
Deployments
Variables
Metrics
Settings
vox-red-new-production.up.railway.app
us-west2
1 Replica




History



















vox-red-new
/
b3c513bd
Active

Oct 15, 2025, 10:23 AM
vox-red-new-production.up.railway.app
Details
Build Logs
Deploy Logs
HTTP Logs
Filter and search logs

You reached the start of the range
Oct 15, 2025, 10:23 AM
Starting Container
npm warn config production Use `--omit=dev` instead.
> nextjs-app@0.1.0 start
> tsx scripts/railway-init.ts && next start
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
🚂 Starting Railway database initialization...
❌ Error creating database: Error: connect ECONNREFUSED ::1:5432
    at /app/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at createDatabaseIfNotExists (/app/scripts/init-db.ts:25:20)
    at initializeDatabase (/app/scripts/init-db.ts:230:5)
    at railwayInit (/app/scripts/railway-init.ts:17:7) {
  errno: -111,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '::1',
  port: 5432
}
❌ Database initialization failed: Error: connect ECONNREFUSED ::1:5432
    at /app/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at createDatabaseIfNotExists (/app/scripts/init-db.ts:25:20)
    at initializeDatabase (/app/scripts/init-db.ts:230:5)
    at railwayInit (/app/scripts/railway-init.ts:17:7) {
  errno: -111,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '::1',
  port: 5432
}
❌ Database initialization failed: Error: connect ECONNREFUSED ::1:5432
    at /app/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at createDatabaseIfNotExists (/app/scripts/init-db.ts:25:20)
    at initializeDatabase (/app/scripts/init-db.ts:230:5)
    at railwayInit (/app/scripts/railway-init.ts:17:7) {
  errno: -111,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '::1',
  port: 5432
}
❌ Railway database initialization failed: Error: connect ECONNREFUSED ::1:5432
    at /app/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at createDatabaseIfNotExists (/app/scripts/init-db.ts:25:20)
    at initializeDatabase (/app/scripts/init-db.ts:230:5)
    at railwayInit (/app/scripts/railway-init.ts:17:7) {
  errno: -111,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '::1',
  port: 5432
}
⚠️ Continuing startup anyway - database may already be initialized
   ▲ Next.js 15.5.4
   - Local:        http://localhost:8080
   - Network:      http://10.250.12.221:8080
 ✓ Starting...
 ✓ Ready in 752ms
=== Database Health Check API Called ===
Health check attempt 1/5
Starting database health check...
DATABASE_URL exists: true
Health check query result: [ { health: 1 } ]
Error fetching slide rows: error: relation "slide_rows" does not exist
    at async h (.next/server/app/api/test-db/route.js:1:6987)
    at async g (.next/server/app/api/slides/rows/[id]/route.js:1:2741)
    at async h (.next/server/app/api/slides/rows/route.js:1:8395)
    at async k (.next/server/app/api/slides/rows/route.js:1:5327)
    at async g (.next/server/app/api/slides/rows/route.js:1:6330) {
  length: 109,
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '15',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1449',
  routine: 'parserOpenTable'
}
Error fetching slide rows: error: relation "slide_rows" does not exist
    at async h (.next/server/app/api/test-db/route.js:1:6987)
    at async g (.next/server/app/api/slides/rows/[id]/route.js:1:2741)
    at async h (.next/server/app/api/slides/rows/route.js:1:8395)
    at async k (.next/server/app/api/slides/rows/route.js:1:5327)
    at async g (.next/server/app/api/slides/rows/route.js:1:6330) {
  length: 109,
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '15',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1449',
  routine: 'parserOpenTable'
}


vox-red-new | Railway