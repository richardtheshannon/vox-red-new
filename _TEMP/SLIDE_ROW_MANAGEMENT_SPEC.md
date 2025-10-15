# Slide Row Management System - Development Specification

## Overview

This document outlines the development plan for a comprehensive **Slide Row Management System** that allows administrators to create, edit, and manage dynamic content slides for the frontend application. The system will replace the current hardcoded slides in `MainContent.tsx` with database-driven, horizontally scrollable slide rows.

---

## Feature Summary

### What We're Building
- **Admin Interface** at `/admin/slides` for managing slide content
- **Two Primary Row Types**: Routines & Courses (expandable to more types)
- **Horizontal Scroll Navigation**: Each row contains multiple slides that scroll left/right
- **Rich Article-Style Content**: Each slide functions as an editable article with title, body, media, and metadata
- **Dynamic Frontend Integration**: Frontend pulls slides from database instead of hardcoded content

### Core Concepts
- **Slide Row**: A collection of related slides (e.g., "Morning Routines" with 8 slides, "Yoga Fundamentals" with 12 slides)
- **Slide**: An individual content piece within a row (title, body text, optional audio/image, icons)
- **Row Type**: Category classification (Routines, Courses, Teachings, etc.)

---

## Database Architecture

### New Tables

#### 1. `slide_rows` Table
Represents a collection of slides (e.g., a course or routine sequence).

```sql
CREATE TABLE IF NOT EXISTS slide_rows (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR NOT NULL,
    description TEXT,
    row_type VARCHAR NOT NULL CHECK (row_type IN ('ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM')),

    -- Display settings
    is_published BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,

    -- Visual styling
    icon_set TEXT, -- JSON array of Material Symbol icon names (e.g., ["check_circle_unread", "clock_arrow_up"])
    theme_color VARCHAR, -- Hex color for UI theming

    -- Metadata
    slide_count INTEGER DEFAULT 0, -- Computed count of slides in this row
    created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slide_rows_type ON slide_rows(row_type);
CREATE INDEX IF NOT EXISTS idx_slide_rows_published ON slide_rows(is_published);
CREATE INDEX IF NOT EXISTS idx_slide_rows_order ON slide_rows(display_order);
```

#### 2. `slides` Table
Individual slide content within a row.

```sql
CREATE TABLE IF NOT EXISTS slides (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slide_row_id VARCHAR NOT NULL REFERENCES slide_rows(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR NOT NULL,
    subtitle VARCHAR,
    body_content TEXT, -- Main article content (supports HTML/Markdown)

    -- Media
    audio_url VARCHAR, -- Path to MP3 file (e.g., "/media/routine-day1.mp3")
    image_url VARCHAR, -- Optional background or header image

    -- Display settings
    position INTEGER NOT NULL, -- Order within the row (1, 2, 3, etc.)
    layout_type VARCHAR DEFAULT 'STANDARD' CHECK (layout_type IN ('STANDARD', 'OVERFLOW', 'MINIMAL')),

    -- Metadata
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0, -- For tracking user progress (future feature)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(slide_row_id, position) -- Each position unique within a row
);

CREATE INDEX IF NOT EXISTS idx_slides_row_id ON slides(slide_row_id);
CREATE INDEX IF NOT EXISTS idx_slides_position ON slides(position);
```

#### 3. `slide_icons` Table (Optional Enhancement)
For storing custom icon configurations per slide.

```sql
CREATE TABLE IF NOT EXISTS slide_icons (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slide_id VARCHAR NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
    icon_name VARCHAR NOT NULL, -- Material Symbol icon name
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(slide_id, display_order)
);
```

### Triggers for Auto-Update

```sql
-- Update slide_count when slides are added/removed
CREATE OR REPLACE FUNCTION update_slide_row_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slide_rows
    SET slide_count = (
        SELECT COUNT(*)
        FROM slides
        WHERE slide_row_id = COALESCE(NEW.slide_row_id, OLD.slide_row_id)
    )
    WHERE id = COALESCE(NEW.slide_row_id, OLD.slide_row_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_slide_count_insert ON slides;
CREATE TRIGGER update_slide_count_insert AFTER INSERT ON slides
FOR EACH ROW EXECUTE FUNCTION update_slide_row_count();

DROP TRIGGER IF EXISTS update_slide_count_delete ON slides;
CREATE TRIGGER update_slide_count_delete AFTER DELETE ON slides
FOR EACH ROW EXECUTE FUNCTION update_slide_row_count();
```

---

## Admin Interface Design

