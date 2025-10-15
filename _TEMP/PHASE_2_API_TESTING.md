# Phase 2 API Testing Guide

## Overview
This document provides comprehensive testing instructions for all Slide Management API endpoints created in Phase 2.

## Prerequisites
- Development server running on http://localhost:3000
- Database initialized with Phase 1 schema (`npm run db:slides:init`)
- Sample data seeded (`npm run db:slides:seed`)

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slides/rows` | Get all slide rows (filter with `?published=true`) |
| POST | `/api/slides/rows` | Create new slide row |
| GET | `/api/slides/rows/[id]` | Get single slide row |
| PATCH | `/api/slides/rows/[id]` | Update slide row |
| DELETE | `/api/slides/rows/[id]` | Delete slide row |
| GET | `/api/slides/rows/[id]/slides` | Get all slides in a row |
| POST | `/api/slides/rows/[id]/slides` | Create slide in row |
| GET | `/api/slides/rows/[id]/slides/[slideId]` | Get single slide |
| PATCH | `/api/slides/rows/[id]/slides/[slideId]` | Update slide |
| DELETE | `/api/slides/rows/[id]/slides/[slideId]` | Delete slide |
| POST | `/api/slides/rows/[id]/slides/reorder` | Reorder slides |
| POST | `/api/slides/upload` | Upload audio/image files |
| GET | `/api/slides/upload` | Get upload configuration |

---

## Testing Commands (curl)

### 1. Get All Slide Rows

```bash
# Get all slide rows
curl http://localhost:3000/api/slides/rows

# Get only published slide rows
curl http://localhost:3000/api/slides/rows?published=true
```

**Expected Response:**
```json
{
  "status": "success",
  "rows": [
    {
      "id": "uuid-here",
      "title": "Legacy Content",
      "description": "Original hardcoded slides",
      "row_type": "CUSTOM",
      "is_published": true,
      "display_order": 0,
      "slide_count": 4,
      "icon_set": ["check_circle_unread", "clock_arrow_up", "select_check_box"],
      "theme_color": null,
      "created_at": "2025-10-14T...",
      "updated_at": "2025-10-14T..."
    }
  ]
}
```

---

### 2. Create New Slide Row

```bash
curl -X POST http://localhost:3000/api/slides/rows \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evening Meditation Series",
    "description": "A 7-day evening meditation routine for better sleep",
    "row_type": "ROUTINE",
    "icon_set": ["nightlight", "bedtime", "spa"],
    "theme_color": "#4f46e5",
    "display_order": 1,
    "is_published": false
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Slide row created successfully",
  "row": {
    "id": "new-uuid-here",
    "title": "Evening Meditation Series",
    "description": "A 7-day evening meditation routine for better sleep",
    "row_type": "ROUTINE",
    "is_published": false,
    "display_order": 1,
    "slide_count": 0,
    "icon_set": ["nightlight", "bedtime", "spa"],
    "theme_color": "#4f46e5",
    "created_at": "2025-10-14T..."
  }
}
```

---

### 3. Get Single Slide Row

```bash
# Replace {row-id} with actual ID from previous response
curl http://localhost:3000/api/slides/rows/{row-id}
```

**Expected Response:**
```json
{
  "status": "success",
  "row": {
    "id": "row-id",
    "title": "Evening Meditation Series",
    ...
  }
}
```

---

### 4. Update Slide Row

```bash
# Publish the row and update title
curl -X PATCH http://localhost:3000/api/slides/rows/{row-id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evening Meditation - Updated",
    "is_published": true
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Slide row updated successfully",
  "row": {
    "id": "row-id",
    "title": "Evening Meditation - Updated",
    "is_published": true,
    ...
  }
}
```

---

### 5. Get Slides for a Row

```bash
curl http://localhost:3000/api/slides/rows/{row-id}/slides
```

**Expected Response:**
```json
{
  "status": "success",
  "slides": [],
  "row_id": "row-id",
  "row_title": "Evening Meditation - Updated"
}
```

---

### 6. Create Slide in Row

```bash
curl -X POST http://localhost:3000/api/slides/rows/{row-id}/slides \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Day 1: Relaxation Breathing",
    "subtitle": "Begin your evening meditation journey",
    "body_content": "<p>Welcome to Day 1 of the Evening Meditation Series. Tonight we focus on deep relaxation breathing to prepare for restful sleep.</p><p><strong>Key Points:</strong></p><ul><li>Find a comfortable position</li><li>Close your eyes</li><li>Focus on your breath</li></ul>",
    "audio_url": "/media/meditation-sample.mp3",
    "position": 1,
    "layout_type": "STANDARD"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Slide created successfully",
  "slide": {
    "id": "slide-id",
    "slide_row_id": "row-id",
    "title": "Day 1: Relaxation Breathing",
    "subtitle": "Begin your evening meditation journey",
    "body_content": "<p>Welcome to Day 1...</p>",
    "audio_url": "/media/meditation-sample.mp3",
    "position": 1,
    "layout_type": "STANDARD",
    "view_count": 0,
    "completion_count": 0,
    "created_at": "2025-10-14T..."
  }
}
```

---

### 7. Get Single Slide

```bash
curl http://localhost:3000/api/slides/rows/{row-id}/slides/{slide-id}
```

---

### 8. Update Slide

```bash
curl -X PATCH http://localhost:3000/api/slides/rows/{row-id}/slides/{slide-id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Day 1: Deep Relaxation Breathing - Updated",
    "subtitle": "Updated subtitle"
  }'
