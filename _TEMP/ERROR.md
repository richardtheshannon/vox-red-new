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
8435f6e1
Failed

Oct 21, 2025, 11:10 AM
app.lilde.com
Get Help
Details
Build Logs
Deploy Logs
HTTP Logs
Search build logs

You reached the start of the range
Oct 21, 2025, 11:10 AM
 
[Region: us-west1]
==============
Using Nixpacks
==============

context: 5mnm-4Nql
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
1ms

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
COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix cached
0ms

stage-0
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d cached
1ms

stage-0
COPY . /app/.
375ms

stage-0
RUN npm ci
11s
found 0 vulnerabilities

stage-0
COPY . /app/.
204ms

stage-0
RUN npm run build
17s
npm warn config production Use `--omit=dev` instead.
> nextjs-app@0.1.0 build
> next build
   ▲ Next.js 15.5.4
   Creating an optimized production build ...
 ✓ Compiled successfully in 6.1s
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
47:53  Warning: 'activeRowId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
130:6  Warning: React Hook useEffect has a missing dependency: 'loadSlidesForRow'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
162:6  Warning: React Hook useEffect has a missing dependency: 'loadSlidesForRow'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
./src/components/SpaAudioPlayer.tsx
24:6  Warning: React Hook useEffect has a missing dependency: 'loadActiveTrack'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
./src/components/admin/slides/SlideEditor.tsx
3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
47:10  Warning: 'showPreview' is assigned a value but never used.  @typescript-eslint/no-unused-vars
47:23  Warning: 'setShowPreview' is assigned a value but never used.  @typescript-eslint/no-unused-vars
./src/components/admin/slides/SlideRowList.tsx
248:32  Warning: 'index' is defined but never used.  @typescript-eslint/no-unused-vars
info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Failed to compile.
./src/components/admin/slides/SlideEditor.tsx:113:9
Type error: Type 'string | null' is not assignable to type 'string | undefined'.

  Type 'null' is not assignable to type 'string | undefined'.
  111 |         body_content: bodyContent,
  112 |         audio_url: audioUrl || undefined,
> 113 |         image_url: imageUrl || null,
      |         ^
  114 |         video_url: videoUrl.trim() || undefined,
  115 |         layout_type: layoutType,
  116 |         content_theme: contentTheme || undefined,
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
Oct 21, 2025, 11:11 AM


vox-red-new | Railway