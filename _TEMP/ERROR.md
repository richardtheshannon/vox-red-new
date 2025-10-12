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
f23d5d34
Failed

Oct 12, 2025, 10:53 AM
vox-red-new-production.up.railway.app
Get Help
Details
Build Logs
Deploy Logs
HTTP Logs
Search build logs

You reached the start of the range
Oct 12, 2025, 10:53 AM
 
[Region: us-west1]
==============
Using Nixpacks
==============

context: 254k-46
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
218ms

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
82ms

stage-0
RUN npm ci
9s
found 0 vulnerabilities

stage-0
COPY . /app/.
114ms

stage-0
RUN npm run build
9s
npm warn config production Use `--omit=dev` instead.
> nextjs-app@0.1.0 build
> next build
   ▲ Next.js 15.5.4
   Creating an optimized production build ...
 ✓ Compiled successfully in 3.4s
   Linting and checking validity of types ...
Failed to compile.
./src/app/layout.tsx
18:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
23:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
27:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
31:9  Warning: Do not include stylesheets manually. See: https://nextjs.org/docs/messages/no-css-tags  @next/next/no-css-tags
./src/components/MainContent.tsx
100:62  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
100:69  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
196:60  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
196:67  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
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
Oct 12, 2025, 10:54 AM


Railway