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
app.lilde.com
us-west2
1 Replica




History




















































vox-red-new
/
d1dcc6e1
Failed

Oct 18, 2025, 1:19 PM
app.lilde.com
Get Help
Details
Build Logs
Deploy Logs
HTTP Logs
Search build logs

You reached the start of the range
Oct 18, 2025, 1:19 PM
 
[Region: us-west1]
==============
Using Nixpacks
==============

context: b683-rp1e
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
255ms

internal
load .dockerignore
0ms

internal
load build context
0ms

stage-0
FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
9ms

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
633ms

stage-0
RUN npm ci
8s
found 0 vulnerabilities

stage-0
COPY . /app/.
125ms

stage-0
RUN npm run build
11s
npm warn config production Use `--omit=dev` instead.
> nextjs-app@0.1.0 build
> next build
   ▲ Next.js 15.5.4
   Creating an optimized production build ...
 ✓ Compiled successfully in 4.0s
   Linting and checking validity of types ...
./src/app/admin/slides/[id]/page.tsx
68:6  Warning: React Hook useEffect has a missing dependency: 'fetchRowData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
./src/app/api/slides/import/route.ts
3:10  Warning: 'createSlideRow' is defined but never used.  @typescript-eslint/no-unused-vars
./src/app/api/slides/rows/[id]/route.ts
71:13  Warning: 'id' is assigned a value but never used.  @typescript-eslint/no-unused-vars
71:17  Warning: 'created_at' is assigned a value but never used.  @typescript-eslint/no-unused-vars
71:29  Warning: 'slide_count' is assigned a value but never used.  @typescript-eslint/no-unused-vars
./src/app/api/slides/rows/[id]/slides/[slideId]/route.ts
139:13  Warning: 'id' is assigned a value but never used.  @typescript-eslint/no-unused-vars
139:17  Warning: 'slide_row_id' is assigned a value but never used.  @typescript-eslint/no-unused-vars
139:31  Warning: 'created_at' is assigned a value but never used.  @typescript-eslint/no-unused-vars
139:43  Warning: 'view_count' is assigned a value but never used.  @typescript-eslint/no-unused-vars
139:55  Warning: 'completion_count' is assigned a value but never used.  @typescript-eslint/no-unused-vars
./src/app/layout.tsx
18:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
23:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
28:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
32:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
36:9  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
40:9  Warning: Do not include stylesheets manually. See: https://nextjs.org/docs/messages/no-css-tags  @next/next/no-css-tags
./src/components/EssentialAudioPlayer.tsx
16:3  Warning: 'scratch' is assigned a value but never used.  @typescript-eslint/no-unused-vars
./src/components/MainContent.tsx
96:6  Warning: React Hook useEffect has a missing dependency: 'loadSlidesForRow'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
./src/components/admin/slides/SlideEditor.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
9:8  Warning: 'IconPicker' is defined but never used.  @typescript-eslint/no-unused-vars
37:10  Warning: 'selectedIcons' is assigned a value but never used.  @typescript-eslint/no-unused-vars
37:25  Warning: 'setSelectedIcons' is assigned a value but never used.  @typescript-eslint/no-unused-vars
38:10  Warning: 'showPreview' is assigned a value but never used.  @typescript-eslint/no-unused-vars
38:23  Warning: 'setShowPreview' is assigned a value but never used.  @typescript-eslint/no-unused-vars
info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Failed to compile.
./src/components/admin/slides/SlideEditor.tsx:111:5
Type error: Property 'is_published' is missing in type '{ id: string; slide_row_id: string; title: string; subtitle: string | undefined; body_content: string; audio_url: string | undefined; image_url: string | undefined; video_url: string | undefined; ... 8 more ...; updated_at: Date; }' but required in type 'Slide'.

  109 |
  110 |   const getPreviewData = (): Slide => {
> 111 |     return {
      |     ^
  112 |       id: slide?.id || 'preview',
  113 |       slide_row_id: row.id,
  114 |       title,
Next.js build worker exited with code: 1 and signal: null
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
Oct 18, 2025, 1:19 PM


vox-red-new | Railway