// Offline Manager - Handles downloading and caching content for offline use

export interface OfflineProgress {
  status: 'idle' | 'downloading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  totalAssets: number;
  cachedAssets: number;
}

export interface CachedSlideRow {
  id: string;
  title: string;
  row_type: string;
  slides: CachedSlide[];
  row_background_image_url: string | null;
  row_layout_type: string | null;
  playlist_delay_seconds: number;
  randomize_enabled: boolean;
  randomize_count: number | null;
  randomize_interval: 'hourly' | 'daily' | 'weekly' | null;
}

export interface CachedSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  body_content: string | null;
  image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  layout_type: string | null;
  content_theme: 'light' | 'dark' | null;
  title_bg_opacity: string | null;
  publish_time_start: string | null;
  publish_time_end: string | null;
  publish_days: number[] | null;
  temp_unpublish_until: string | null;
  icon_set: string | null;
}

const OFFLINE_DATA_KEY = 'offline-slide-data';
const OFFLINE_STATUS_KEY = 'offline-status';

/**
 * Download and cache all visible content for offline use
 */
export async function downloadContentForOffline(
  onProgress?: (progress: OfflineProgress) => void
): Promise<void> {
  let totalAssets = 0;
  let cachedAssets = 0;

  const updateProgress = (status: OfflineProgress['status'], message: string) => {
    const progress: OfflineProgress = {
      status,
      progress: totalAssets > 0 ? Math.round((cachedAssets / totalAssets) * 100) : 0,
      message,
      totalAssets,
      cachedAssets
    };
    onProgress?.(progress);
  };

  try {
    updateProgress('downloading', 'Fetching slide rows...');

    // Fetch all published slide rows
    const rowsResponse = await fetch('/api/slides/rows?published=true');
    if (!rowsResponse.ok) {
      throw new Error('Failed to fetch slide rows');
    }
    const rowsData = await rowsResponse.json();

    if (rowsData.status !== 'success' || !rowsData.rows) {
      throw new Error('Invalid slide rows response');
    }

    const rows = rowsData.rows;
    const cachedRows: CachedSlideRow[] = [];

    // Fetch slides for each row
    for (const row of rows) {
      updateProgress('downloading', `Fetching slides for ${row.title}...`);

      const slidesResponse = await fetch(`/api/slides/rows/${row.id}/slides?published=true`);
      if (!slidesResponse.ok) {
        console.warn(`Failed to fetch slides for row ${row.id}`);
        continue;
      }

      const slidesData = await slidesResponse.json();
      if (slidesData.status !== 'success' || !slidesData.slides) {
        console.warn(`Invalid slides response for row ${row.id}`);
        continue;
      }

      const slides = slidesData.slides;

      // Collect all media URLs (images and audio)
      const mediaUrls: string[] = [];

      if (row.row_background_image_url) {
        mediaUrls.push(row.row_background_image_url);
      }

      slides.forEach((slide: CachedSlide) => {
        if (slide.image_url) mediaUrls.push(slide.image_url);
        if (slide.audio_url) mediaUrls.push(slide.audio_url);
        // Note: video_url is excluded from offline cache (too large)
      });

      totalAssets += mediaUrls.length;

      // Cache the row data
      cachedRows.push({
        id: row.id,
        title: row.title,
        row_type: row.row_type,
        slides: slides,
        row_background_image_url: row.row_background_image_url,
        row_layout_type: row.row_layout_type,
        playlist_delay_seconds: row.playlist_delay_seconds,
        randomize_enabled: row.randomize_enabled,
        randomize_count: row.randomize_count,
        randomize_interval: row.randomize_interval
      });

      // Cache media files
      updateProgress('downloading', `Caching media for ${row.title}...`);

      for (const url of mediaUrls) {
        try {
          // Pre-cache media by fetching it
          const response = await fetch(url);
          if (response.ok) {
            cachedAssets++;
            updateProgress('downloading', `Cached ${cachedAssets}/${totalAssets} assets...`);
          }
        } catch (err) {
          console.warn(`Failed to cache media: ${url}`, err);
        }
      }
    }

    // Store cached data in localStorage
    updateProgress('downloading', 'Saving offline data...');
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(cachedRows));
    localStorage.setItem(OFFLINE_STATUS_KEY, JSON.stringify({
      isOfflineReady: true,
      lastUpdated: new Date().toISOString(),
      totalRows: cachedRows.length,
      totalAssets: cachedAssets
    }));

    updateProgress('complete', `Downloaded ${cachedRows.length} rows with ${cachedAssets} media files`);
  } catch (err) {
    console.error('Error downloading content for offline:', err);
    updateProgress('error', err instanceof Error ? err.message : 'Failed to download content');
    throw err;
  }
}

/**
 * Get offline status
 */
export function getOfflineStatus(): {
  isOfflineReady: boolean;
  lastUpdated: string | null;
  totalRows: number;
  totalAssets: number;
} {
  try {
    const status = localStorage.getItem(OFFLINE_STATUS_KEY);
    if (!status) {
      return { isOfflineReady: false, lastUpdated: null, totalRows: 0, totalAssets: 0 };
    }
    return JSON.parse(status);
  } catch {
    return { isOfflineReady: false, lastUpdated: null, totalRows: 0, totalAssets: 0 };
  }
}

/**
 * Get cached slide rows
 */
export function getCachedSlideRows(): CachedSlideRow[] {
  try {
    const data = localStorage.getItem(OFFLINE_DATA_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Get cached slides for a specific row
 */
export function getCachedSlidesForRow(rowId: string): CachedSlide[] {
  const rows = getCachedSlideRows();
  const row = rows.find(r => r.id === rowId);
  return row?.slides || [];
}

/**
 * Clear offline cache
 */
export function clearOfflineCache(): void {
  localStorage.removeItem(OFFLINE_DATA_KEY);
  localStorage.removeItem(OFFLINE_STATUS_KEY);

  // Also clear service worker caches
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });
  }
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Register online/offline event listeners
 */
export function registerNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
