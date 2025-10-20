import { Slide } from '../queries/slides';

/**
 * Checks if a slide should be visible based on its scheduling settings
 * Uses the visitor's browser timezone for all time calculations
 *
 * @param slide - The slide to check
 * @returns true if slide should be visible, false otherwise
 */
export function isSlideVisibleNow(slide: Slide): boolean {
  // If slide is not published at all, hide it
  if (!slide.is_published) {
    return false;
  }

  // Check if slide is temporarily unpublished
  if (slide.temp_unpublish_until) {
    const now = new Date();
    const unpublishUntil = new Date(slide.temp_unpublish_until);

    // If current time is before the unpublish deadline, hide the slide
    if (now < unpublishUntil) {
      return false;
    }
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Check day-of-week restrictions
  if (slide.publish_days) {
    try {
      const allowedDays: number[] = JSON.parse(slide.publish_days);

      // If array has items and current day is not in it, hide the slide
      if (allowedDays.length > 0 && !allowedDays.includes(currentDay)) {
        return false;
      }
    } catch (error) {
      console.error('Error parsing publish_days:', error);
      // On parse error, assume no day restrictions
    }
  }

  // Check time-of-day restrictions
  const hasTimeStart = slide.publish_time_start !== null && slide.publish_time_start !== undefined;
  const hasTimeEnd = slide.publish_time_end !== null && slide.publish_time_end !== undefined;

  if (hasTimeStart || hasTimeEnd) {
    const startMinutes = hasTimeStart ? parseTimeToMinutes(slide.publish_time_start!) : 0;
    const endMinutes = hasTimeEnd ? parseTimeToMinutes(slide.publish_time_end!) : 1439; // 23:59

    // Handle overnight time ranges (e.g., 22:00 - 03:00)
    if (startMinutes > endMinutes) {
      // Overnight: visible if EITHER after start OR before end
      if (currentTime < startMinutes && currentTime >= endMinutes) {
        return false;
      }
    } else {
      // Normal range: visible if between start and end
      if (currentTime < startMinutes || currentTime >= endMinutes) {
        return false;
      }
    }
  }

  // All checks passed - slide is visible
  return true;
}

/**
 * Converts a time string (HH:MM or HH:MM:SS) to minutes since midnight
 * @param timeStr - Time string in format "14:30" or "14:30:00"
 * @returns Minutes since midnight (0-1439)
 */
function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Filters an array of slides to only include visible ones based on scheduling
 * @param slides - Array of slides to filter
 * @returns Filtered array of visible slides
 */
export function filterVisibleSlides(slides: Slide[]): Slide[] {
  return slides.filter(isSlideVisibleNow);
}

/**
 * Format time for display (converts HH:MM to 12-hour format)
 * @param timeStr - Time string in 24-hour format (HH:MM)
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTimeForDisplay(timeStr: string | null | undefined): string {
  if (!timeStr) return '--:--';

  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Get day names from array of day numbers
 * @param dayNumbers - Array of day numbers (0-6)
 * @returns Array of day names (e.g., ["Monday", "Wednesday"])
 */
export function getDayNames(dayNumbers: number[]): string[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNumbers.map(num => dayNames[num] || 'Unknown');
}
