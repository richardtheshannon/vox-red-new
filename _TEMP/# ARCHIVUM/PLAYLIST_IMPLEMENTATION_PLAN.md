# Playlist Feature Implementation Plan

## Overview
Add a playlist feature that automatically plays slide audio files (mp3s) in sequence, with configurable delays between tracks, respecting scheduling filters and user navigation.

---

## Feature Requirements Summary

### Core Behavior
- Click `playlist_play` icon to start playlist mode on current row
- Play each slide's mp3 from start to finish
- Auto-advance to next slide after audio completes + configured delay
- Skip slides without `audio_url` automatically
- Respect scheduling filters (time/day publishing rules)
- Loop back to first slide and stop when reaching end of row
- Use existing Swiper slide transition for auto-navigation

### User Interactions
- **Play**: `playlist_play` icon starts playlist
- **Pause**: Icon changes to `pause` icon; pauses current audio in place
- **Resume**: Click `pause` icon to resume from paused position
- **Manual Navigation**: Any manual navigation (arrows, swipe, row change) stops playlist immediately
- **Icon Visibility**: Only show icon when current row has ≥1 slide with audio

### Admin Configuration
- **Delay Setting**: Dropdown in "Edit Slide Row" page
- **Options**: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45 seconds
- **Behavior**: Delay applies between audio completion and next slide advance (playlist mode only)

---

## Implementation Steps

### 1. Database Schema Updates

#### 1.1 Add `playlist_delay_seconds` to `slide_rows` table
**File**: New migration script in `_TEMP/` or direct SQL
```sql
ALTER TABLE slide_rows
ADD COLUMN playlist_delay_seconds INTEGER DEFAULT 0;
```

**Validation**:
- Default value: 0 (no delay)
- Valid range: 0-45
- Non-nullable

---

### 2. Backend API Updates

#### 2.1 Update Slide Row Query Functions
**File**: `src/lib/queries/slideRows.ts`

**Changes**:
- Add `playlist_delay_seconds` to SELECT queries in:
  - `getSlideRows()`
  - `getSlideRowById()`
  - `createSlideRow()`
  - `updateSlideRow()`

**Impact**: Low risk - additive change only

---

#### 2.2 Update API Endpoints
**Files**:
- `src/app/api/slides/rows/route.ts` (GET, POST)
- `src/app/api/slides/rows/[id]/route.ts` (GET, PATCH)

**Changes**:
- Include `playlist_delay_seconds` in response data
- Accept `playlist_delay_seconds` in POST/PATCH requests
- Validate range (0-45) in PATCH/POST handlers

**Impact**: Low risk - extends existing endpoints

---

### 3. Admin Interface Updates

#### 3.1 Add Delay Dropdown to Slide Row Editor
**File**: `src/app/admin/slides/[id]/page.tsx`

**Changes**:
- Add delay dropdown after existing form fields
- Options: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45] seconds
- Label: "Playlist Delay (seconds)"
- Description: "Pause duration between audio tracks in playlist mode"
- Save/load `playlist_delay_seconds` field

**UI Location**: Below existing fields (theme_color, row_type, etc.)

**Impact**: Low risk - isolated to edit form

---

### 4. Frontend Playlist Logic

#### 4.1 Create Playlist Context/Hook
**File**: New file `src/contexts/PlaylistContext.tsx`

**State Management**:
```typescript
{
  isPlaylistActive: boolean,
  isPaused: boolean,
  currentRowId: number | null,
  audioRef: HTMLAudioElement | null,
  delayTimeoutId: NodeJS.Timeout | null
}
```

**Functions**:
- `startPlaylist(rowId: number, delaySeconds: number)` - Initialize playlist
- `pausePlaylist()` - Pause current audio
- `resumePlaylist()` - Resume from pause
- `stopPlaylist()` - Stop and reset
- `playNextSlide()` - Advance to next slide with audio
- `handleAudioEnded()` - Called when audio completes (applies delay, then advances)

**Dependencies**:
- `SwiperContext` - For slide navigation
- Schedule filter utility - To get visible slides only

**Impact**: Medium risk - new core feature logic

---

#### 4.2 Update TopIconBar Component
**File**: `src/components/TopIconBar.tsx`

**Changes**:
- Import `PlaylistContext`
- Conditionally render icon:
  - Show only if current row has ≥1 slide with `audio_url` (after schedule filtering)
  - `playlist_play` icon when inactive
  - `pause` icon when active
- Click handlers:
  - `playlist_play` → `startPlaylist()`
  - `pause` → toggle `pausePlaylist()` / `resumePlaylist()`
- Get `playlist_delay_seconds` from current row data

**Icon Logic**:
```typescript
const hasAudioSlides = visibleSlides.some(slide => slide.audio_url)
const icon = isPlaylistActive ? 'pause' : 'playlist_play'
```

**Impact**: Low-medium risk - modifies existing component

---

#### 4.3 Update MainContent Audio Player
**File**: `src/components/MainContent.tsx`

**Changes**:
- Import `PlaylistContext`
- Pass `audioRef` to context when audio element mounts
- Attach `onEnded` event → `handleAudioEnded()` (only in playlist mode)
- Stop playlist on manual slide change (detect via Swiper events)
- Stop playlist on row change

