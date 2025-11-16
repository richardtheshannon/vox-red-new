# Auto-Play System - Complete Developer Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Core Components Deep Dive](#core-components-deep-dive)
4. [Event System](#event-system)
5. [State Management](#state-management)
6. [Playback Control Logic](#playback-control-logic)
7. [Navigation Coordination](#navigation-coordination)
8. [Pause/Resume Functionality](#pauseresume-functionality)
9. [Scroll Priority System](#scroll-priority-system)
10. [Developer Recreation Guide](#developer-recreation-guide)
11. [Edge Cases & Error Handling](#edge-cases--error-handling)
12. [Testing Strategy](#testing-strategy)

---

## System Overview

### Purpose
The auto-row-play feature enables automatic sequential playback of MP3 and YouTube audio files within a specific horizontal row of articles. Unlike global auto-play (which navigates vertically across all content), this system is **row-scoped** and provides granular playback control.

### Key Characteristics
- **Row-Specific**: Only plays audio within the current horizontal slide row
- **Left-to-Right Progression**: Main article → Sub-articles in order
- **Pause/Resume Support**: True pause with position memory (not just stop)
- **Visual State Indicators**: Dynamic icons showing play/pause/stop states
- **Scroll Priority Aware**: Coordinates with content overflow scrolling
- **Independent System**: Does not interfere with global auto-play or manual controls

### Technology Stack
- **React 19** with hooks (useState, useRef, useEffect, useCallback)
- **TypeScript** for type safety
- **Swiper.js** for slide navigation
- **HTML5 Audio API** for MP3 playback
- **YouTube IFrame API** for YouTube audio
- **Custom Events** for component communication

---

## Architecture & Data Flow

### Component Hierarchy

```
ArticlesSwiper (Vertical Navigation)
    └── HorizontalSlides (Horizontal Navigation)
        ├── AutoRowPlayButton (Playback Control UI)
        ├── ArticleSlide (Content Display)
        │   └── AudioPlayer (MP3 Player)
        │       └── YouTubeAudioPlayer (YouTube Player)
        └── BottomNavigationFooter (Navigation UI)
```

### Data Flow Diagram

```
1. User scrolls to a row
    ↓
2. HorizontalSlides extracts audio tracks from visible slides
    ↓
3. AutoRowPlayButton receives track list via props
    ↓
4. User clicks play button
    ↓
5. AutoRowPlayButton starts sequential playback:
    a. Navigate to slide with audio
    b. Dispatch 'autoRowPlayTrackActive' event
    c. AudioPlayer/YouTubeAudioPlayer receives event
    d. Play audio via DOM manipulation
    e. Audio 'ended' event triggers next track
    ↓
6. Repeat until all tracks complete
    ↓
7. Navigate back to first slide and stop
```

### Audio Track Data Structure

```typescript
interface AudioTrack {
  url: string           // MP3 URL or YouTube URL
  title: string         // Article title for display
  articleId: string     // Unique ID for DOM selection
  slideIndex: number    // Position in horizontal swiper (0-based)
}
```

---

## Core Components Deep Dive

### 1. AutoRowPlayButton.tsx

**Purpose**: Main UI control for row-specific audio playback

**Location**: Fixed at `top-6 left-28`

**Key Responsibilities**:
- Display play/pause/stop controls
- Manage playback state (isPlaying, isPaused, currentTrackIndex)
- Control sequential track progression
- Handle audio cleanup and navigation

**State Variables**:
```typescript
const [isPlaying, setIsPlaying] = useState(false)           // Currently playing
const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
const [isPaused, setIsPaused] = useState(false)            // Paused with position
const playingRef = useRef(false)                           // Mutable playback flag
const rowIdRef = useRef(audioTracks.map(t => t.articleId).join('-'))
const pausedTrackIndex = useRef<number | null>(null)       // Resume position
```

**Core Functions**:

#### `stopAllAudio()`
Stops and resets ALL audio elements on the page.
```typescript
const stopAllAudio = () => {
  const audioElements = document.querySelectorAll('audio')
  audioElements.forEach(audio => {
    audio.pause()
    audio.currentTime = 0  // Reset to beginning
  })
}
```

#### `pauseRowAudio()`
Pauses audio WITHOUT resetting position (enables resume).
```typescript
const pauseRowAudio = () => {
  audioTracks.forEach(track => {
    const audioElement = document.querySelector(
      `audio[data-article-id="${track.articleId}"]`
    ) as HTMLAudioElement
    if (audioElement) {
      audioElement.pause()
      // currentTime NOT reset - allows resume
    }
  })
}
```

#### `stopRowAudio()`
Stops and resets row-specific audio.
```typescript
const stopRowAudio = () => {
  audioTracks.forEach(track => {
    const audioElement = document.querySelector(
      `audio[data-article-id="${track.articleId}"]`
    ) as HTMLAudioElement
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0  // Full reset
    }
  })
}
```

#### `playAudio(audioElement, resetPosition)`
Promise-based audio playback wrapper.
```typescript
const playAudio = async (
  audioElement: HTMLAudioElement,
  resetPosition: boolean = true
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const handleEnded = () => {
      audioElement.removeEventListener('ended', handleEnded)
      audioElement.removeEventListener('error', handleError)
      resolve()
    }

    const handleError = (error: Event) => {
      audioElement.removeEventListener('ended', handleEnded)
      audioElement.removeEventListener('error', handleError)
      console.error('Audio playback error:', error)
      reject(error)
    }

    audioElement.addEventListener('ended', handleEnded)
    audioElement.addEventListener('error', handleError)

    if (resetPosition) {
      audioElement.currentTime = 0
    }
    audioElement.play().catch(reject)
  })
}
```

#### `playTracksSequentially(shouldContinue, startIndex)`
Main playback loop - plays tracks in order with navigation.
```typescript
const playTracksSequentially = async (
  shouldContinue: { current: boolean },
  startIndex: number = 0
) => {
  for (let i = startIndex; i < audioTracks.length; i++) {
    // Check if user stopped/paused
    if (!shouldContinue.current) {
      if (isPaused) {
        pausedTrackIndex.current = i  // Save position
      } else {
        setCurrentTrackIndex(null)
        pausedTrackIndex.current = null
      }
      break
    }

    const track = audioTracks[i]
    setCurrentTrackIndex(i)

    // Navigate to slide
    window.dispatchEvent(new CustomEvent('navigateToHorizontalSlide', {
      detail: { horizontalIndex: track.slideIndex }
    }))
    await new Promise(resolve => setTimeout(resolve, 600))

    // Broadcast active track for visual feedback
    window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
      detail: {
        articleId: track.articleId,
        rowId: rowIdRef.current
      }
    }))

    // Find and play audio
    const audioElement = document.querySelector(
      `audio[data-article-id="${track.articleId}"]`
    ) as HTMLAudioElement

    if (audioElement) {
      try {
        stopAllAudio()
        await new Promise(resolve => setTimeout(resolve, 100))

        const verifiedElement = document.querySelector(
          `audio[data-article-id="${track.articleId}"]`
        ) as HTMLAudioElement

        if (verifiedElement) {
          const isResuming = isPaused && i === pausedTrackIndex.current
          await playAudio(verifiedElement, !isResuming)
        }
      } catch (error) {
        console.error(`Error playing track ${track.title}:`, error)
      }
    }

    // Clear active indicator
    window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
      detail: { articleId: null, rowId: rowIdRef.current }
    }))

    // Pause between tracks (if configured)
    if (pauseDuration && pauseDuration > 0 && i < audioTracks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, pauseDuration * 1000))
    }
  }

  // Navigate back to first slide
  window.dispatchEvent(new CustomEvent('navigateToHorizontalSlide', {
    detail: { horizontalIndex: 0 }
  }))

  // Reset state
  playingRef.current = false
  setIsPlaying(false)
  setIsPaused(false)
  setCurrentTrackIndex(null)
  pausedTrackIndex.current = null
}
```

#### `toggleAutoRowPlay()`
Main play/pause control - handles three states.
```typescript
const toggleAutoRowPlay = () => {
  if (isPlaying) {
    // PAUSE: Stop playback, keep position
    playingRef.current = false
    setIsPlaying(false)
    setIsPaused(true)
    pauseRowAudio()
  } else if (isPaused && pausedTrackIndex.current !== null) {
    // RESUME: Continue from saved position
    playingRef.current = true
    setIsPlaying(true)
    setIsPaused(false)
    playTracksSequentially(playingRef, pausedTrackIndex.current)
  } else {
    // START FRESH: Begin from first track
    playingRef.current = true
    setIsPlaying(true)
    setIsPaused(false)
    pausedTrackIndex.current = null
    playTracksSequentially(playingRef, 0)
  }
}
```

#### `stopAutoRowPlay()`
Complete stop with full reset.
```typescript
const stopAutoRowPlay = () => {
  playingRef.current = false
  setIsPlaying(false)
  setIsPaused(false)
  setCurrentTrackIndex(null)
  pausedTrackIndex.current = null
  stopRowAudio()
  window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
    detail: { articleId: null, rowId: rowIdRef.current }
  }))
}
```

**UI Rendering**:
```typescript
return (
  <div className="fixed top-6 left-28 z-[60] flex items-center gap-1">
    {/* Play/Pause Button */}
    <button onClick={toggleAutoRowPlay}>
      <span className="material-icons">
        {isPlaying ? 'pause_circle' : isPaused ? 'play_circle' : 'playlist_play'}
      </span>
    </button>

    {/* Stop Button (only when paused) */}
    {isPaused && (
      <button onClick={stopAutoRowPlay}>
        <span className="material-icons">stop_circle</span>
      </button>
    )}

    {/* Track Counter */}
    <span className="text-xs">
      {currentTrackIndex !== null
        ? `${currentTrackIndex + 1}/${audioTracks.length}`
        : pausedTrackIndex.current !== null
        ? `${pausedTrackIndex.current + 1}/${audioTracks.length}`
        : `0/${audioTracks.length}`
      }
    </span>
  </div>
)
```

---

### 2. AudioPlayer.tsx

**Purpose**: Standard HTML5 audio player with event coordination

**Key Features**:
- Detects YouTube URLs and routes to YouTubeAudioPlayer
- Listens for `autoRowPlayTrackActive` events
- Shows visual feedback (red icon) when active in auto-row-play
- Handles manual play/pause controls independently

**State Variables**:
```typescript
const [isPlaying, setIsPlaying] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [isAutoRowPlayActive, setIsAutoRowPlayActive] = useState(false)
const audioRef = useRef<HTMLAudioElement>(null)
```

**Event Listeners**:
```typescript
useEffect(() => {
  const handleStopAllAudio = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      // Don't reset currentTime - allows resume
      setIsPlaying(false)
    }
  }

  const handleAutoRowPlayTrackActive = (event: CustomEvent) => {
    const { articleId: activeArticleId, rowId } = event.detail
    const isOurRow = rowId ? rowId.includes(articleId) : true
    if (isOurRow) {
      setIsAutoRowPlayActive(activeArticleId === articleId)
    }
  }

  window.addEventListener('stopAllAudio', handleStopAllAudio)
  window.addEventListener('autoRowPlayTrackActive', handleAutoRowPlayTrackActive as EventListener)

  return () => {
    window.removeEventListener('stopAllAudio', handleStopAllAudio)
    window.removeEventListener('autoRowPlayTrackActive', handleAutoRowPlayTrackActive as EventListener)
  }
}, [articleId])
```

**Visual Feedback Logic**:
```typescript
// Red icon when this track is active in auto-row-play
{(isPlaying || isAutoRowPlayActive) ? (
  <span className="material-icons text-red-500" style={{fontSize: '44px'}}>
    {isPlaying ? 'pause_circle' : 'play_circle'}
  </span>
) : (
  <span className="material-icons text-gray-600 dark:text-gray-300" style={{fontSize: '44px'}}>
    play_circle
  </span>
)}
```

---

### 3. YouTubeAudioPlayer.tsx

**Purpose**: YouTube audio-only playback using YouTube IFrame API

**Key Features**:
- Extracts video ID from YouTube URLs
- Loads YouTube IFrame API dynamically
- Audio-only playback (iframe hidden)
- State synchronization with auto-row-play system

**YouTube Player Initialization**:
```typescript
const initializePlayer = useCallback(() => {
  if (!videoId || !containerRef.current || playerRef.current) return

  try {
    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    })
  } catch (error) {
    console.error('Error initializing YouTube player:', error)
    setIsLoading(false)
  }
}, [videoId])
```

**State Change Handler**:
```typescript
const onPlayerStateChange = (event: { data: number }) => {
  const playerState = event.data

  switch (playerState) {
    case 1: // playing
      setIsPlaying(true)
      break
    case 2: // paused
      setIsPlaying(false)
      break
    case 0: // ended
      setIsPlaying(false)
      // Trigger auto-play progression (if needed)
      window.dispatchEvent(new CustomEvent('autoPlayAudioEnd'))
      break
    case 3: // buffering
      setIsLoading(true)
      break
    default:
      if (playerState !== -1) {
        setIsLoading(false)
      }
  }
}
```

---

### 4. HorizontalSlides.tsx

**Purpose**: Manages horizontal swiper and audio track extraction

**Key Responsibilities**:
- Contains Swiper.js horizontal slider
- Extracts audio tracks from visible sub-articles
- Broadcasts navigation state to footer
- Handles scroll priority coordination
- Renders AutoRowPlayButton with track data

**Audio Track Extraction**:
```typescript
useEffect(() => {
  const tracks: Array<{
    url: string
    title: string
    articleId: string
    slideIndex: number
  }> = []

  // Map through visible slides and add audio tracks
  visibleSlides.forEach((slide, index) => {
    if (slide.audioUrl) {
      tracks.push({
        url: slide.audioUrl,
        title: slide.title,
        articleId: slide.id,
        slideIndex: index  // Actual visible slide index
      })
    }
  })

  setAudioTracks(tracks)

  // Broadcast navigation state
  broadcastHorizontalState()
  setTimeout(() => broadcastHorizontalState(), 100)
  setTimeout(() => broadcastHorizontalState(), 300)
}, [visibleSlides, broadcastHorizontalState])
```

**Navigation Event Listeners**:
```typescript
useEffect(() => {
  const handleNavigateToHorizontalSlide = (event: CustomEvent) => {
    const { horizontalIndex } = event.detail
    if (swiperRef.current) {
      swiperRef.current.slideTo(horizontalIndex)
    }
  }

  const handleHorizontalPrevious = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev()
    }
  }

  const handleHorizontalNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext()
    }
  }

  window.addEventListener('navigateToHorizontalSlide', handleNavigateToHorizontalSlide as EventListener)
  window.addEventListener('horizontalSlidePrevious', handleHorizontalPrevious)
  window.addEventListener('horizontalSlideNext', handleHorizontalNext)

  return () => {
    window.removeEventListener('navigateToHorizontalSlide', handleNavigateToHorizontalSlide as EventListener)
    window.removeEventListener('horizontalSlidePrevious', handleHorizontalPrevious)
    window.removeEventListener('horizontalSlideNext', handleHorizontalNext)
  }
}, [])
```

**Scroll Priority System**:
```typescript
const handleScrollStatusChange = useCallback((
  hasOverflow: boolean,
  isAtBottom: boolean,
  isAtTop: boolean
) => {
  setCurrentSlideScrollState({ hasOverflow, isAtBottom, isAtTop })

  if (swiperRef.current) {
    if (hasOverflow && !isAtBottom) {
      // Disable horizontal navigation when content needs scrolling
      swiperRef.current.allowTouchMove = false
      swiperRef.current.allowSlideNext = false
      swiperRef.current.allowSlidePrev = true  // Allow going back
      if (swiperRef.current.mousewheel) {
        swiperRef.current.mousewheel.disable()
      }
    } else {
      // Enable all navigation when scrolled to bottom
      swiperRef.current.allowTouchMove = true
      swiperRef.current.allowSlideNext = true
      swiperRef.current.allowSlidePrev = true
      if (swiperRef.current.mousewheel) {
        swiperRef.current.mousewheel.enable()
      }
    }

    // Broadcast updated state
    setTimeout(() => broadcastHorizontalState(), 10)
  }
}, [])
```

**AutoRowPlayButton Integration**:
```typescript
return (
  <>
    <AutoRowPlayButton
      audioTracks={audioTracks}
      pauseDuration={mainArticle.pauseDuration}
    />

    <Swiper
      onSwiper={(swiper) => { swiperRef.current = swiper }}
      onSlideChange={(swiper) => {
        setCurrentHorizontalIndex(swiper.activeIndex)
        setCurrentSlideScrollState({ hasOverflow: false, isAtBottom: true, isAtTop: true })
        setTimeout(() => broadcastHorizontalState(), 50)
      }}
      modules={[Navigation, Keyboard, Mousewheel]}
      direction="horizontal"
      slidesPerView={1}
      loop={true}
      // ... other swiper config
    >
      {visibleSlides.map((article) => (
        <SwiperSlide key={article.id}>
          <ArticleSlide
            article={article}
            onScrollStatusChange={handleScrollStatusChange}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </>
)
```

---

### 5. ArticlesSwiper.tsx

**Purpose**: Vertical slide navigation and home button

**Key Features**:
- Manages vertical Swiper.js instance
- Provides home button for page reload
- Coordinates with horizontal navigation
- Handles infinite loop navigation

**Swiper Configuration**:
```typescript
<Swiper
  onSwiper={(swiper) => { swiperRef.current = swiper }}
  onSlideChange={(swiper) => {
    console.log('ArticlesSwiper: Slide changed to index:', swiper.activeIndex)
  }}
  modules={[Keyboard, Mousewheel]}
  direction="vertical"
  slidesPerView={1}
  loop={true}
  keyboard={{ enabled: true, onlyInViewport: true }}
  mousewheel={true}
  speed={600}
>
  {articles.map((article, index) => {
    const content = article.subArticles && article.subArticles.length > 0 ? (
      <HorizontalSlides
        mainArticle={article}
        subArticles={article.subArticles}
        slideIndex={index}
      />
    ) : (
      <ArticleSlide article={article} showAutoRowPlay={true} />
    )

    return content ? (
      <SwiperSlide key={article.id}>
        {content}
      </SwiperSlide>
    ) : null
  }).filter(Boolean)}
</Swiper>
```

---

### 6. BottomNavigationFooter.tsx

**Purpose**: Fixed navigation controls at bottom of screen

**Features**:
- Vertical arrows (left side): Up/down navigation
- Horizontal arrows (right side): Left/right navigation
- Always active (no disabled states in infinite loop mode)
- Hidden on admin pages

**Component Structure**:
```typescript
return (
  <div className="fixed bottom-0 left-0 right-0 z-40">
    <div className="flex items-center justify-between px-6 py-3">
      {/* Vertical Navigation (Left) */}
      <div className="flex items-center space-x-2">
        <button onClick={onVerticalPrevious}>
          <span className="material-icons text-white text-2xl">
            keyboard_arrow_up
          </span>
        </button>
        <button onClick={onVerticalNext}>
          <span className="material-icons text-white text-2xl">
            keyboard_arrow_down
          </span>
        </button>
      </div>

      {/* Horizontal Navigation (Right) */}
      <div className="flex items-center space-x-2">
        <button onClick={onHorizontalPrevious}>
          <span className="material-icons text-white text-2xl">
            keyboard_arrow_left
          </span>
        </button>
        <button onClick={onHorizontalNext}>
          <span className="material-icons text-white text-2xl">
            keyboard_arrow_right
          </span>
        </button>
      </div>
    </div>
  </div>
)
```

---

## Event System

### Custom Event Architecture

The system uses **window.dispatchEvent()** and **window.addEventListener()** for component communication.

### Event Catalog

| Event Name | Source | Listeners | Payload | Purpose |
|------------|--------|-----------|---------|---------|
| `navigateToHorizontalSlide` | AutoRowPlayButton | HorizontalSlides | `{ horizontalIndex: number }` | Navigate to specific horizontal slide |
| `autoRowPlayTrackActive` | AutoRowPlayButton | AudioPlayer, YouTubeAudioPlayer | `{ articleId: string \| null, rowId: string }` | Indicate which track is currently active |
| `stopAllAudio` | AudioPlayer (manual control) | AudioPlayer, YouTubeAudioPlayer | None | Stop all audio elements on page |
| `horizontalSlidePrevious` | BottomNavigationFooter | HorizontalSlides | None | Navigate to previous horizontal slide |
| `horizontalSlideNext` | BottomNavigationFooter | HorizontalSlides | None | Navigate to next horizontal slide |
| `horizontalNavigationState` | HorizontalSlides | BottomNavigationFooter | `{ canGoPrevious: boolean, canGoNext: boolean, hasHorizontalSlides: boolean, currentIndex: number, totalSlides: number }` | Broadcast navigation state for UI updates |

### Event Flow Examples

#### Example 1: Starting Auto-Row-Play

```
1. User clicks play button
   ↓
2. AutoRowPlayButton.toggleAutoRowPlay()
   ↓
3. AutoRowPlayButton.playTracksSequentially(playingRef, 0)
   ↓
4. For each track:
   a. Dispatch 'navigateToHorizontalSlide' with { horizontalIndex: track.slideIndex }
      ↓
   b. HorizontalSlides receives event → swiperRef.current.slideTo(horizontalIndex)
      ↓
   c. Wait 600ms for navigation
      ↓
   d. Dispatch 'autoRowPlayTrackActive' with { articleId: track.articleId, rowId }
      ↓
   e. AudioPlayer receives event → checks if articleId matches → plays audio
      ↓
   f. Audio ends → HTML audio 'ended' event
      ↓
   g. AutoRowPlayButton's playAudio() promise resolves
      ↓
   h. Loop continues to next track
   ↓
5. All tracks complete → Navigate back to first slide → Stop
```

#### Example 2: Pausing and Resuming

```
1. User clicks pause while track 3 is playing
   ↓
2. AutoRowPlayButton.toggleAutoRowPlay()
   ↓
3. playingRef.current = false (stops loop)
   ↓
4. setIsPaused(true)
   ↓
5. pausedTrackIndex.current = 3 (saves position)
   ↓
6. pauseRowAudio() → audio.pause() WITHOUT resetting currentTime
   ↓
7. UI shows play icon and stop button

---

8. User clicks play (resume)
   ↓
9. AutoRowPlayButton.toggleAutoRowPlay()
   ↓
10. Detects isPaused === true && pausedTrackIndex.current !== null
    ↓
11. playTracksSequentially(playingRef, 3) (starts from track 3)
    ↓
12. isResuming flag = true → audio.currentTime NOT reset
    ↓
13. Playback continues from saved position
```

---

## State Management

### Component State Overview

```
AutoRowPlayButton
├── isPlaying: boolean (currently playing)
├── isPaused: boolean (paused with position saved)
├── currentTrackIndex: number | null (active track index)
├── playingRef: { current: boolean } (mutable flag for async control)
├── rowIdRef: { current: string } (tracks row identity for reordering detection)
└── pausedTrackIndex: { current: number | null } (resume position)

AudioPlayer
├── isPlaying: boolean (local audio state)
├── isLoading: boolean (metadata loading)
├── isAutoRowPlayActive: boolean (active in auto-row-play)
└── audioRef: { current: HTMLAudioElement | null }

YouTubeAudioPlayer
├── isPlaying: boolean (YouTube player state)
├── isLoading: boolean (player initialization)
├── isAutoRowPlayActive: boolean (active in auto-row-play)
└── playerRef: { current: YTPlayer | null }

HorizontalSlides
├── visibleSlides: Article[] (filtered by publishing rules)
├── audioTracks: AudioTrack[] (extracted from visible slides)
├── currentHorizontalIndex: number (active slide position)
├── currentSlideScrollState: { hasOverflow, isAtBottom, isAtTop }
└── swiperRef: { current: SwiperType | null }

ArticlesSwiper
├── articles: Article[] (all main articles)
└── swiperRef: { current: SwiperType | null }
```

### State Synchronization Patterns

#### Pattern 1: useRef for Async Control
```typescript
// Mutable flag that can be checked inside async loops
const playingRef = useRef(false)

const playTracksSequentially = async (shouldContinue: { current: boolean }) => {
  for (let i = 0; i < tracks.length; i++) {
    if (!shouldContinue.current) {  // Check mutable flag
      break
    }
    // ... async playback
  }
}

// User clicks stop
playingRef.current = false  // Immediately stops loop
```

#### Pattern 2: Event-Driven Visual Updates
```typescript
// Source component
window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
  detail: { articleId: 'abc123', rowId: 'row-id' }
}))

// Target component
useEffect(() => {
  const handleTrackActive = (event: CustomEvent) => {
    const { articleId } = event.detail
    setIsAutoRowPlayActive(articleId === thisArticleId)  // Update local state
  }

  window.addEventListener('autoRowPlayTrackActive', handleTrackActive as EventListener)
  return () => window.removeEventListener('autoRowPlayTrackActive', handleTrackActive as EventListener)
}, [thisArticleId])
```

#### Pattern 3: Scroll State Propagation
```typescript
// Child component (ArticleSlide) detects scroll
const checkScrollStatus = () => {
  const hasOverflow = element.scrollHeight > element.clientHeight
  const isAtBottom = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 5
  onScrollStatusChange?.(hasOverflow, isAtBottom, isAtTop)  // Callback to parent
}

// Parent component (HorizontalSlides) receives callback
const handleScrollStatusChange = useCallback((hasOverflow, isAtBottom, isAtTop) => {
  setCurrentSlideScrollState({ hasOverflow, isAtBottom, isAtTop })

  // Update swiper behavior
  if (swiperRef.current) {
    swiperRef.current.allowSlideNext = !hasOverflow || isAtBottom
  }
}, [])
```

---

## Playback Control Logic

### State Machine Diagram

```
[STOPPED]
    ↓ (click play)
    ↓
[PLAYING] ────→ (click pause) ────→ [PAUSED]
    ↓                                   ↓
    ↓ (all tracks complete)            ↓ (click play)
    ↓                                   ↓
[STOPPED] ←────────────────────────── RESUME [PLAYING]
    ↑                                   ↓
    └──────────── (click stop) ─────────┘
```

### State Transitions

#### STOPPED → PLAYING
```typescript
// Initial play
playingRef.current = true
setIsPlaying(true)
setIsPaused(false)
pausedTrackIndex.current = null
playTracksSequentially(playingRef, 0)  // Start from track 0
```

#### PLAYING → PAUSED
```typescript
// Pause (keeps position)
playingRef.current = false  // Stops async loop
setIsPlaying(false)
setIsPaused(true)
pauseRowAudio()  // Pause without reset
// pausedTrackIndex.current is set by loop when it detects stop
```

#### PAUSED → PLAYING (Resume)
```typescript
// Resume from saved position
playingRef.current = true
setIsPlaying(true)
setIsPaused(false)
playTracksSequentially(playingRef, pausedTrackIndex.current)  // Resume from saved index
```

#### PAUSED → STOPPED
```typescript
// Full stop
playingRef.current = false
setIsPlaying(false)
setIsPaused(false)
setCurrentTrackIndex(null)
pausedTrackIndex.current = null
stopRowAudio()  // Stop and reset all audio
```

#### PLAYING → STOPPED (Natural Completion)
```typescript
// Loop completes naturally
playingRef.current = false
setIsPlaying(false)
setIsPaused(false)
setCurrentTrackIndex(null)
pausedTrackIndex.current = null
// Audio already stopped naturally
```

### Track Progression Algorithm

```typescript
async function playTracksSequentially(shouldContinue, startIndex) {
  for (let i = startIndex; i < audioTracks.length; i++) {
    // 1. Check if user stopped/paused
    if (!shouldContinue.current) {
      if (isPaused) {
        pausedTrackIndex.current = i  // Save position
      } else {
        setCurrentTrackIndex(null)
        pausedTrackIndex.current = null
      }
      break
    }

    // 2. Update current track display
    setCurrentTrackIndex(i)

    // 3. Navigate to slide
    dispatchNavigationEvent(audioTracks[i].slideIndex)
    await delay(600)  // Wait for navigation

    // 4. Broadcast active track
    dispatchActiveTrackEvent(audioTracks[i].articleId)

    // 5. Find audio element in DOM
    const audioElement = findAudioElement(audioTracks[i].articleId)

    // 6. Stop all other audio
    stopAllAudio()
    await delay(100)  // Cleanup delay

    // 7. Re-verify element still exists
    const verifiedElement = findAudioElement(audioTracks[i].articleId)

    // 8. Play audio (resume if this is paused track)
    if (verifiedElement) {
      const isResuming = isPaused && i === pausedTrackIndex.current
      await playAudio(verifiedElement, !isResuming)  // Don't reset if resuming
    }

    // 9. Clear active indicator
    dispatchActiveTrackEvent(null)

    // 10. Optional pause between tracks
    if (pauseDuration && i < audioTracks.length - 1) {
      await delay(pauseDuration * 1000)
    }
  }

  // 11. Navigate back to start
  dispatchNavigationEvent(0)

  // 12. Reset state
  resetAllState()
}
```

### Timing Constants

```typescript
const TIMING = {
  NAVIGATION_WAIT: 600,      // Wait for swiper navigation to complete
  CLEANUP_DELAY: 100,        // Wait for audio.pause() to take effect
  STATE_BROADCAST: [10, 50, 100, 150, 300, 350]  // Multiple broadcasts for reliability
}
```

---

## Navigation Coordination

### Vertical Navigation (ArticlesSwiper)

```typescript
// Initialize swiper
<Swiper
  onSwiper={(swiper) => { swiperRef.current = swiper }}
  onSlideChange={(swiper) => {
    console.log('Vertical slide:', swiper.activeIndex)
  }}
  direction="vertical"
  loop={true}
  keyboard={{ enabled: true }}
  mousewheel={true}
/>

// Navigation functions
const goToPrevious = () => {
  if (swiperRef.current) {
    swiperRef.current.slidePrev()
  }
}

const goToNext = () => {
  if (swiperRef.current) {
    swiperRef.current.slideNext()
  }
}
```

### Horizontal Navigation (HorizontalSlides)

```typescript
// Initialize swiper
<Swiper
  onSwiper={(swiper) => {
    swiperRef.current = swiper
    broadcastHorizontalState()  // Initial state
  }}
  onSlideChange={(swiper) => {
    setCurrentHorizontalIndex(swiper.activeIndex)
    setTimeout(() => broadcastHorizontalState(), 50)
  }}
  direction="horizontal"
  loop={true}
  nested={true}
/>

// Event-driven navigation
useEffect(() => {
  const handleNavigate = (event: CustomEvent) => {
    const { horizontalIndex } = event.detail
    swiperRef.current?.slideTo(horizontalIndex)
  }

  window.addEventListener('navigateToHorizontalSlide', handleNavigate as EventListener)
  return () => window.removeEventListener('navigateToHorizontalSlide', handleNavigate as EventListener)
}, [])
```

### Navigation State Broadcasting

```typescript
const broadcastHorizontalState = useCallback(() => {
  const hasHorizontalSlides = visibleSlides.length > 1
  const swiperAllowsPrevious = swiperRef.current?.allowSlidePrev ?? true
  const swiperAllowsNext = swiperRef.current?.allowSlideNext ?? true

  window.dispatchEvent(new CustomEvent('horizontalNavigationState', {
    detail: {
      canGoPrevious: hasHorizontalSlides && swiperAllowsPrevious,
      canGoNext: hasHorizontalSlides && swiperAllowsNext,
      hasHorizontalSlides,
      currentIndex: currentHorizontalIndex,
      totalSlides: visibleSlides.length
    }
  }))
}, [currentHorizontalIndex, visibleSlides.length])
```

### DOM Query Strategy

```typescript
// Audio elements are tagged with data attributes
<audio
  ref={audioRef}
  src={audioUrl}
  data-article-id={articleId}  // Critical for targeting
/>

// Selection in AutoRowPlayButton
const audioElement = document.querySelector(
  `audio[data-article-id="${track.articleId}"]`
) as HTMLAudioElement

// Verification after cleanup
const verifiedElement = document.querySelector(
  `audio[data-article-id="${track.articleId}"]`
) as HTMLAudioElement
```

---

## Pause/Resume Functionality

### Key Innovation: True Pause (Not Stop)

Traditional approach (stops playback):
```typescript
// BAD: Resets position
audio.pause()
audio.currentTime = 0  // Lost position!
```

This implementation (preserves position):
```typescript
// GOOD: Keeps position
audio.pause()
// audio.currentTime NOT touched
```

### Position Tracking

```typescript
// State for tracking pause position
const pausedTrackIndex = useRef<number | null>(null)

// Save position when pausing
if (!shouldContinue.current && isPaused) {
  pausedTrackIndex.current = i  // Save track index
}

// Resume from saved position
if (isPaused && pausedTrackIndex.current !== null) {
  playTracksSequentially(playingRef, pausedTrackIndex.current)
}
```

### Resume Logic

```typescript
// In playAudio() function
const isResuming = isPaused && i === pausedTrackIndex.current

if (resetPosition && !isResuming) {  // Only reset if NOT resuming
  audioElement.currentTime = 0
}

audioElement.play()
```

### UI State Visualization

```typescript
// Three distinct visual states
{isPlaying ? (
  <span className="material-icons">pause_circle</span>  // Currently playing
) : isPaused ? (
  <span className="material-icons">play_circle</span>   // Paused, ready to resume
) : (
  <span className="material-icons">playlist_play</span> // Stopped/ready to start
)}

// Stop button only visible when paused
{isPaused && (
  <button onClick={stopAutoRowPlay}>
    <span className="material-icons">stop_circle</span>
  </button>
)}

// Track counter shows position even when paused
<span>
  {currentTrackIndex !== null
    ? `${currentTrackIndex + 1}/${audioTracks.length}`  // Playing
    : pausedTrackIndex.current !== null
    ? `${pausedTrackIndex.current + 1}/${audioTracks.length}`  // Paused
    : `0/${audioTracks.length}`  // Stopped
  }
</span>
```

---

## Scroll Priority System

### Problem Statement

When article content is taller than the viewport, users need to scroll through the content before navigating to the next horizontal slide. This prevents accidentally skipping content.

### Detection Logic (ArticleSlide.tsx)

```typescript
const checkScrollStatus = useCallback(() => {
  if (!scrollRef.current || !onScrollStatusChange) return

  const element = scrollRef.current
  const hasOverflow = element.scrollHeight > element.clientHeight
  const isAtBottom = Math.abs(
    element.scrollHeight - element.clientHeight - element.scrollTop
  ) < 5  // 5px tolerance
  const isAtTop = element.scrollTop < 5

  onScrollStatusChange(hasOverflow, isAtBottom, isAtTop)
}, [onScrollStatusChange])

useEffect(() => {
  const element = scrollRef.current
  if (!element) return

  // Initial check with delay for content rendering
  setTimeout(() => checkScrollStatus(), 100)

  // Listen for scroll events
  element.addEventListener('scroll', checkScrollStatus, { passive: true })

  // Listen for content size changes
  const resizeObserver = new ResizeObserver(() => {
    setTimeout(() => checkScrollStatus(), 50)
  })
  resizeObserver.observe(element)

  return () => {
    element.removeEventListener('scroll', checkScrollStatus)
    resizeObserver.disconnect()
  }
}, [checkScrollStatus])
```

### Navigation Control (HorizontalSlides.tsx)

```typescript
const handleScrollStatusChange = useCallback((
  hasOverflow: boolean,
  isAtBottom: boolean,
  isAtTop: boolean
) => {
  setCurrentSlideScrollState({ hasOverflow, isAtBottom, isAtTop })

  if (swiperRef.current) {
    if (hasOverflow && !isAtBottom) {
      // Block forward navigation, allow backward
      swiperRef.current.allowTouchMove = false
      swiperRef.current.allowSlideNext = false
      swiperRef.current.allowSlidePrev = true
      if (swiperRef.current.mousewheel) {
        swiperRef.current.mousewheel.disable()
      }
    } else {
      // Enable all navigation
      swiperRef.current.allowTouchMove = true
      swiperRef.current.allowSlideNext = true
      swiperRef.current.allowSlidePrev = true
      if (swiperRef.current.mousewheel) {
        swiperRef.current.mousewheel.enable()
      }
    }

    // Update navigation state for footer
    setTimeout(() => broadcastHorizontalState(), 10)
  }
}, [])
```

### Event Interception

```typescript
useEffect(() => {
  const { hasOverflow, isAtBottom } = currentSlideScrollState

  // Wheel event interception
  const handleWheel = (e: WheelEvent) => {
    if (hasOverflow && !isAtBottom && Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Touch event interception
  const handleTouchMove = (e: TouchEvent) => {
    if (hasOverflow && !isAtBottom) {
      const touch = e.touches[0]
      const target = e.target as HTMLElement & { _touchStartX?: number; _touchStartY?: number }
      if (touch && target._touchStartX !== undefined) {
        const deltaX = Math.abs(touch.clientX - target._touchStartX)
        const deltaY = Math.abs(touch.clientY - target._touchStartY)

        if (deltaX > deltaY && deltaX > 20) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }
  }

  // Capture phase to intercept before Swiper
  document.addEventListener('wheel', handleWheel, { passive: false, capture: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })

  return () => {
    document.removeEventListener('wheel', handleWheel, { capture: true })
    document.removeEventListener('touchmove', handleTouchMove, { capture: true })
  }
}, [currentSlideScrollState])
```

---

## Developer Recreation Guide

### Prerequisites

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "swiper": "^11.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Step-by-Step Implementation

#### Step 1: Create Audio Track Data Structure

```typescript
// types.ts
interface AudioTrack {
  url: string
  title: string
  articleId: string
  slideIndex: number
}
```

#### Step 2: Create AutoRowPlayButton Component

```typescript
// AutoRowPlayButton.tsx
import { useState, useRef } from 'react'

interface Props {
  audioTracks: AudioTrack[]
  pauseDuration?: number | null
}

export default function AutoRowPlayButton({ audioTracks, pauseDuration }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const playingRef = useRef(false)
  const pausedTrackIndex = useRef<number | null>(null)

  // Implement functions:
  // - stopAllAudio()
  // - pauseRowAudio()
  // - stopRowAudio()
  // - playAudio(element, resetPosition)
  // - playTracksSequentially(shouldContinue, startIndex)
  // - toggleAutoRowPlay()
  // - stopAutoRowPlay()

  return (/* UI */)
}
```

#### Step 3: Add Event Listeners to Audio Players

```typescript
// AudioPlayer.tsx
useEffect(() => {
  const handleAutoRowPlayTrackActive = (event: CustomEvent) => {
    const { articleId: activeId, rowId } = event.detail
    setIsAutoRowPlayActive(activeId === articleId)
  }

  window.addEventListener('autoRowPlayTrackActive', handleAutoRowPlayTrackActive as EventListener)
  return () => window.removeEventListener('autoRowPlayTrackActive', handleAutoRowPlayTrackActive as EventListener)
}, [articleId])
```

#### Step 4: Extract Audio Tracks in Parent Component

```typescript
// HorizontalSlides.tsx
useEffect(() => {
  const tracks: AudioTrack[] = []

  visibleSlides.forEach((slide, index) => {
    if (slide.audioUrl) {
      tracks.push({
        url: slide.audioUrl,
        title: slide.title,
        articleId: slide.id,
        slideIndex: index
      })
    }
  })

  setAudioTracks(tracks)
}, [visibleSlides])
```

#### Step 5: Add Navigation Event Listener

```typescript
// HorizontalSlides.tsx
useEffect(() => {
  const handleNavigate = (event: CustomEvent) => {
    const { horizontalIndex } = event.detail
    swiperRef.current?.slideTo(horizontalIndex)
  }

  window.addEventListener('navigateToHorizontalSlide', handleNavigate as EventListener)
  return () => window.removeEventListener('navigateToHorizontalSlide', handleNavigate as EventListener)
}, [])
```

#### Step 6: Render AutoRowPlayButton

```typescript
// HorizontalSlides.tsx
return (
  <>
    <AutoRowPlayButton
      audioTracks={audioTracks}
      pauseDuration={pauseDuration}
    />
    <Swiper {/* ... */}>
      {/* slides */}
    </Swiper>
  </>
)
```

#### Step 7: Add data-article-id Attributes

```typescript
// AudioPlayer.tsx
<audio
  ref={audioRef}
  src={audioUrl}
  data-article-id={articleId}
/>
```

#### Step 8: Implement Scroll Priority (Optional)

```typescript
// ArticleSlide.tsx
const checkScrollStatus = useCallback(() => {
  const hasOverflow = element.scrollHeight > element.clientHeight
  const isAtBottom = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 5
  onScrollStatusChange?.(hasOverflow, isAtBottom)
}, [])

// HorizontalSlides.tsx
const handleScrollStatusChange = useCallback((hasOverflow, isAtBottom) => {
  if (swiperRef.current) {
    swiperRef.current.allowSlideNext = !hasOverflow || isAtBottom
  }
}, [])
```

### Testing Checklist

```
□ Audio tracks extracted correctly from visible slides
□ Play button starts playback from first track
□ Sequential progression through all tracks
□ Navigation happens automatically to each slide
□ Pause button stops playback and saves position
□ Resume button continues from saved position
□ Stop button (when paused) fully resets playback
□ Track counter displays current position
□ Visual feedback (red icon) on active track
□ No audio overlap between tracks
□ Configurable pause duration works
□ Scroll priority blocks navigation when needed
□ Event cleanup prevents memory leaks
```

---

## Edge Cases & Error Handling

### 1. Empty Audio Track List

**Scenario**: Current row has no audio files

**Handling**:
```typescript
// AutoRowPlayButton.tsx
if (audioTracks.length === 0) {
  return null  // Hide button completely
}
```

### 2. Audio Loading Failure

**Scenario**: MP3 file fails to load or play

**Handling**:
```typescript
try {
  await playAudio(verifiedAudioElement, !isResuming)
} catch (error) {
  console.error(`Error playing track ${track.title}:`, error)
  // Continue to next track automatically
}
```

### 3. Track List Changes During Playback

**Scenario**: Articles reordered or added/removed while playing

**Handling**:
```typescript
// Detect row identity changes
const newRowId = audioTracks.map(t => t.articleId).join('-')
if (rowIdRef.current !== newRowId) {
  if (isPlaying || isPaused) {
    playingRef.current = false
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentTrackIndex(null)
    pausedTrackIndex.current = null
    stopRowAudio()
  }
  rowIdRef.current = newRowId
}
```

### 4. DOM Element Not Found

**Scenario**: Audio element not in DOM when playback attempted

**Handling**:
```typescript
const audioElement = document.querySelector(`audio[data-article-id="${track.articleId}"]`)
if (audioElement) {
  // Stop all audio first
  stopAllAudio()
  await delay(100)

  // Re-verify element still exists after cleanup
  const verifiedElement = document.querySelector(`audio[data-article-id="${track.articleId}"]`)
  if (verifiedElement) {
    await playAudio(verifiedElement, !isResuming)
  } else {
    console.log('Audio element disappeared after cleanup')
  }
} else {
  console.log('Audio element not found')
}
```

### 5. Browser Autoplay Restrictions

**Scenario**: Browser blocks autoplay (requires user interaction)

**Handling**:
```typescript
// Autoplay is triggered by user click on play button
// This satisfies browser autoplay policies

const toggleAutoRowPlay = () => {
  // User interaction event → autoplay allowed
  playTracksSequentially(playingRef, 0)
}
```

### 6. YouTube API Not Loaded

**Scenario**: YouTube IFrame API fails to load

**Handling**:
```typescript
// YouTubeAudioPlayer.tsx
const initializePlayer = useCallback(() => {
  if (!videoId || !containerRef.current || playerRef.current) return

  try {
    playerRef.current = new window.YT.Player(containerRef.current, {
      // ... config
    })
  } catch (error) {
    console.error('Error initializing YouTube player:', error)
    setIsLoading(false)
    // Show error icon to user
  }
}, [videoId])
```

### 7. Scroll State Race Conditions

**Scenario**: Scroll status updates while navigation in progress

**Handling**:
```typescript
// Reset scroll state on slide change
onSlideChange={(swiper) => {
  setCurrentSlideScrollState({
    hasOverflow: false,
    isAtBottom: true,
    isAtTop: true
  })

  // Re-enable navigation temporarily
  swiper.allowTouchMove = true
  swiper.allowSlideNext = true
  swiper.allowSlidePrev = true

  // New slide will report its scroll status
  setTimeout(() => checkScrollStatus(), 50)
}}
```

### 8. Memory Leaks

**Scenario**: Event listeners not cleaned up

**Prevention**:
```typescript
useEffect(() => {
  const handler = (event: CustomEvent) => { /* ... */ }

  window.addEventListener('eventName', handler as EventListener)

  return () => {
    window.removeEventListener('eventName', handler as EventListener)
  }
}, [dependencies])
```

### 9. Infinite Loop in Async Playback

**Scenario**: Playback loop doesn't stop when it should

**Prevention**:
```typescript
// Use mutable ref for immediate stop
const playingRef = useRef(false)

const playTracksSequentially = async (shouldContinue: { current: boolean }) => {
  for (let i = 0; i < tracks.length; i++) {
    if (!shouldContinue.current) {  // Check on every iteration
      break
    }
    // ... playback
  }
}

// User clicks stop
playingRef.current = false  // Immediately stops loop
```

### 10. Swiper Instance Not Initialized

**Scenario**: Navigation attempted before Swiper ready

**Handling**:
```typescript
const handleNavigate = (event: CustomEvent) => {
  if (swiperRef.current) {  // Check existence
    swiperRef.current.slideTo(horizontalIndex)
  } else {
    console.warn('Swiper not initialized yet')
  }
}
```

---

## Testing Strategy

### Unit Testing

```typescript
// AutoRowPlayButton.test.tsx
describe('AutoRowPlayButton', () => {
  test('hides when no audio tracks', () => {
    render(<AutoRowPlayButton audioTracks={[]} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  test('shows playlist_play icon when stopped', () => {
    render(<AutoRowPlayButton audioTracks={mockTracks} />)
    expect(screen.getByText('playlist_play')).toBeInTheDocument()
  })

  test('dispatches navigateToHorizontalSlide event', async () => {
    const eventSpy = jest.spyOn(window, 'dispatchEvent')
    render(<AutoRowPlayButton audioTracks={mockTracks} />)

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigateToHorizontalSlide'
        })
      )
    })
  })
})
```

### Integration Testing

```typescript
// Auto-row-play integration test
describe('Auto-Row-Play System', () => {
  test('plays tracks sequentially', async () => {
    const { container } = render(
      <HorizontalSlides
        mainArticle={mockArticle}
        subArticles={mockSubArticles}
      />
    )

    const playButton = screen.getByLabelText('Start auto-row-play')
    fireEvent.click(playButton)

    // Check first track plays
    await waitFor(() => {
      expect(container.querySelector('audio[data-article-id="track1"]').paused).toBe(false)
    })

    // Simulate audio end
    fireEvent.ended(container.querySelector('audio[data-article-id="track1"]'))

    // Check second track plays
    await waitFor(() => {
      expect(container.querySelector('audio[data-article-id="track2"]').paused).toBe(false)
    })
  })
})
```

### Manual Testing Checklist

```
BASIC FUNCTIONALITY
□ Button appears when row has audio tracks
□ Button hidden when row has no audio tracks
□ Click play starts playback from first track
□ Tracks play in correct order (left to right)
□ Auto-navigation to each slide happens
□ Playback stops at end of row
□ Returns to first slide after completion

PAUSE/RESUME
□ Click pause stops playback immediately
□ Pause icon changes to play icon
□ Stop button appears when paused
□ Track counter shows paused position
□ Click play resumes from exact position
□ Audio continues from same timestamp

STOP FUNCTIONALITY
□ Stop button only visible when paused
□ Click stop resets to beginning
□ Track counter shows 0/N
□ Icon returns to playlist_play

VISUAL FEEDBACK
□ Active track shows red icon
□ Inactive tracks show gray icon
□ Track counter updates in real-time
□ Icons change based on state

NAVIGATION COORDINATION
□ Swiper navigates to correct slides
□ Manual navigation doesn't break playback
□ Vertical navigation stops row playback
□ Horizontal manual nav works during playback

ERROR HANDLING
□ Missing audio files skip gracefully
□ Failed loads don't break progression
□ Track changes during playback reset cleanly
□ DOM element disappearance handled

SCROLL PRIORITY
□ Content overflow blocks horizontal nav
□ Scrolling to bottom enables nav
□ Auto-row-play respects scroll priority
□ Navigation unlocks after content scrolled

PERFORMANCE
□ No memory leaks after unmount
□ Event listeners cleaned up properly
□ Multiple plays don't duplicate listeners
□ No audio overlap between tracks
```

---

## Conclusion

This auto-row-play system demonstrates a robust, production-ready implementation of sequential audio playback with advanced features like true pause/resume, scroll priority awareness, and comprehensive error handling.

### Key Takeaways for Developers

1. **Event-Driven Architecture**: Use custom events for loosely coupled component communication
2. **useRef for Async Control**: Mutable refs enable immediate control over async loops
3. **DOM Query Strategy**: Tag elements with data attributes for reliable targeting
4. **State Machine Design**: Clear state transitions prevent invalid states
5. **Error Resilience**: Handle failures gracefully and continue operation
6. **User Experience**: True pause (not stop) provides expected behavior
7. **Performance**: Proper cleanup prevents memory leaks and audio overlap

### Common Pitfalls to Avoid

1. Resetting `audio.currentTime` when pausing (breaks resume)
2. Not cleaning up event listeners (memory leaks)
3. Using `useState` for async loop control (race conditions)
4. Not verifying DOM elements after cleanup (stale references)
5. Hardcoding timing values (different devices need different delays)
6. Not handling track list changes (crashes on reorder)
7. Forgetting to broadcast state updates (UI out of sync)

### Extension Opportunities

1. **Playlist Visualization**: Show track list with progress indicators
2. **Skip Controls**: Add prev/next buttons for manual track skip
3. **Loop Mode**: Repeat row option for meditation/practice
4. **Speed Control**: Playback speed adjustment (0.5x - 2x)
5. **Keyboard Shortcuts**: Space to pause, arrow keys to skip
6. **Analytics**: Track completion rates and listening patterns
7. **Bookmarking**: Save and resume from specific tracks across sessions

---

**Document Version**: 1.0
**Last Updated**: January 2025
**System Version**: vox.red v1.0 (Auto-Row-Play with Pause/Resume)
**Author**: Technical Documentation Team