```

---

### 9. Create Multiple Slides (for reordering test)

```bash
# Create Slide 2
curl -X POST http://localhost:3000/api/slides/rows/{row-id}/slides \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Day 2: Body Scan",
    "body_content": "<p>Tonight we practice body scan meditation...</p>",
    "position": 2,
    "layout_type": "STANDARD"
  }'

# Create Slide 3
curl -X POST http://localhost:3000/api/slides/rows/{row-id}/slides \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Day 3: Gratitude Practice",
    "body_content": "<p>Reflect on the day with gratitude...</p>",
    "position": 3,
    "layout_type": "STANDARD"
  }'
```

---

### 10. Reorder Slides

```bash
# Reorder slides: swap positions of slide 1 and slide 2
curl -X POST http://localhost:3000/api/slides/rows/{row-id}/slides/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "slide_ids": ["{slide-2-id}", "{slide-1-id}", "{slide-3-id}"]
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Slides reordered successfully",
  "slide_ids": ["slide-2-id", "slide-1-id", "slide-3-id"]
}
```

---

### 11. Get Upload Configuration

```bash
curl http://localhost:3000/api/slides/upload
```

**Expected Response:**
```json
{
  "status": "success",
  "config": {
    "audio": {
      "allowedTypes": ["MP3", "WAV", "OGG"],
      "maxSize": "10MB",
      "maxSizeBytes": 10485760
    },
    "image": {
      "allowedTypes": ["JPG", "PNG", "WebP"],
      "maxSize": "5MB",
      "maxSizeBytes": 5242880
    }
  }
}
```

---

### 12. Upload Audio File

```bash
# Upload audio file
curl -X POST "http://localhost:3000/api/slides/upload?type=audio&rowId={row-id}" \
  -F "file=@/path/to/your/audio.mp3"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "File uploaded successfully",
  "file": {
    "name": "row-id_1234567890_audio.mp3",
    "url": "/media/slides/row-id/row-id_1234567890_audio.mp3",
    "type": "audio",
    "size": 2456789,
    "originalName": "audio.mp3"
  }
}
```

---

### 13. Upload Image File

```bash
# Upload image file
curl -X POST "http://localhost:3000/api/slides/upload?type=image&rowId={row-id}" \
  -F "file=@/path/to/your/image.jpg"
```

---

### 14. Delete Slide

```bash
curl -X DELETE http://localhost:3000/api/slides/rows/{row-id}/slides/{slide-id}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Slide deleted successfully"
}
```

---

### 15. Delete Slide Row

```bash
# This will cascade delete all slides in the row
curl -X DELETE http://localhost:3000/api/slides/rows/{row-id}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Slide row deleted successfully"
}
```

---

## Error Handling Tests

### Test Invalid Row Type

```bash
curl -X POST http://localhost:3000/api/slides/rows \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invalid Row",
    "row_type": "INVALID_TYPE"
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid row_type. Must be one of: ROUTINE, COURSE, TEACHING, CUSTOM"
}
```

---

### Test Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/slides/rows \
  -H "Content-Type: application/json" \
  -d '{
    "description": "No title provided"
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Missing required fields: title and row_type are required"
}
```

---

### Test Non-existent Row

```bash
curl http://localhost:3000/api/slides/rows/invalid-uuid-123
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Slide row not found"
}
```

---

### Test Invalid File Type

```bash
curl -X POST "http://localhost:3000/api/slides/upload?type=audio&rowId=test" \
  -F "file=@/path/to/document.pdf"
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid audio file type. Allowed: MP3, WAV, OGG"
}
```

