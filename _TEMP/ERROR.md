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
fc004166
Failed

Oct 11, 2025, 10:09 AM
vox-red-new-production.up.railway.app
Get Help
Details
Build Logs
Deploy Logs
HTTP Logs
Search build logs

You reached the start of the range
Oct 11, 2025, 10:09 AM
 
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
323ms

internal
load .dockerignore
0ms

internal
load build context
0ms

stage-0
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d cached
0ms

stage-0
COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix cached
0ms

stage-0
WORKDIR /app/ cached
0ms

stage-0
COPY . /app/.
32ms

stage-0
RUN npm ci
9s
found 0 vulnerabilities

stage-0
COPY . /app/.
104ms

stage-0
RUN npm run build
18s
ƒ (Dynamic) server-rendered on demand

stage-0
RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
81ms

stage-0
COPY . /app
21ms

auth
sharing credentials for production-us-west2.railway-registry.com
0ms
=== Successfully Built! ===
Run:
docker run -it production-us-west2.railway-registry.com/a011e499-729f-4d1f-ad0c-d0fbfcd643b2:fc004166-242d-426b-b70f-6bdf3fda1a3f
Build time: 69.62 seconds
 
====================
Starting Healthcheck
====================
Path: /api/test-db
Retry window: 5m0s
 
Attempt #1 failed with service unavailable. Continuing to retry for 4m59s
Attempt #2 failed with service unavailable. Continuing to retry for 4m58s
Attempt #3 failed with service unavailable. Continuing to retry for 4m56s
Attempt #4 failed with service unavailable. Continuing to retry for 4m52s
Attempt #5 failed with service unavailable. Continuing to retry for 4m44s
Attempt #6 failed with service unavailable. Continuing to retry for 4m28s
Attempt #7 failed with service unavailable. Continuing to retry for 3m58s
Attempt #8 failed with service unavailable. Continuing to retry for 3m28s
Attempt #9 failed with service unavailable. Continuing to retry for 2m58s
Attempt #10 failed with service unavailable. Continuing to retry for 2m28s
Attempt #11 failed with service unavailable. Continuing to retry for 1m58s
Attempt #12 failed with service unavailable. Continuing to retry for 1m28s
Attempt #13 failed with service unavailable. Continuing to retry for 57s
Attempt #14 failed with service unavailable. Continuing to retry for 27s
 
1/1 replicas never became healthy!

Healthcheck failed!

You reached the end of the range
Oct 11, 2025, 10:15 AM


vox-red-new | Railway