### Route Structure
- **List Page**: `/admin/slides` - View all slide rows
- **Create Row**: `/admin/slides/new` - Create new slide row
- **Edit Row**: `/admin/slides/[id]` - Edit row metadata and manage slides
- **Edit Slide**: `/admin/slides/[rowId]/slide/[slideId]` - Edit individual slide content

### Page 1: Slide Row List (`/admin/slides`)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard > Slide Management                          │
├─────────────────────────────────────────────────────────────┤
│ [+ Create New Slide Row]                    [Filter: All ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ROUTINES                                              │   │
│ │ Morning Meditation Sequence              [Published]  │   │
│ │ 8 slides • Created 2025-01-15                         │   │
│ │ [Edit Row] [Manage Slides] [Delete]                   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ COURSES                                               │   │
│ │ Yoga Fundamentals - 30 Day Program       [Published]  │   │
│ │ 12 slides • Created 2025-01-10                        │   │
│ │ [Edit Row] [Manage Slides] [Delete]                   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ TEACHING                                              │   │
│ │ Spiritual Teachings Collection            [Draft]     │   │
│ │ 4 slides • Created 2025-10-14                         │   │
│ │ [Edit Row] [Manage Slides] [Delete]                   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Features
- **Card Display**: Each slide row shown as a card with metadata
- **Status Indicators**: Published/Draft badges
- **Quick Actions**: Edit, Manage Slides, Delete buttons
- **Filtering**: Filter by row type (All, Routines, Courses, Teachings)
- **Sorting**: By creation date, title, or slide count

### Page 2: Create/Edit Slide Row (`/admin/slides/new` or `/admin/slides/[id]`)

#### Form Fields
```
┌─────────────────────────────────────────────────────────────┐
│ Create New Slide Row                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Title *                                                       │
│ [Morning Meditation Sequence________________________]        │
│                                                               │
│ Description                                                   │
│ [A comprehensive 8-day meditation routine_________]          │
│ [to cultivate mindfulness and inner peace_________]          │
│                                                               │
│ Row Type *                                                    │
│ [Routine ▼]  (Routine, Course, Teaching, Custom)             │
│                                                               │
│ Icon Set (Material Symbols - up to 3)                        │
│ [check_circle_unread] [+] [clock_arrow_up] [+]               │
│                                                               │
│ Theme Color                                                   │
│ [#dc2626] [Color Picker]                                     │
│                                                               │
│ Display Order                                                 │
│ [0___] (Lower numbers appear first)                          │
│                                                               │
│ Status                                                        │
│ [ ] Published  [✓] Draft                                     │
│                                                               │
│ [Cancel]                              [Save Slide Row]       │
└─────────────────────────────────────────────────────────────┘
```

### Page 3: Manage Slides (`/admin/slides/[id]`)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Slide Management > Morning Meditation Sequence              │
├─────────────────────────────────────────────────────────────┤
│ [+ Add New Slide]                    [← Back to Rows]       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Introduction to Mindfulness                          │ │
│ │ "Welcome to your journey of inner peace..."             │ │
│ │ Audio: meditation-day1.mp3 | Views: 245                 │ │
│ │ [↑ Move Up] [↓ Move Down] [Edit] [Delete]              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 2. Breath Awareness Practice                            │ │
│ │ "Today we focus on the natural rhythm of breathing..."  │ │
│ │ Audio: meditation-day2.mp3 | Views: 189                 │ │
│ │ [↑ Move Up] [↓ Move Down] [Edit] [Delete]              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3. Body Scan Meditation                                 │ │
│ │ "Connect with physical sensations from head to toe..."  │ │
│ │ Audio: meditation-day3.mp3 | Views: 156                 │ │
│ │ [↑ Move Up] [↓ Move Down] [Edit] [Delete]              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Features
- **Drag-and-Drop Reordering**: Move slides up/down to change position
- **Slide Preview**: Show title + first line of content
- **Metadata Display**: Audio file, view count, completion stats
- **Quick Actions**: Edit, Delete, Reorder

### Page 4: Edit Slide Content (`/admin/slides/[rowId]/slide/[slideId]`)

#### Rich Content Editor
```
┌─────────────────────────────────────────────────────────────┐
│ Edit Slide > Morning Meditation Sequence > Slide 1          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Title *                                                       │
│ [Introduction to Mindfulness_____________________]           │
│                                                               │
│ Subtitle (Optional)                                           │
│ [Day 1: Setting Your Intention__________________]            │
│                                                               │
│ Body Content * (Rich Text Editor)                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [B] [I] [U] [H1] [H2] [•] [Link] [Image]             │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ Welcome to your journey of inner peace and            │   │
│ │ mindfulness. This meditation practice will help you   │   │
│ │ develop awareness of the present moment...            │   │
│ │                                                        │   │
│ │ **Key Concepts:**                                     │   │
│ │ • Focus on breath                                     │   │
│ │ • Non-judgmental observation                          │   │
│ │ • Gentle return to awareness                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Audio File (MP3)                                              │
│ [Browse Files...] meditation-day1.mp3 [Remove]               │
│                                                               │
│ Background Image (Optional)                                   │
│ [Browse Files...] No file selected                           │
│                                                               │
│ Layout Type                                                   │
│ [Standard ▼] (Standard, Overflow, Minimal)                   │
│                                                               │
│ Icons (Material Symbols)                                      │
│ [check_circle_unread] [+] [clock_arrow_up] [+]               │
│                                                               │
│ [Cancel]                    [Preview] [Save Slide]           │
└─────────────────────────────────────────────────────────────┘
```

#### Editor Features
- **Rich Text Editor**: Support for formatting, headings, lists, links
- **Media Upload**: Audio files (MP3) and images
- **Live Preview**: Show how slide will appear on frontend
- **Icon Selection**: Choose up to 3 Material Symbols icons
- **Layout Templates**: Standard (centered), Overflow (scrollable), Minimal (title + audio only)

---

## Frontend Integration

### Current State
Currently, slides are hardcoded in `MainContent.tsx` (lines 31-244):
```tsx
<SwiperSlide>
  <div className="h-full overflow-y-auto p-4 flex flex-col justify-center">
    <h1>Audio Library</h1>
    <EssentialAudioPlayer audioUrl="/media/meditation-sample.mp3" />
    <p>Browse meditation tracks...</p>
  </div>
</SwiperSlide>
```

### New Dynamic System

#### Component Architecture
```
MainContent.tsx (Modified)
├── Fetch slide_rows from API (published only)
├── Map each slide_row to Swiper instance
│   ├── Horizontal Swiper per row
│   ├── Fetch slides for each row
│   └── Render slides dynamically
└── Preserve existing Swiper navigation (arrows, touch)
```

#### Data Flow
1. **Page Load**: `MainContent.tsx` calls `/api/slides/rows?published=true`
2. **API Response**: Returns array of published slide rows with slide count
3. **Row Rendering**: For each row, render a horizontal Swiper section
4. **Slide Fetching**: Lazy load slides for each row via `/api/slides/rows/[id]/slides`
5. **Navigation**: Footer arrows navigate between rows (vertical) and within rows (horizontal)

#### Code Structure (Conceptual)

```tsx
// MainContent.tsx (New Dynamic Version)
'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import EssentialAudioPlayer from './EssentialAudioPlayer';

interface SlideRow {
  id: string;
  title: string;
  row_type: string;
  slide_count: number;
  icon_set: string[];
}

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  body_content: string;
  audio_url?: string;
  image_url?: string;
  layout_type: string;
  position: number;
}

export default function MainContent({ setSwiperRef, handleSlideChange }) {
  const [slideRows, setSlideRows] = useState<SlideRow[]>([]);
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [slides, setSlides] = useState<Record<string, Slide[]>>({});

  // Fetch published slide rows on mount
  useEffect(() => {
    fetch('/api/slides/rows?published=true')
      .then(res => res.json())
      .then(data => {
        setSlideRows(data.rows);
        // Load slides for first row
        if (data.rows.length > 0) {
          loadSlidesForRow(data.rows[0].id);
        }
      });
  }, []);

  const loadSlidesForRow = async (rowId: string) => {
    if (slides[rowId]) return; // Already loaded

    const res = await fetch(`/api/slides/rows/${rowId}/slides`);
    const data = await res.json();
    setSlides(prev => ({ ...prev, [rowId]: data.slides }));
  };

  return (
    <main className="absolute inset-0 overflow-hidden" style={{padding: '50px'}}>
      {/* Vertical Swiper - one slide per row */}
      <Swiper
        direction="vertical"
        spaceBetween={20}
        slidesPerView={1}
        onSlideChange={(swiper) => {
          setActiveRowIndex(swiper.activeIndex);
          const activeRow = slideRows[swiper.activeIndex];
          if (activeRow) loadSlidesForRow(activeRow.id);
        }}
      >
        {slideRows.map((row) => (
          <SwiperSlide key={row.id}>
            <div className="h-full">
              <h2 className="text-2xl font-bold mb-4">{row.title}</h2>

              {/* Horizontal Swiper - slides within this row */}
              <Swiper
                direction="horizontal"
                spaceBetween={20}
                slidesPerView={1}
                className="h-full"
              >
                {(slides[row.id] || []).map((slide) => (
                  <SwiperSlide key={slide.id}>
                    <div className="h-full overflow-y-auto p-4 flex flex-col justify-center">
                      {/* Icons */}
                      <div className="flex justify-start gap-4 mb-4">
                        {row.icon_set.map((icon, idx) => (
                          <span key={idx} className="material-symbols-rounded">
                            {icon}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h1 className="text-4xl font-bold mb-4">{slide.title}</h1>

                      {/* Audio Player */}
                      {slide.audio_url && (
                        <EssentialAudioPlayer
                          audioUrl={slide.audio_url}
                          preload={true}
                          className="max-w-md mb-4"
                        />
                      )}

                      {/* Body Content */}
                      <div
                        className="text-black space-y-4"
                        dangerouslySetInnerHTML={{ __html: slide.body_content }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </main>
  );
}
```

---

## API Endpoints

### 1. Get All Slide Rows
**Endpoint**: `GET /api/slides/rows`
**Query Params**: `?published=true` (optional)

**Response**:
```json
{
  "status": "success",
  "rows": [
    {
      "id": "uuid-1",
      "title": "Morning Meditation Sequence",
      "description": "8-day meditation routine",
      "row_type": "ROUTINE",
      "is_published": true,
      "display_order": 0,
      "slide_count": 8,
      "icon_set": ["check_circle_unread", "clock_arrow_up"],
      "theme_color": "#dc2626",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Get Slides for a Row
**Endpoint**: `GET /api/slides/rows/[id]/slides`

**Response**:
```json
{
  "status": "success",
  "slides": [
    {
      "id": "slide-1",
      "title": "Introduction to Mindfulness",
      "subtitle": "Day 1: Setting Your Intention",
      "body_content": "<p>Welcome to your journey...</p>",
      "audio_url": "/media/meditation-day1.mp3",
      "image_url": null,
      "position": 1,
      "layout_type": "STANDARD",
      "view_count": 245
    }
  ]
}
```

### 3. Create Slide Row
**Endpoint**: `POST /api/slides/rows`
**Body**:
```json
{
  "title": "Morning Meditation Sequence",
  "description": "8-day meditation routine",
  "row_type": "ROUTINE",
  "icon_set": ["check_circle_unread", "clock_arrow_up"],
  "theme_color": "#dc2626",
  "display_order": 0,
  "is_published": false
}
```

### 4. Update Slide Row
**Endpoint**: `PATCH /api/slides/rows/[id]`

### 5. Delete Slide Row
**Endpoint**: `DELETE /api/slides/rows/[id]`

### 6. Create Slide
**Endpoint**: `POST /api/slides/rows/[rowId]/slides`
**Body**:
```json
{
  "title": "Introduction to Mindfulness",
  "subtitle": "Day 1",
  "body_content": "<p>Welcome...</p>",
  "audio_url": "/media/meditation-day1.mp3",
  "position": 1,
  "layout_type": "STANDARD"
}
```

### 7. Update Slide
**Endpoint**: `PATCH /api/slides/rows/[rowId]/slides/[slideId]`

### 8. Delete Slide
**Endpoint**: `DELETE /api/slides/rows/[rowId]/slides/[slideId]`

### 9. Reorder Slides
**Endpoint**: `POST /api/slides/rows/[rowId]/slides/reorder`
**Body**:
```json
{
  "slide_ids": ["slide-3", "slide-1", "slide-2"]
}
```

---

## UI Component Specifications

### Existing Components to Leverage
1. **AdminTopIconBar, AdminBottomIconBar**: Header/footer navigation
2. **AdminMainContent**: Replace with slide management interface
3. **ThemeContext**: Light/dark theme support
4. **Material Symbols Icons**: Icon selection UI
5. **Essential Audio Player**: Audio preview in slide editor

### New Components to Create

#### 1. `SlideRowList.tsx`
- Displays all slide rows in card format
- Filter by type, sort by date/title
- Quick action buttons (Edit, Manage, Delete)

#### 2. `SlideRowForm.tsx`
- Create/edit slide row metadata
- Icon picker component
- Color picker component
- Form validation

#### 3. `SlideManager.tsx`
- List all slides in a row
- Drag-and-drop reordering
- Quick edit/delete actions
- Add new slide button

#### 4. `SlideEditor.tsx`
- Rich text editor (TinyMCE, Quill, or Tiptap)
- Audio/image file upload
- Icon selection
- Live preview panel

#### 5. `SlidePreview.tsx`
- Shows how slide will appear on frontend
- Responsive design preview (desktop/mobile)
- Real-time updates as editor changes

---

## Technical Implementation Details

### Technology Stack
- **Frontend**: Next.js 15.5.4, React 19.1.0, TypeScript
- **UI Library**: Tailwind CSS v3, Material Symbols Icons
- **Swiper**: Swiper.js 12.0.2 (already integrated)
- **Database**: PostgreSQL with `pg` client
- **Rich Text Editor**: TBD (Tiptap recommended - lightweight, headless)
- **File Upload**: Next.js API routes + file system storage (future: S3)

### File Structure
```
src/
├── app/
│   ├── admin/
│   │   ├── slides/
│   │   │   ├── page.tsx              (List view)
│   │   │   ├── new/
│   │   │   │   └── page.tsx          (Create row)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          (Manage slides)
│   │   │       └── slide/
│   │   │           └── [slideId]/
│   │   │               └── page.tsx  (Edit slide)
│   └── api/
│       └── slides/
│           ├── rows/
│           │   ├── route.ts          (GET all, POST create)
│           │   └── [id]/
│           │       ├── route.ts      (GET one, PATCH, DELETE)
│           │       └── slides/
│           │           ├── route.ts  (GET slides, POST create)
│           │           └── [slideId]/
│           │               └── route.ts (PATCH, DELETE)
│           └── upload/
│               └── route.ts          (File upload handler)
├── components/
│   ├── admin/
│   │   ├── slides/
│   │   │   ├── SlideRowList.tsx
│   │   │   ├── SlideRowForm.tsx
│   │   │   ├── SlideManager.tsx
│   │   │   ├── SlideEditor.tsx
│   │   │   ├── SlidePreview.tsx
│   │   │   ├── IconPicker.tsx
│   │   │   └── AudioUploader.tsx
│   └── MainContent.tsx               (Modified for dynamic slides)
└── lib/
    └── queries/
        ├── slideRows.ts              (Database queries for rows)
        └── slides.ts                 (Database queries for slides)
```

### Database Query Functions

**`lib/queries/slideRows.ts`**
```typescript
import { query, queryOne, transaction } from '@/lib/db';

export async function getAllSlideRows(publishedOnly = false) {
  const sql = publishedOnly
    ? 'SELECT * FROM slide_rows WHERE is_published = true ORDER BY display_order, created_at DESC'
    : 'SELECT * FROM slide_rows ORDER BY display_order, created_at DESC';

  return await query(sql);
}

export async function getSlideRowById(id: string) {
  return await queryOne('SELECT * FROM slide_rows WHERE id = $1', [id]);
}

export async function createSlideRow(data: {
  title: string;
  description?: string;
  row_type: string;
  icon_set?: string[];
  theme_color?: string;
  display_order?: number;
  is_published?: boolean;
  created_by?: string;
}) {
  const sql = `
    INSERT INTO slide_rows (title, description, row_type, icon_set, theme_color, display_order, is_published, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  return await queryOne(sql, [
    data.title,
    data.description || null,
    data.row_type,
    JSON.stringify(data.icon_set || []),
    data.theme_color || null,
    data.display_order || 0,
    data.is_published || false,
    data.created_by || null,
  ]);
}

export async function updateSlideRow(id: string, data: Partial<SlideRow>) {
  const fields = Object.keys(data);
  const values = Object.values(data);

  const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
  const sql = `UPDATE slide_rows SET ${setClause} WHERE id = $1 RETURNING *`;

  return await queryOne(sql, [id, ...values]);
}

export async function deleteSlideRow(id: string) {
  await query('DELETE FROM slide_rows WHERE id = $1', [id]);
}
```

**`lib/queries/slides.ts`**
```typescript
export async function getSlidesForRow(rowId: string) {
  return await query(
    'SELECT * FROM slides WHERE slide_row_id = $1 ORDER BY position',
    [rowId]
  );
}

export async function createSlide(data: {
  slide_row_id: string;
  title: string;
  subtitle?: string;
  body_content: string;
  audio_url?: string;
  image_url?: string;
  position: number;
  layout_type?: string;
}) {
  const sql = `
    INSERT INTO slides (slide_row_id, title, subtitle, body_content, audio_url, image_url, position, layout_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  return await queryOne(sql, [
    data.slide_row_id,
    data.title,
    data.subtitle || null,
    data.body_content,
    data.audio_url || null,
    data.image_url || null,
    data.position,
    data.layout_type || 'STANDARD',
  ]);
}

export async function reorderSlides(slideIds: string[]) {
  // Use transaction to update positions atomically
  return await transaction(async (client) => {
    for (let i = 0; i < slideIds.length; i++) {
      await client.query(
        'UPDATE slides SET position = $1 WHERE id = $2',
        [i + 1, slideIds[i]]
      );
    }
  });
}
```

---

## Development Phases

### Phase 1: Database Setup (Week 1)
**Tasks:**
1. ✅ Create database migration script for new tables
2. ✅ Add triggers for auto-updating slide counts
3. ✅ Create database query helper functions
4. ✅ Seed sample data (2 slide rows with 5 slides each)
5. ✅ Test database operations

**Deliverables:**
- `scripts/init-slide-tables.ts`
- `lib/queries/slideRows.ts`
- `lib/queries/slides.ts`

---

### Phase 2: API Endpoints (Week 1-2)
**Tasks:**
1. ✅ Create `/api/slides/rows` endpoints (GET, POST)
2. ✅ Create `/api/slides/rows/[id]` endpoints (GET, PATCH, DELETE)
3. ✅ Create `/api/slides/rows/[id]/slides` endpoints (GET, POST)
4. ✅ Create `/api/slides/rows/[rowId]/slides/[slideId]` endpoints (PATCH, DELETE)
5. ✅ Create `/api/slides/upload` for file uploads
6. ✅ Add error handling and validation
7. ✅ Test all endpoints with Postman/curl

**Deliverables:**
- Complete API route structure
- API documentation
- Postman collection for testing

---

### Phase 3: Admin UI - List & Forms (Week 2-3)
**Tasks:**
1. ✅ Create `/admin/slides` page (list view)
2. ✅ Build `SlideRowList.tsx` component
3. ✅ Create `/admin/slides/new` page (create form)
4. ✅ Build `SlideRowForm.tsx` component
5. ✅ Build `IconPicker.tsx` component
6. ✅ Add filtering and sorting to list view
7. ✅ Integrate with API endpoints
8. ✅ Add delete confirmation modals
9. ✅ Style with Tailwind (match existing admin theme)

**Deliverables:**
- Functional slide row management (CRUD)
- Admin navigation updated with "Slides" link

---

### Phase 4: Admin UI - Slide Management (Week 3-4)
**Tasks:**
1. ✅ Create `/admin/slides/[id]` page (manage slides)
2. ✅ Build `SlideManager.tsx` component
3. ✅ Implement drag-and-drop reordering (react-beautiful-dnd or @dnd-kit)
4. ✅ Add slide CRUD operations
5. ✅ Create `/admin/slides/[id]/slide/[slideId]` page (slide editor)
6. ✅ Build `SlideEditor.tsx` with rich text editor
7. ✅ Build `AudioUploader.tsx` component
8. ✅ Build `SlidePreview.tsx` component
9. ✅ Test slide creation and editing workflow

**Deliverables:**
- Complete slide management interface
- Rich text editing capability
- Audio file upload functionality

---

### Phase 5: Frontend Integration (Week 4-5)
**Tasks:**
1. ✅ Modify `MainContent.tsx` to fetch dynamic slides
2. ✅ Implement vertical Swiper for slide rows
3. ✅ Implement horizontal Swiper for slides within rows
4. ✅ Update `SwiperContext` for multi-level navigation
5. ✅ Update footer arrows to handle row/slide navigation
6. ✅ Add loading states and error handling
7. ✅ Test responsive behavior (desktop/mobile)
8. ✅ Optimize performance (lazy loading, caching)

**Deliverables:**
- Fully dynamic frontend slide system
- Seamless navigation between rows and slides
- Backward compatibility with existing features

---

### Phase 6: Polish & Deployment (Week 5-6)
**Tasks:**
1. ✅ Add slide view tracking (increment `view_count`)
2. ✅ Add admin analytics dashboard for slide performance
3. ✅ Implement slide search functionality
4. ✅ Add bulk operations (publish multiple rows)
5. ✅ Optimize database queries (add indexes)
6. ✅ Write user documentation
7. ✅ Perform security audit (SQL injection, XSS prevention)
8. ✅ Deploy to Railway with database migrations
9. ✅ User acceptance testing

**Deliverables:**
- Production-ready slide management system
- Documentation for admins
- Railway deployment

---

## Migration Strategy

### Preserving Existing Slides
To avoid disrupting the current frontend, we'll migrate existing hardcoded slides to the database:

**Migration Script: `scripts/migrate-existing-slides.ts`**
```typescript
import { createSlideRow, createSlide } from '@/lib/queries/slideRows';

async function migrateExistingSlides() {
  // Create "Legacy Content" row
  const legacyRow = await createSlideRow({
    title: 'Legacy Content',
    description: 'Original hardcoded slides',
    row_type: 'CUSTOM',
    icon_set: ['check_circle_unread', 'clock_arrow_up', 'select_check_box'],
    is_published: true,
    display_order: 0,
  });

  // Migrate existing slides
  const slides = [
    {
      title: 'Audio Library',
      body_content: '<p>Browse meditation tracks, yoga sessions, and spiritual courses.</p>',
      audio_url: '/media/meditation-sample.mp3',
      position: 1,
    },
    {
      title: 'Playlists',
      body_content: '<p>Create and manage your personal playlists...</p>',
      audio_url: '/media/playlist-sample.mp3',
      position: 2,
    },
    {
      title: 'Service Commitments',
      body_content: '<p>Daily service prompts and spiritual practices...</p>',
      audio_url: '/media/service-sample.mp3',
      position: 3,
    },
    {
      title: 'Spiritual Teachings',
      body_content: '<p>Welcome to our comprehensive collection...</p>',
      audio_url: '/media/meditation-sample.mp3',
      position: 4,
      layout_type: 'OVERFLOW',
    },
  ];

  for (const slide of slides) {
    await createSlide({
      slide_row_id: legacyRow.id,
      ...slide,
    });
  }

  console.log('✅ Migration complete!');
}
```

### Deployment Steps
1. **Database Migration**: Run `scripts/init-slide-tables.ts` on production
2. **Data Migration**: Run `scripts/migrate-existing-slides.ts` to import legacy content
3. **Code Deployment**: Deploy new admin UI and modified `MainContent.tsx`
4. **Testing**: Verify all slides appear correctly on frontend
5. **Admin Training**: Train admins on new slide management system
6. **Monitor**: Watch for errors, performance issues

---

## Security Considerations

### 1. Authentication & Authorization
- **Admin-Only Access**: Require authentication for `/admin/slides/*` routes
- **Role-Based Access**: Only `ADMIN` and `MODERATOR` roles can manage slides
- **API Security**: Validate user session on all API endpoints

### 2. Input Validation
- **SQL Injection**: Use parameterized queries (already implemented)
- **XSS Prevention**: Sanitize HTML content before rendering
- **File Upload**: Validate file types (only MP3, JPG, PNG), limit file size
- **Path Traversal**: Validate file paths to prevent directory access

### 3. Rate Limiting
- **API Rate Limits**: Prevent abuse of create/update endpoints
- **Upload Limits**: Max 10MB per file, max 5 uploads per minute

### 4. Content Security
- **HTML Sanitization**: Use DOMPurify or similar library on `body_content`
- **CSP Headers**: Prevent inline script execution
- **Audit Logging**: Track who created/edited slides for accountability

---

## Future Enhancements

### Version 2.0 Features
1. **User Progress Tracking**: Track which slides users have viewed/completed
2. **Slide Scheduling**: Publish slides on specific dates (e.g., daily release)
3. **A/B Testing**: Test different slide variations for engagement
4. **Slide Templates**: Predefined layouts for quick creation
5. **Multilingual Support**: Translate slides into multiple languages
6. **Advanced Analytics**: Heatmaps, completion rates, user paths
7. **Collaboration**: Multiple admins can edit slides simultaneously
8. **Version History**: Track changes and revert to previous versions
9. **Comments/Feedback**: Users can comment on slides
10. **Export/Import**: Bulk export slides as JSON/CSV

### Version 3.0 Features
1. **AI-Powered Content**: Generate slide content using GPT
2. **Video Support**: Add video players alongside audio
3. **Interactive Elements**: Quizzes, polls, reflection prompts
4. **Gamification**: Badges, streaks, achievements for slide completion
5. **Social Sharing**: Share favorite slides on social media
6. **Mobile App Integration**: Dedicated iOS/Android apps

---

## Success Metrics

### KPIs for Launch
1. **Admin Efficiency**: Reduce slide creation time from N/A (hardcoded) to <5 minutes per slide
2. **Content Velocity**: Enable 10+ new slides per week
3. **User Engagement**: Track average slides viewed per session
4. **Slide Performance**: Identify top-performing slides by view count
5. **Error Rate**: <1% API error rate, zero data loss incidents

### Monitoring Tools
- **Database Metrics**: Query performance, connection pool usage
- **API Metrics**: Request rate, response time, error rate
- **Frontend Metrics**: Page load time, Swiper navigation performance
- **User Metrics**: Slide views, completion rates, bounce rates

---

## Questions & Decisions

### Open Questions
1. **Rich Text Editor**: Which library? (Tiptap, Quill, TinyMCE)
2. **File Storage**: Local filesystem or S3/Cloudinary for production?
3. **Drag-and-Drop Library**: react-beautiful-dnd vs @dnd-kit?
4. **Slide Limit**: Max slides per row? (e.g., 50 slides)
5. **Caching Strategy**: Redis for slide data? Client-side caching?

### Decisions Made
- ✅ **Database**: PostgreSQL (existing infrastructure)
- ✅ **Styling**: Tailwind CSS (existing design system)
- ✅ **Navigation**: Swiper.js (already integrated)
- ✅ **Icons**: Material Symbols (existing icon library)
- ✅ **Theme**: Light/Dark mode support (existing ThemeContext)

---

## Conclusion

This specification outlines a comprehensive, scalable slide management system that transforms the frontend from hardcoded content to a dynamic, admin-controlled platform. The system is designed to:

- **Preserve existing functionality** while adding powerful content management
- **Leverage existing infrastructure** (database, UI components, navigation)
- **Enable rapid content creation** for admins
- **Support future growth** with extensible architecture

**Next Steps:**
1. Review and approve this specification
2. Begin Phase 1 (Database Setup)
3. Set up project board for task tracking
4. Schedule weekly progress reviews

---

## Appendix

### A. Database Schema Diagram
```
┌─────────────────┐         ┌──────────────────┐
│  slide_rows     │         │     slides       │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │<────────│ slide_row_id (FK)│
│ title           │         │ id (PK)          │
│ description     │         │ title            │
│ row_type        │         │ subtitle         │
│ icon_set        │         │ body_content     │
│ theme_color     │         │ audio_url        │
│ slide_count     │         │ position         │
│ is_published    │         │ layout_type      │
│ display_order   │         │ view_count       │
│ created_by (FK) │         │ created_at       │
│ created_at      │         │ updated_at       │
│ updated_at      │         └──────────────────┘
└─────────────────┘
         │
         │ (FK)
         ▼
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ username        │
│ role            │
└─────────────────┘
```

### B. API Endpoint Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slides/rows` | List all slide rows |
| POST | `/api/slides/rows` | Create new slide row |
| GET | `/api/slides/rows/[id]` | Get single slide row |
| PATCH | `/api/slides/rows/[id]` | Update slide row |
| DELETE | `/api/slides/rows/[id]` | Delete slide row |
| GET | `/api/slides/rows/[id]/slides` | Get slides for row |
| POST | `/api/slides/rows/[id]/slides` | Create slide in row |
| GET | `/api/slides/rows/[rowId]/slides/[slideId]` | Get single slide |
| PATCH | `/api/slides/rows/[rowId]/slides/[slideId]` | Update slide |
| DELETE | `/api/slides/rows/[rowId]/slides/[slideId]` | Delete slide |
| POST | `/api/slides/rows/[id]/slides/reorder` | Reorder slides |
| POST | `/api/slides/upload` | Upload audio/image files |

### C. File Upload Specifications
- **Allowed Audio Formats**: MP3, WAV, OGG
- **Max Audio Size**: 10MB
- **Allowed Image Formats**: JPG, PNG, WebP
- **Max Image Size**: 5MB
- **Storage Path**: `/public/media/slides/[row-id]/[filename]`
- **Naming Convention**: `[row-id]_[slide-position]_[timestamp].[ext]`

### D. Browser Support
- **Chrome**: ✅ Latest 2 versions
- **Firefox**: ✅ Latest 2 versions
- **Safari**: ✅ Latest 2 versions
- **Edge**: ✅ Latest 2 versions
- **Mobile Safari**: ✅ iOS 14+
- **Mobile Chrome**: ✅ Android 10+

---

**Document Version**: 1.0
**Last Updated**: 2025-10-14
**Author**: Claude (AI Assistant)
**Status**: Draft - Awaiting Approval
