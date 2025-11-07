# Playlist Feature - Technical Troubleshooting Document

**Date Created:** November 3, 2025
**Last Updated:** November 3, 2025 (Night Session #2)
**Status:** Partial Implementation - Row 1 Works, Row 2 Plays Row 1's Audio
**Current Issue:** Row 2 playlist plays Row 1's audio files instead of Row 2's audio files

---

## Feature Overview

Auto-playing audio playlist for slide rows with configurable inter-track delays (0-45 seconds).

### User Flow
1. User navigates to a slide row that contains audio files
2. Playlist icon (`playlist_play`) appears in top left icon bar
3. User clicks icon to start playlist
4. Audio plays from current slide, then auto-advances to next audio slide after configured delay
5. User can pause/resume with same icon (toggles to `pause` when playing)
6. Manual navigation or row change stops playlist

---

## Implementation Status

### ✅ Completed Components

#### 1. Database Schema
**File:** `scripts/run-playlist-migration.ts`
- Added `playlist_delay_seconds` INTEGER column (default: 0)
- Added CHECK constraint (0-45 range)
- Migration successfully run locally

#### 2. Backend Data Layer
**File:** `src/lib/queries/slideRows.ts`
- Updated `SlideRow` interface with `playlist_delay_seconds: number`
- Updated `CreateSlideRowData` and `UpdateSlideRowData` interfaces
- Modified `createSlideRow()` and `updateSlideRow()` queries

#### 3. API Endpoints
**Files:**
- `src/app/api/slides/rows/route.ts` (POST)
- `src/app/api/slides/rows/[id]/route.ts` (PATCH)
- Both accept and validate `playlist_delay_seconds` (0-45 range)

#### 4. Admin Interface
**File:** `src/components/admin/slides/SlideRowForm.tsx`
- Added dropdown after "Display Order" field
- Options: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45] seconds
- Label: "Playlist Delay (seconds)"

#### 5. Playlist Context
**File:** `src/contexts/PlaylistContext.tsx`
- State: `isPlaylistActive`, `isPaused`, `currentRowId`
- Functions: `startPlaylist()`, `pausePlaylist()`, `resumePlaylist()`, `stopPlaylist()`, `setAudioRef()`
- Auto-advance logic with `handleAudioEnded()`
- Integrates with schedule filters via `filterVisibleSlides()`
- **Enhanced Debug Logging:** Comprehensive logs for audio ref state, play attempts, and errors (Nov 3)

#### 6. UI Components
**Files:**
- `src/components/TopIconBar.tsx` - Icon visibility & click handlers
- `src/components/EssentialAudioPlayer.tsx` - Audio ref callback with enhanced debug logging (Nov 3)
- `src/components/MainContent.tsx` - Playlist data updates & audio ref management (Nov 3)
- `src/app/page.tsx` - PlaylistProvider wrapper

---

## Current Status Summary (Nov 3 Night #2)

### ✅ What's Working
1. **Playlist icon shows/hides correctly** based on audio slide presence
2. **Icon toggles to pause** when playlist is active
3. **Audio DOES play** when playlist icon is clicked
4. **Comprehensive debug logging** implemented throughout the audio ref flow
5. **Row 1 playlist works correctly** - plays Row 1's audio files

### ❌ What's NOT Working
1. **CRITICAL: Row 2 plays Row 1's audio** - When on Row 2 and clicking playlist icon, Row 1's audio files play instead of Row 2's audio files
2. **Multi-row support broken** - DOM query not properly scoped to active row's swiper

### 🔧 Progress Made This Session

#### Issue #1: Audio Ref Never Set (FIXED ✅)
**Symptoms:**
- `[AudioPlayer] ⚠️ Not calling onAudioRefChange`
- `[Playlist] ⚠️ Audio ref not available`

**Root Cause:** Viewport detection mismatch
- Desktop viewport renders `isMobile=false` swiper
- Mobile viewport renders `isMobile=true` swiper
- Both render simultaneously (one hidden by CSS)
- Original logic: `row.id === activeRowId && isMobile === isMobileViewport`
- Problem: `isMobileViewport` state updated AFTER initial render
- Result: Audio ref callback never fired because conditions never matched

