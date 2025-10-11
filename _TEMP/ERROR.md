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
216912c2
Failed

Oct 11, 2025, 11:41 AM
vox-red-new-production.up.railway.app
Get Help
Details
Build Logs
Deploy Logs
HTTP Logs
Search build logs

You reached the start of the range
Oct 11, 2025, 11:41 AM
 
[Region: us-west1]
==============
Using Nixpacks
==============

context: frfr-eYrx
╔════════ Nixpacks v1.38.0 ═══════╗
║ setup      │ nodejs_18, npm-9_x ║
║─────────────────────────────────║
║ install    │ npm ci             ║
║─────────────────────────────────║
║ build      │ npm run build      ║
║─────────────────────────────────║
║ start      │ npm run start      ║
╚═════════════════════════════════╝

internal
load build definition from Dockerfile
0ms

internal
load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
202ms

internal
load .dockerignore
1ms

internal
load build context
0ms

stage-0
WORKDIR /app/ cached
0ms

stage-0
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d cached
0ms

stage-0
COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix cached
0ms

stage-0
COPY . /app/.
23ms

stage-0
RUN npm ci
8s
found 0 vulnerabilities

stage-0
COPY . /app/.
101ms

stage-0
RUN npm run build
597ms
npm warn config production Use `--omit=dev` instead.
> nextjs-app@0.1.0 build
> tsx scripts/railway-init.ts && next build
🚂 Starting Railway database initialization...
🔄 Initializing PostgreSQL database...
❌ Database initialization failed: Error: getaddrinfo ENOTFOUND postgres.railway.internal
    at /app/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at initializeDatabase (/app/scripts/init-db.ts:176:20)
    at railwayInit (/app/scripts/railway-init.ts:14:5) {
  errno: -3008,
  code: 'ENOTFOUND',
  syscall: 'getaddrinfo',
  hostname: 'postgres.railway.internal'
}
❌ Railway database initialization failed: Error: getaddrinfo ENOTFOUND postgres.railway.internal
    at /app/node_modules/pg-pool/index.js:45:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at initializeDatabase (/app/scripts/init-db.ts:176:20)
    at railwayInit (/app/scripts/railway-init.ts:14:5) {
  errno: -3008,
  code: 'ENOTFOUND',
  syscall: 'getaddrinfo',
  hostname: 'postgres.railway.internal'
}
Dockerfile:24
-------------------
22 |     # build phase
23 |     COPY . /app/.
24 | >>> RUN --mount=type=cache,id=s/a011e499-729f-4d1f-ad0c-d0fbfcd643b2-next/cache,target=/app/.next/cache --mount=type=cache,id=s/a011e499-729f-4d1f-ad0c-d0fbfcd643b2-node_modules/cache,target=/app/node_modules/.cache npm run build
25 |
26 |
-------------------
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code: 1
Error: Docker build failed
You reached the end of the range
Oct 11, 2025, 11:41 AM


vox-red-new | Railway