**Audio Event Handling**:
```typescript
<audio
  ref={(el) => {
    audioRef.current = el
    setPlaylistAudioRef(el) // Pass to context
  }}
  onEnded={isPlaylistActive ? handleAudioEnded : undefined}
/>
```

**Navigation Detection**:
- Listen to Swiper `slideChange` event
- If change not triggered by playlist → `stopPlaylist()`

**Impact**: Medium risk - modifies core rendering component

---

#### 4.4 Playlist Advancement Logic
**Implementation in PlaylistContext**:

1. **Audio Ends** → `handleAudioEnded()` called
2. **Apply Delay** → `setTimeout(delaySeconds * 1000)`
3. **Find Next Slide**:
   - Get all visible slides (schedule-filtered)
   - Filter slides with `audio_url`
   - Find current index
   - Get next index (or loop to 0 if at end)
4. **Navigate**:
   - If next index === 0 (looped) → Stop playlist
   - Else → `swiper.slideTo(nextIndex)` + start audio
5. **Handle Skips**:
   - If advanced slide has no audio → recursively call `playNextSlide()`

**Edge Cases**:
- All slides filtered out by schedule → Don't show icon
- Only one slide with audio → Loop to same slide and stop
- User navigates during delay → Clear timeout, stop playlist

**Impact**: Medium risk - complex state management

---

### 5. TypeScript Type Updates

#### 5.1 Update SlideRow Interface
**File**: `src/types/` or inline in components

**Changes**:
```typescript
interface SlideRow {
  // ... existing fields
  playlist_delay_seconds: number
}
```

**Impact**: Low risk - type safety improvement

---

### 6. Testing & Validation

#### 6.1 Database Migration Test
- [ ] Run migration locally
- [ ] Verify default value (0) applied to existing rows
- [ ] Test Railway compatibility (idempotent)

#### 6.2 Admin Interface Test
- [ ] Create new row with delay setting
- [ ] Edit existing row delay setting
- [ ] Verify saved value persists
- [ ] Test all delay options (0-45)

#### 6.3 Playlist Functionality Test
- [ ] Start playlist on row with multiple audio slides
- [ ] Verify auto-advance after audio + delay
- [ ] Test pause/resume maintains position
- [ ] Verify skip behavior for slides without audio
- [ ] Test loop-back-and-stop at end
- [ ] Manual navigation stops playlist
- [ ] Row change stops playlist
- [ ] Icon visibility with/without audio slides
- [ ] Schedule filtering applied correctly

#### 6.4 Edge Cases
- [ ] Row with no audio slides → Icon hidden
- [ ] Row with one audio slide → Loops and stops
- [ ] Navigate during delay period → Timeout cleared
- [ ] Quick Slide mode compatibility
- [ ] Spa mode playing simultaneously (may need logic)

---

## File Modification Summary

### New Files (1)
- `src/contexts/PlaylistContext.tsx` - Playlist state management

### Modified Files (7)
1. `src/lib/queries/slideRows.ts` - Add field to queries
2. `src/app/api/slides/rows/route.ts` - Include field in API
3. `src/app/api/slides/rows/[id]/route.ts` - Include field in API
4. `src/app/admin/slides/[id]/page.tsx` - Add delay dropdown
5. `src/components/TopIconBar.tsx` - Icon logic + click handlers
6. `src/components/MainContent.tsx` - Audio ref + event handling
7. Database migration script (new SQL file or direct execution)

### Context Dependencies
- Uses existing: `SwiperContext`, `ThemeContext`
- New: `PlaylistContext`

---

## Risk Assessment

### Low Risk
- Database schema addition (non-breaking)
- Admin form updates (isolated)
- Type definitions

### Medium Risk
- PlaylistContext implementation (new feature logic)
- MainContent audio integration (core component)
- State synchronization between contexts

### Mitigation Strategies
- Thorough testing with schedule filtering
- Clear timeout cleanup on unmount
- Playlist stop on any unexpected state change
- Console logging for debugging (removable later)

---

## Implementation Order

1. **Database** → Migration + verify
2. **Backend** → Query functions + API endpoints
3. **Types** → Update SlideRow interface
4. **Admin** → Add delay dropdown to edit form
5. **Frontend Core** → Create PlaylistContext
6. **Frontend UI** → Update TopIconBar icon logic
7. **Frontend Integration** → Update MainContent audio handling
8. **Testing** → All scenarios from section 6
9. **Cleanup** → Remove debug logs, verify TypeScript

---

## Deployment Checklist

- [ ] TypeScript validation: `npx tsc --noEmit` (0 errors)
- [ ] Lint check: `npm run lint` (0 errors)
- [ ] Local build test: `npm run build`
- [ ] Database migration applied locally
- [ ] All test scenarios passed
- [ ] Railway migration compatibility verified
- [ ] No breaking changes to existing features

---

**Total Estimated Changes**: ~8 files modified/created
**Estimated Complexity**: Medium
**Estimated Time**: 2-3 hours implementation + 1 hour testing

---

**Created**: November 3, 2025
**Status**: Ready for Implementation