**Fix Applied:**
- Removed viewport detection state entirely
- Added `enableAudioRef` parameter to `renderSlideContent()` and `renderHorizontalSwiper()`
- Desktop swiper: `enableAudioRef = true` (sets audio ref)
- Mobile swiper: `enableAudioRef = false` (ignores audio ref)
- Files Modified: `src/components/MainContent.tsx` (L403-420, L678-720, L819, L883)

#### Issue #2: activeRowId Was Null During Initial Render (FIXED ✅)
**Symptoms:**
- `{activeRowId: null, shouldSetRef: false}`
- Audio ref check failed even with `enableAudioRef = true`

**Root Cause:** Timing issue
- `activeRowId` is set by `setActiveRow()` during swiper initialization
- Audio players render BEFORE `activeRowId` is populated on page load
- Check `row.id === activeRowId && enableAudioRef` always failed

**Fix Applied:**
- Removed `activeRowId` dependency from audio ref logic
- New check: `shouldSetAudioRef = enableAudioRef && isActive`
- `enableAudioRef` ensures only desktop swiper sets ref
- `isActive` is Swiper's built-in state (reliable)
- Files Modified: `src/components/MainContent.tsx` (L407)

#### Issue #3: Audio Plays But Wrong Slide (CURRENT ❌)
**Symptoms:**
- Audio plays when playlist icon clicked
- Audio source is from a non-visible slide
- Happens because multiple `<EssentialAudioPlayer>` components exist in DOM

**Root Cause Hypothesis:**
- Swiper renders ALL slides in the DOM (virtualization might be disabled)
- Desktop swiper has `enableAudioRef=true` for ALL slides in the row
- The audio ref gets set to whichever audio element renders LAST, not necessarily the active one
- `isActive` prop might not be working as expected during initial render

**What Still Needs Investigation:**
1. **Check Swiper virtualization** - Are all slides rendered or only active ones?
2. **Verify `isActive` timing** - Is it `true` for the correct slide when audio ref is set?
3. **Multiple audio refs** - Are multiple audio players setting the ref sequentially?
4. **Solution approach:** Only set audio ref when `isActive === true` AND slide is currently visible

---

## Debug Path History (Complete)

### Issue #1: Icon Not Showing (FIXED - Pre-Session)
**Root Cause:** `updatePlaylistData()` only called on row change, not initial load
**Fix:** Added initial call in useEffect when first row loads (with 200ms delay for swiper registration)

### Issue #2: Audio Ref Not Set (FIXED - Pre-Session)
**Root Cause:** `onAudioRefChange` callback in EssentialAudioPlayer called before client-side rendering
**Fix:** Updated useEffect to wait for `isClient === true` before calling callback

### Issue #3: Playing Wrong Row's Audio (FIXED - Pre-Session)
**Root Cause:** Multiple audio players rendering (desktop + mobile), last one wins
**Fix:** Conditionally pass `onAudioRefChange` only when `row.id === activeRowId`

### Issue #4: Viewport Mismatch (FIXED - Nov 3 Evening ✅)
**Root Cause:** `isMobile === isMobileViewport` condition never matched due to timing
**Fix:** Removed viewport detection, used explicit `enableAudioRef` parameter

### Issue #5: activeRowId Null (FIXED - Nov 3 Evening ✅)
**Root Cause:** `activeRowId` not set during initial render
**Fix:** Removed `activeRowId` dependency, use `enableAudioRef && isActive`

### Issue #6: Wrong Slide Audio Playing (CURRENT - Nov 3 Evening ❌)
**Root Cause:** TBD - Audio ref points to wrong audio element
**Status:** Audio plays, but from invisible slide instead of active visible slide

