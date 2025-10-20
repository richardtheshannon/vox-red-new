Console Error


Invalid row_type. Must be one of: ROUTINE, COURSE, TEACHING, CUSTOM

src\app\admin\slides\[id]\edit\page.tsx (74:15) @ handleSubmit


  72 |       if (!response.ok) {
  73 |         const errorData = await response.json();
> 74 |         throw new Error(errorData.message || 'Failed to update slide row');
     |               ^
  75 |       }
  76 |
  77 |       // Redirect back to slide management list
Call Stack
2

handleSubmit
src\app\admin\slides\[id]\edit\page.tsx (74:15)
async handleSubmit
src\components\admin\slides\SlideRowForm.tsx (72:7)

:3000/api/slides/rows/e30038d4-93b9-44ec-abb6-a4b3e5cb4bb1:1  Failed to load resource: the server responded with a status of 400 (Bad Request)
hook.js:608 Error updating slide row: Error: Invalid row_type. Must be one of: ROUTINE, COURSE, TEACHING, CUSTOM
    at handleSubmit (C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\src\app\admin\slides\[id]\edit\page.tsx:74:15)
    at async handleSubmit (C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\src\components\admin\slides\SlideRowForm.tsx:72:7)
overrideMethod @ hook.js:608
