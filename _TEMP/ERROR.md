Error creating user: error: new row for relation "users" violates check constraint "users_role_check"
  file: 'execMain.c',
    at async h (.next/server/app/api/auth/[...nextauth]/route.js:1:2446)
    at async i (.next/server/app/api/auth/[...nextauth]/route.js:1:2520)
  line: '2033',
    at async l (.next/server/app/api/auth/[...nextauth]/route.js:5:9)
    at async j (.next/server/app/api/users/route.js:1:7356)
  routine: 'ExecConstraints'
}
    at async k (.next/server/app/api/users/route.js:1:3217) {
  detail: 'Failing row contains (f2838653-ca95-4a28-b3cc-283d5a8eccf8, john@doe.com, null, John Doe, admin, 2025-11-17 14:20:37.743233, 2025-11-17 14:20:37.743233, $2b$10$9EEQZxretjq.akAKHAZize0wLAEGjjI3RJM8XjshQO1sEB3wCt41y).',
  length: 386,
  severity: 'ERROR',
  hint: undefined,
  code: '23514',
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: 'public',
  table: 'users',
  column: undefined,
  dataType: undefined,
  constraint: 'users_role_check',
Error stack: error: new row for relation "users" violates check constraint "users_role_check"
    at /app/node_modules/pg/lib/client.js:545:17
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async h (/app/.next/server/app/api/auth/[...nextauth]/route.js:1:2446)
    at async i (/app/.next/server/app/api/auth/[...nextauth]/route.js:1:2520)
    at async l (/app/.next/server/app/api/auth/[...nextauth]/route.js:5:9)
    at async j (/app/.next/server/app/api/users/route.js:1:7356)
    at async rN.do (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:21042)
    at async rN.handle (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:25860)
    at async k (/app/.next/server/app/api/users/route.js:1:3217)
    at async rN.handleResponse (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:1:105568)
Request body: {
  "name": "John Doe",
  "email": "john@doe.com",
  "password": "Superculture1@",
  "role": "admin"
}
    at async rN.handle (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:25860)
    at async k (/app/.next/server/app/api/users/route.js:1:3217)
    at async i (/app/.next/server/app/api/auth/[...nextauth]/route.js:1:2520)
    at /app/node_modules/pg/lib/client.js:545:17
    at async l (/app/.next/server/app/api/auth/[...nextauth]/route.js:5:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async j (/app/.next/server/app/api/users/route.js:1:7356)
    at async h (/app/.next/server/app/api/auth/[...nextauth]/route.js:1:2446)
    at async rN.do (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:21042)
Error stack: error: new row for relation "users" violates check constraint "users_role_check"
  "email": "john@doe.com",
  "password": "Superculture1@",
    at async rN.handleResponse (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:1:105568)
  "role": "admin"
Request body: {
}
  "name": "John Doe",
Error creating user: error: new row for relation "users" violates check constraint "users_role_check"
    at async h (.next/server/app/api/auth/[...nextauth]/route.js:1:2446)
    at async i (.next/server/app/api/auth/[...nextauth]/route.js:1:2520)
    at async l (.next/server/app/api/auth/[...nextauth]/route.js:5:9)
    at async j (.next/server/app/api/users/route.js:1:7356)
    at async k (.next/server/app/api/users/route.js:1:3217) {
  length: 386,
  severity: 'ERROR',
  code: '23514',
  detail: 'Failing row contains (a992230d-33c7-4279-ad8b-4c81806c5cab, john@doe.com, null, John Doe, admin, 2025-11-17 14:22:56.311433, 2025-11-17 14:22:56.311433, $2b$10$33BPQNfe0j7pUo6vW5zvi.nfDQN7ICyjDld7zhAbOyG/kY0u3muA6).',
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: 'public',
  table: 'users',
  column: undefined,
  dataType: undefined,
  constraint: 'users_role_check',
  file: 'execMain.c',
  line: '2033',
  routine: 'ExecConstraints'
}


layout-2d4c96d5737cbddb.js:1 [AdminAuthGuard] User role: ADMIN Type: string
layout-2d4c96d5737cbddb.js:1 [AdminAuthGuard] Access granted - user is admin
new:1 The resource https://app.lilde.com/_next/static/css/e2c436fd740d88d7.css was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
/api/users:1  Failed to load resource: the server responded with a status of 500 ()
new:1 The resource https://app.lilde.com/_next/static/css/e2c436fd740d88d7.css was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
layout-2d4c96d5737cbddb.js:1 [AdminAuthGuard] User role: ADMIN Type: string
layout-2d4c96d5737cbddb.js:1 [AdminAuthGuard] Access granted - user is admin
new:1 The resource https://app.lilde.com/_next/static/css/e2c436fd740d88d7.css was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
new:1 The resource https://app.lilde.com/_next/static/css/e2c436fd740d88d7.css was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.


{name: "John Doe", email: "john@doe.com", password: "Superculture1@", role: "admin"}
email
: 
"john@doe.com"
name
: 
"John Doe"
password
: 
"Superculture1@"
role
: 
"admin"

{
    "status": "error",
    "message": "Failed to create user",
    "error": "new row for relation \"users\" violates check constraint \"users_role_check\"",
    "stack": "error: new row for relation \"users\" violates check constraint \"users_role_check\"\n    at /app/node_modules/pg/lib/client.js:545:17\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async h (/app/.next/server/app/api/auth/[...nextauth]/route.js:1:2446)\n    at async i (/app/.next/server/app/api/auth/[...nextauth]/route.js:1:2520)\n    at async l (/app/.next/server/app/api/auth/[...nextauth]/route.js:5:9)\n    at async j (/app/.next/server/app/api/users/route.js:1:7356)\n    at async rN.do (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:21042)\n    at async rN.handle (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:25860)\n    at async k (/app/.next/server/app/api/users/route.js:1:3217)\n    at async rN.handleResponse (/app/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:1:105568)"
}