### Issue #7: Slide ID Tracking Approach Failed (Nov 3 Late Evening ❌ - ABANDONED)
**Session:** Late Evening Session
**Symptoms:**
- Implemented Option A (slide ID tracking)
- Added `activeSlideIdRef`, `slideId` param to `setAudioRef()`, slide ID props to components
- Dev server restarted, still plays wrong slide audio
- "The Sacred Path" row visible, but "Acknowledge the Pain" row audio plays

**Root Cause:** Timing issue with ref acceptance logic
```typescript
// In PlaylistContext.setAudioRef()
if (!activeSlideIdRef.current || slideId === activeSlideIdRef.current) {
  audioRef.current = ref;  // ACCEPTS ref
}
```

**Why It Failed:**
1. **Initial Page Load:** All slides render and their audio players call `setAudioRef(ref, slideId)`
2. **At This Time:** `activeSlideIdRef.current` is `null` (playlist hasn't started yet)
3. **Condition Passes:** `if (!activeSlideIdRef.current ...)` is TRUE for all slides
4. **All Refs Accepted:** Every slide's audio ref is accepted and overwrites the previous one
5. **Last One Wins:** The last slide to render sets the final audio ref (wrong slide)
6. **When Playlist Starts:** `activeSlideIdRef` is set correctly, but audio ref already points to wrong element

**Lesson Learned:** Cannot rely on pre-rendering refs. Need to query DOM dynamically when playlist starts.

**Fix Attempted - FAILED ❌:**
- Files Modified: `PlaylistContext.tsx` (L43, L46-66, L163-170, L127-131, L250)
- Files Modified: `EssentialAudioPlayer.tsx` (L11-12, L21, L45-46, L55-56, L59)
- Files Modified: `MainContent.tsx` (L443, L613)
- TypeScript validation: ✅ Passed (0 errors)
- Runtime test: ❌ Still plays wrong audio after dev server restart

### Issue #8: Option B DOM Query Implemented - Wrong Within Row Fixed (Nov 3 Night Session #1 ⚠️ PARTIAL)
**Session:** Night Session #1
**Symptoms:**
- Successfully reverted failed Option A changes
- Implemented Option B (DOM query approach)
- Changed from `setAudioRef()` callback system to direct DOM query
- Used `document.querySelector('.swiper-slide-active audio')`
- Row 1 works correctly - plays correct audio from visible slide
- Row 2 plays Row 1's audio instead of Row 2's audio

**Implementation Details:**
```typescript
// In PlaylistContext.startPlaylist()
const activeAudio = document.querySelector('.swiper-slide-active audio');

// In PlaylistContext.handleAudioEnded()
const nextAudio = document.querySelector('.swiper-slide-active audio');
```

**Root Cause Identified:**
- Global `document.querySelector()` searches entire page
- Multiple rows visible in DOM simultaneously (vertical swiper architecture)
- Each row has its own horizontal swiper with `.swiper-slide-active` slides
- Query always finds **first match** in document (Row 1's active slide)
- Row 2's swiper active slide is ignored

**Why Row 1 Works:**
- Row 1 is the first row in DOM
- Query finds Row 1's active slide first
- Happens to be correct when on Row 1

**Why Row 2 Fails:**
- Row 2 is second in DOM
- Query still finds Row 1's active slide first (wrong)
- Row 2's active slide never selected

**Files Modified:**
- `PlaylistContext.tsx` - Removed `setAudioRef()`, removed `activeSlideIdRef`, implemented DOM query
- `EssentialAudioPlayer.tsx` - Removed `slideId` prop, simplified callback
- `MainContent.tsx` - Removed `setAudioRef` usage, removed `slideId` props

**Fix Attempted - PARTIAL SUCCESS ⚠️:**
- TypeScript validation: ✅ Passed (0 errors)
- Runtime test Row 1: ✅ Correct audio plays
- Runtime test Row 2: ❌ Still plays Row 1's audio

### Issue #9: Scoped DOM Query to Row's Swiper - Still Playing Wrong Row Audio (Nov 3 Night Session #2 ❌ CURRENT)
**Session:** Night Session #2
**Symptoms:**
- Attempted to scope DOM query to specific row's swiper container
- Changed `document.querySelector()` to `swiper.el.querySelector()`
- Expected: Each row would query only within its own swiper container
- Row 1: Still works correctly
- Row 2: Still plays Row 1's audio (no change)

**Implementation Details:**
```typescript
// In PlaylistContext.startPlaylist() - Line 154
if (!swiper || !swiper.el) {
  console.warn('[Playlist] Swiper or swiper.el not available');
  return;
}
const activeAudio = swiper.el.querySelector('.swiper-slide-active audio');

// In PlaylistContext.handleAudioEnded() - Line 110
if (!swiperRef.current || !swiperRef.current.el) {
  console.warn('[Playlist] Swiper or swiper.el not available after advancing');
  return;
}
const nextAudio = swiperRef.current.el.querySelector('.swiper-slide-active audio');
```

**Theory Why This Should Work:**
- `swiper` parameter in `startPlaylist()` is the horizontal swiper for that specific row
- `swiper.el` is the DOM container element for that row's horizontal swiper
- `querySelector()` scoped to `swiper.el` should only find audio within that row
- Should isolate Row 1's audio from Row 2's audio

**Why It's Still Failing:**
- Unknown - scoped query should work
- Possible causes to investigate:
  1. `swiper.el` might reference wrong element
  2. Multiple swipers might share same container
  3. Swiper architecture might be different than expected
  4. Row data might not update correctly when changing rows
  5. Cached/stale swiper reference being used

**Files Modified:**
- `PlaylistContext.tsx` - Updated both `startPlaylist()` and `handleAudioEnded()` to use scoped queries

**Fix Attempted - FAILED ❌:**
- TypeScript validation: ✅ Passed (0 errors)
- Runtime test Row 1: ✅ Correct audio plays
- Runtime test Row 2: ❌ Still plays Row 1's audio (no improvement)

**Status:** Investigation paused. Need to debug:
1. Log `swiper.el` structure to verify it's correct element
2. Log which audio elements exist within `swiper.el` at query time
3. Verify `rowId` being passed matches the actual active row
4. Check if `playlistDataRef` updates correctly on row change
5. Consider if vertical swiper interfering with horizontal swiper queries

---

## Key Code Locations (Updated Nov 3)

### Audio Reference Flow (Current)
```
MainContent.renderSlideContent() (L403-420)
  → shouldSetAudioRef = enableAudioRef && isActive
  → Desktop swiper: enableAudioRef=true, Mobile: enableAudioRef=false

EssentialAudioPlayer (L31-56)
  → useEffect monitors isClient, audioRef.current, onAudioRefChange
  → Calls onAudioRefChange(audioRef.current) when ready
  → Enhanced debug logging shows callback timing

PlaylistContext.setAudioRef() (L45-53)
  → audioRef.current = ref
  → Debug logs old/new ref state

PlaylistContext.startPlaylist() (L119-182)
  → Waits 500ms for audio element ready
  → Comprehensive audio state logging (src, readyState, error, etc.)
  → Calls audioRef.current.play()
```

### Playlist Start Flow
```
TopIconBar.handlePlaylistToggle() (L27-42)
  → getPlaylistData() from page.tsx
  → PlaylistContext.startPlaylist(rowId, delaySeconds, swiper, slides)
  → Sets isPlaylistActive=true, isPaused=false
  → Attaches 'ended' event listener
  → Calls audioRef.current.play() after 500ms
```

### Data Update Flow
```
MainContent initial load (L155-173)
  → Detects first row with audio
  → Calls updatePlaylistData(rowId, delay, visibleSlides, swiper, hasAudio)
  → page.tsx stores in playlistDataRef
  → TopIconBar reads via getPlaylistData()
  → hasAudioSlides state updated → icon shows
```

---

## Files Modified (Complete List - Updated Nov 3)

### Created
1. `src/contexts/PlaylistContext.tsx` - Enhanced with comprehensive debug logging (Nov 3)
2. `scripts/run-playlist-migration.ts`
3. `scripts/migrations/add-playlist-delay.sql`

### Modified (Nov 3 Session)
4. `src/lib/queries/slideRows.ts` - Added field to interfaces & queries
5. `src/app/api/slides/rows/route.ts` - POST accepts playlist_delay_seconds
6. `src/app/api/slides/rows/[id]/route.ts` - PATCH validates 0-45 range
7. `src/components/admin/slides/SlideRowForm.tsx` - Added dropdown UI
8. `src/components/TopIconBar.tsx` - Icon logic + click handlers
9. **`src/components/EssentialAudioPlayer.tsx`** - Enhanced debug logging (L31-56) ✅
10. **`src/components/MainContent.tsx`** - Major refactor:
    - Removed viewport detection state (L64-78 deleted)
    - Added `enableAudioRef` parameter to `renderSlideContent()` (L403)
    - Updated `shouldSetAudioRef` logic (L407): `enableAudioRef && isActive`
    - Added `enableAudioRef` parameter to `renderHorizontalSwiper()` (L678)
    - Desktop swiper: `renderHorizontalSwiper(row, slides, false, true)` (L819)
    - Mobile swiper: `renderHorizontalSwiper(row, slides, true, false)` (L883)
    - Enhanced debug logging (L410-420)
11. **`src/contexts/PlaylistContext.tsx`** - Enhanced debug logging:
    - `setAudioRef()` logs old/new ref state (L46-51)
    - `startPlaylist()` logs comprehensive audio element state (L145-181)
    - Increased timeout from 200ms to 500ms (L181)
    - Added autoplay policy error detection
12. `src/app/page.tsx` - PlaylistProvider wrapper + state management

---

## Next Steps to Fix "Wrong Audio Playing" Issue

### Immediate Investigation Required

1. **Verify `isActive` Prop Behavior**
   - Add logging to see which slides have `isActive=true` during render
   - Check if multiple slides can be `isActive=true` simultaneously
   - Confirm `isActive` updates when Swiper changes slides

2. **Check Swiper Slide Rendering**
   - Determine if Swiper renders all slides or only active ones
   - Check Swiper configuration for virtualization settings
   - Log how many audio players render with `enableAudioRef=true`

3. **Track Audio Ref Updates**
   - Log EVERY time `setAudioRef()` is called
   - Track which slide's audio element is setting the ref
   - Verify only ONE audio ref is set (not multiple sequential sets)

### Potential Solutions

#### Option A: Store Active Slide ID ~~(Recommended)~~ **ATTEMPTED - FAILED ❌**
**Status:** Implemented Nov 3, tested after dev server restart, still plays wrong audio

**Why It Failed:**
- Refs are set during initial page load when `activeSlideIdRef` is still `null`
- Condition `if (!activeSlideIdRef.current || slideId === activeSlideIdRef.current)` accepts all refs when null
- Last-rendered slide's audio ref wins (still the wrong slide)
- Lesson: Cannot control ref acceptance before playlist starts

**Code Attempted:**
```typescript
// In PlaylistContext - FAILED APPROACH
const activeSlideIdRef = useRef<string | null>(null);

const setAudioRef = (ref: HTMLAudioElement | null, slideId?: string) => {
  // This condition is TRUE for all slides when activeSlideIdRef is null!
  if (!activeSlideIdRef.current || slideId === activeSlideIdRef.current) {
    audioRef.current = ref;  // All refs get accepted during initial render
  }
};
```

**Files Modified (to be reverted):**
- `src/contexts/PlaylistContext.tsx`
- `src/components/EssentialAudioPlayer.tsx`
- `src/components/MainContent.tsx`

---

#### Option B: Query Active Audio Element Dynamically **(RECOMMENDED - Try This Next)**
**Status:** Not yet attempted
**Advantages:**
- No ref storage needed - query DOM only when playlist starts
- Guarantees correct audio element (`.swiper-slide-active audio` is always the visible slide)
- Simpler logic - no timing issues with ref acceptance
- Works regardless of when components render

**Implementation:**
```typescript
// In PlaylistContext.startPlaylist()
const startPlaylist = useCallback((rowId, delaySeconds, swiper, slides) => {
  // ... existing setup code ...

  setTimeout(() => {
    // Query the DOM for the currently active slide's audio element
    const activeAudio = document.querySelector('.swiper-slide-active audio') as HTMLAudioElement | null;

    if (activeAudio && activeAudio.src) {
      console.log('[Playlist] Found active audio element:', activeAudio.src);

      // Store ref and attach event listener
      audioRef.current = activeAudio;
      activeAudio.addEventListener('ended', handleAudioEnded);

      // Start playback
      activeAudio.play().catch(err => {
        console.error('[Playlist] Failed to start audio:', err);
      });
    } else {
      console.warn('[Playlist] No active audio element found');
    }
  }, 500);
}, [handleAudioEnded]);

// When advancing to next slide
const handleAudioEnded = useCallback(() => {
  // ... existing advance logic ...

  // After swiper.slideTo(nextIndex), query new active audio
  setTimeout(() => {
    const nextAudio = document.querySelector('.swiper-slide-active audio') as HTMLAudioElement | null;
    if (nextAudio) {
      audioRef.current = nextAudio;
      nextAudio.addEventListener('ended', handleAudioEnded);
      nextAudio.play();
    }
  }, 200);  // Wait for swiper transition
}, []);
```

**Changes Required:**
- Modify `PlaylistContext.startPlaylist()` to query DOM instead of using stored ref
- Modify `handleAudioEnded()` to query DOM after slide advance
- Remove `setAudioRef()` callback entirely (no longer needed)
- Remove `onAudioRefChange` prop from `EssentialAudioPlayer` components
- Cleanup: Revert all changes from failed Option A attempt

**Benefits:**
- ✅ Always gets the correct audio element (the one currently visible)
- ✅ No timing issues with component rendering
- ✅ Simpler code - fewer moving parts
- ✅ No ref passing through component tree

#### Option C: Single Playlist Audio Player
Create a dedicated audio player outside of Swiper that updates src when playlist advances:
```typescript
// Playlist-specific audio element (not tied to slides)
<audio ref={playlistAudioRef} onEnded={handleAudioEnded} />

// Update src when advancing
playlistAudioRef.current.src = nextSlide.audio_url;
playlistAudioRef.current.play();
```

#### Option D: Use Data Attributes to Identify Active Audio
```typescript
// In renderSlideContent
<EssentialAudioPlayer
  data-slide-id={slide.id}
  data-is-active={isActive}
  onAudioRefChange={...}
/>

// In setAudioRef, check data attributes
const setAudioRef = (ref: HTMLAudioElement | null) => {
  if (ref?.dataset.isActive === 'true') {
    audioRef.current = ref;
  }
};
```

---

## Testing Checklist

### Basic Functionality
- [x] Playlist icon shows when row has audio slides (after schedule filtering)
- [x] Playlist icon hidden when row has no audio slides
- [x] Icon changes from `playlist_play` to `pause` when active
- [x] Clicking icon starts audio playback
- [ ] **Audio plays from CURRENTLY VISIBLE slide** ❌ (plays wrong slide)
- [ ] Clicking `pause` icon pauses audio (untested)
- [ ] Clicking again resumes audio (untested)

### Auto-Advance
- [ ] After audio ends, waits configured delay (e.g., 15 seconds)
- [ ] Automatically advances to next slide with audio
- [ ] Starts playing next audio automatically
- [ ] Skips slides without audio
- [ ] Stops at end of row (doesn't loop indefinitely)

### Navigation Interactions
- [ ] Manual slide navigation (swipe/arrows) stops playlist
- [ ] Navigating to different row stops playlist
- [ ] Icon updates correctly when switching rows
- [ ] Playlist state resets when changing rows

### Edge Cases
- [ ] Row with 1 audio slide (should stop after playing)
- [ ] Row with mixed audio/non-audio slides (should skip non-audio)
- [ ] Schedule filters hide some audio slides (should only play visible ones)
- [ ] Schedule filters hide ALL audio slides (icon should not show)
- [ ] Multiple rapid clicks on play/pause icon (should be debounced)

---

## Known Issues & Workarounds

### Issue: Audio Plays from Wrong Slide (CRITICAL - Nov 3)
**Status:** Active Issue
**Description:** When playlist starts, audio from a non-visible slide plays instead of current active slide
**Root Cause:** Audio ref is set to wrong audio element (likely the last rendered element)
**Workaround:** None - feature unusable until fixed
**Next Steps:** See "Potential Solutions" section above

### Issue: Spa Mode + Playlist Conflict
**Status:** Not addressed yet
**Description:** If spa background music is playing, playlist audio may overlap
**Workaround:** User manually stops spa mode before starting playlist
**Future Fix:** Auto-pause spa mode when playlist starts

### Issue: Schedule Filters Mid-Playlist
**Status:** Partially handled
**Description:** If schedule changes mid-playlist (e.g., time-based filter), slides may disappear
**Current:** Re-filters on each advance via `filterVisibleSlides()`
**Risk:** Playlist might stop unexpectedly if all slides become filtered out

### Issue: Memory Leaks from Event Listeners
**Status:** Handled
**Description:** `ended` event listener must be cleaned up
**Solution:** `stopPlaylist()` calls `removeEventListener()`

---

## Configuration Reference

### Database Field
```sql
playlist_delay_seconds INTEGER DEFAULT 0 NOT NULL
CHECK (playlist_delay_seconds >= 0 AND playlist_delay_seconds <= 45)
```

### Admin Form Options
```javascript
[0, 5, 10, 15, 20, 25, 30, 35, 40, 45] // seconds
```

### PlaylistContext State
```typescript
{
  isPlaylistActive: boolean,
  isPaused: boolean,
  currentRowId: string | null,
  audioRef: HTMLAudioElement | null,
  swiperRef: SwiperType | null,
  delayTimeoutRef: NodeJS.Timeout | null,
  delaySecondsRef: number,
  slidesRef: Slide[]
}
```

---

## Debug Console Logs Reference

### Expected Success Flow (Not Currently Happening)
```
[MainContent] Viewport detected: DESKTOP (1600px)
[MainContent] Active Slide: {slideId} Audio URL: {url}
[MainContent] Audio ref decision: { shouldSetRef: true, enableAudioRef: true, isActive: true }
[AudioPlayer] ✅ Calling onAudioRefChange with audio ref - URL: {url}
[PlaylistContext] setAudioRef called: { newRef: true, newSrc: {url} }
[Playlist] Starting playlist for row: {rowId} with delay: 15
[Playlist] startPlaylist timeout fired after 500ms
[Playlist] Audio ref state: { refExists: true, src: {url}, readyState: 4 }
[Playlist] Calling play() on audio element...
[Playlist] ✅ Audio started playing successfully
```

### Current Problem Flow (What's Actually Happening)
```
[MainContent] Active Slide: {correctSlideId} Audio URL: {correctUrl}
[AudioPlayer] ✅ Calling onAudioRefChange with audio ref - URL: {WRONG_URL} ❌
[PlaylistContext] setAudioRef called: { newRef: true, newSrc: {WRONG_URL} }
[Playlist] Audio started playing successfully (but wrong audio!)
```

---

## TypeScript Validation

Run before testing:
```bash
npx tsc --noEmit
```

Should return 0 errors. Currently passing as of Nov 3.

---

## Rollback Instructions

If feature needs to be temporarily disabled:

1. **Remove playlist icon from TopIconBar:**
   ```tsx
   // Comment out lines 81-90 in TopIconBar.tsx
   ```

2. **Revert database (if needed):**
   ```sql
   ALTER TABLE slide_rows DROP COLUMN IF EXISTS playlist_delay_seconds;
   ```

3. **Remove PlaylistProvider:**
   ```tsx
   // In page.tsx, remove <PlaylistProvider> wrapper
   ```

Feature can be re-enabled by uncommenting/re-adding these components.

---

## Session Summary (Nov 3 Night Sessions)

### Night Session #1 Accomplishments ✅
1. Successfully reverted failed Option A (slide ID tracking)
2. Implemented Option B (DOM query approach) - global document query
3. Removed `setAudioRef()` callback system entirely
4. Simplified component tree - no more ref passing
5. Row 1 now plays correct audio ✅
6. TypeScript validation passes (0 errors)

### Night Session #2 Accomplishments ✅
1. Identified root cause: Global `document.querySelector()` finds Row 1 first
2. Attempted scoped query: Changed to `swiper.el.querySelector()`
3. Added null checks for `swiper.el`
4. TypeScript validation passes (0 errors)
5. Better understanding of multi-row architecture issue

### Failed Attempts 🚫
1. **Option A: Slide ID Tracking** ❌ (Late Evening Session)
   - Refs accepted during initial render when `activeSlideIdRef` is `null`
   - Lesson: Cannot use conditional logic dependent on playlist state

2. **Option B: Global DOM Query** ⚠️ (Night Session #1 - Partial)
   - Row 1 works, Row 2 plays Row 1's audio
   - Lesson: Global queries always find first match (Row 1)

3. **Option B Enhanced: Scoped DOM Query** ❌ (Night Session #2)
   - Changed to `swiper.el.querySelector()`
   - Row 2 still plays Row 1's audio (no improvement)
   - Lesson: Unclear why scoping to swiper element doesn't work

### Remaining Work ❌
1. **CRITICAL:** Debug why `swiper.el.querySelector()` still finds wrong row
   - Log `swiper.el` structure and contents
   - Verify `swiper` parameter matches active row
   - Check if `playlistDataRef` updates correctly
   - Investigate if multiple swipers share containers
2. Consider alternative approaches:
   - Pass `rowId` and filter audio elements by data attribute
   - Use different selector strategy (class names, IDs)
   - Store audio refs in context keyed by rowId
   - Query using row-specific class or ID
3. Test auto-advance functionality (once basic playback works)
4. Test pause/resume functionality
5. Test navigation interactions (stop on manual navigation)
6. Implement spa mode conflict handling
7. Test all edge cases

### Recommended Next Session Approach
1. **Add Enhanced Debug Logging:**
   ```typescript
   // In startPlaylist()
   console.log('[Playlist] Swiper info:', {
     rowId,
     swiperEl: swiper.el,
     swiperElHTML: swiper.el?.outerHTML?.substring(0, 200),
     allAudioElements: swiper.el?.querySelectorAll('audio').length,
     activeSlides: swiper.el?.querySelectorAll('.swiper-slide-active').length
   });
   ```

2. **Investigate Alternative Selectors:**
   - Try: `swiper.slides[swiper.activeIndex].querySelector('audio')`
   - Try: Add `data-row-id="${rowId}"` to audio elements
   - Try: More specific class names per row

3. **Verify Row Data Updates:**
   - Log `playlistDataRef.current` before calling `startPlaylist()`
   - Ensure `updatePlaylistData()` called on row change
   - Check timing of when playlist data updates vs when user clicks icon

4. **Consider Simplification:**
   - Remove pause/resume if it's interfering (user suggested this)
   - Focus on basic play + auto-advance first
   - Add complexity back after core functionality works

---

**Status:** Feature ~65% complete. Row 1 works perfectly. Row 2 fails (plays Row 1's audio).
**Priority:** Debug why scoped DOM query isn't working for Row 2.
**Estimated Remaining Work:** 2-3 hours debugging + 2 hours testing after fix found.

---

**Last Updated:** November 3, 2025 - Night Session #2
**Next Session Goal:** Debug why `swiper.el.querySelector()` scoped query still finds Row 1's audio when on Row 2. Add enhanced logging to investigate swiper structure and row data flow.