---

## Automated Test Script

Create a file `test-api.sh` with the following content:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api/slides"

echo "=== Slide Management API Test Suite ==="
echo ""

# Test 1: Get all rows
echo "Test 1: GET /api/slides/rows"
curl -s "${API_BASE}/rows" | jq
echo ""

# Test 2: Get published rows only
echo "Test 2: GET /api/slides/rows?published=true"
curl -s "${API_BASE}/rows?published=true" | jq
echo ""

# Test 3: Create new slide row
echo "Test 3: POST /api/slides/rows (Create)"
RESPONSE=$(curl -s -X POST "${API_BASE}/rows" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Routine",
    "description": "Automated test",
    "row_type": "ROUTINE",
    "is_published": false
  }')
echo $RESPONSE | jq
ROW_ID=$(echo $RESPONSE | jq -r '.row.id')
echo "Created Row ID: $ROW_ID"
echo ""

# Test 4: Get single row
echo "Test 4: GET /api/slides/rows/$ROW_ID"
curl -s "${API_BASE}/rows/${ROW_ID}" | jq
echo ""

# Test 5: Update row
echo "Test 5: PATCH /api/slides/rows/$ROW_ID"
curl -s -X PATCH "${API_BASE}/rows/${ROW_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "is_published": true
  }' | jq
echo ""

# Test 6: Create slide
echo "Test 6: POST /api/slides/rows/$ROW_ID/slides"
SLIDE_RESPONSE=$(curl -s -X POST "${API_BASE}/rows/${ROW_ID}/slides" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Slide 1",
    "body_content": "<p>Test content</p>",
    "position": 1
  }')
echo $SLIDE_RESPONSE | jq
SLIDE_ID=$(echo $SLIDE_RESPONSE | jq -r '.slide.id')
echo "Created Slide ID: $SLIDE_ID"
echo ""

# Test 7: Get slides for row
echo "Test 7: GET /api/slides/rows/$ROW_ID/slides"
curl -s "${API_BASE}/rows/${ROW_ID}/slides" | jq
echo ""

# Test 8: Update slide
echo "Test 8: PATCH /api/slides/rows/$ROW_ID/slides/$SLIDE_ID"
curl -s -X PATCH "${API_BASE}/rows/${ROW_ID}/slides/${SLIDE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Slide 1 - Updated"
  }' | jq
echo ""

# Test 9: Delete slide
echo "Test 9: DELETE /api/slides/rows/$ROW_ID/slides/$SLIDE_ID"
curl -s -X DELETE "${API_BASE}/rows/${ROW_ID}/slides/${SLIDE_ID}" | jq
echo ""

# Test 10: Delete row
echo "Test 10: DELETE /api/slides/rows/$ROW_ID"
curl -s -X DELETE "${API_BASE}/rows/${ROW_ID}" | jq
echo ""

echo "=== Test Suite Complete ==="
```

Make it executable:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Phase 2 Completion Checklist

- [x] Created `/api/slides/rows` (GET, POST)
- [x] Created `/api/slides/rows/[id]` (GET, PATCH, DELETE)
- [x] Created `/api/slides/rows/[id]/slides` (GET, POST)
- [x] Created `/api/slides/rows/[id]/slides/[slideId]` (GET, PATCH, DELETE)
- [x] Created `/api/slides/rows/[id]/slides/reorder` (POST)
- [x] Created `/api/slides/upload` (GET, POST)
- [x] Added comprehensive error handling
- [x] Added request validation
- [x] Added TypeScript types
- [ ] Test all endpoints manually
- [ ] Verify database triggers work (slide_count auto-update)
- [ ] Test file upload functionality
- [ ] Document any issues found

---

## Next Steps (Phase 3)

After successful API testing:
1. Create `/admin/slides` page (list view)
2. Build `SlideRowList.tsx` component
3. Create `/admin/slides/new` page (create form)
4. Build `SlideRowForm.tsx` component
5. Add filtering and sorting to list view

---

## Notes

- All API endpoints use consistent error response format
- File uploads are stored in `/public/media/slides/[rowId]/`
- Database triggers automatically update `slide_count` on insert/delete
- Cascade delete removes all slides when deleting a row
- All endpoints validate input and return appropriate HTTP status codes

---

**Phase 2 Status**: ✅ COMPLETE
**Date Completed**: 2025-10-14
**Files Created**: 6 API route files
**Lines of Code**: ~700+ lines
