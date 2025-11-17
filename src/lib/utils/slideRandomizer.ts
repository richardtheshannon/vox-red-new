/**
 * Slide Randomization Utilities
 * Provides deterministic randomization for slide rows with configurable intervals
 */

import { Slide } from '@/lib/queries/slides';

/**
 * Generate a deterministic seed based on current time and interval
 * Same seed is returned for all times within the same interval window
 *
 * @param interval - 'hourly', 'daily', or 'weekly'
 * @returns Seed as milliseconds timestamp (start of current interval window)
 */
export function getCurrentSeed(interval: 'hourly' | 'daily' | 'weekly'): number {
  const now = new Date();

  switch (interval) {
    case 'hourly':
      // Seed changes every hour (at :00)
      now.setMinutes(0, 0, 0);
      return now.getTime();

    case 'daily':
      // Seed changes every day (at midnight)
      now.setHours(0, 0, 0, 0);
      return now.getTime();

    case 'weekly':
      // Seed changes every week (Sunday at midnight)
      const day = now.getDay();
      const diff = now.getDate() - day; // Get Sunday of current week
      now.setDate(diff);
      now.setHours(0, 0, 0, 0);
      return now.getTime();

    default:
      // Fallback to daily
      now.setHours(0, 0, 0, 0);
      return now.getTime();
  }
}

/**
 * Seeded random number generator (Mulberry32 algorithm)
 * Provides deterministic pseudo-random numbers based on seed
 *
 * @param seed - Seed value for random generation
 * @returns Function that generates random numbers between 0 and 1
 */
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle with seeded random
 * Deterministically shuffles array based on seed
 *
 * @param array - Array to shuffle (not modified)
 * @param seed - Seed value for randomization
 * @returns New shuffled array
 */
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]; // Create copy to avoid mutation
  const random = seededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Get a random subset of slides with deterministic seed
 * Same seed + count will always return the same slides in the same order
 *
 * @param slides - Array of slides to randomize
 * @param count - Number of slides to return
 * @param seed - Seed value for randomization
 * @returns Array of randomized slides (subset of original)
 */
export function getRandomizedSlides(slides: Slide[], count: number, seed: number): Slide[] {
  // Edge cases
  if (slides.length === 0) return [];
  if (count <= 0) return [];
  if (count >= slides.length) {
    // If requesting more slides than available, shuffle all slides
    return shuffleWithSeed(slides, seed);
  }

  // Shuffle all slides with seed, then take first N
  const shuffled = shuffleWithSeed(slides, seed);
  return shuffled.slice(0, count);
}

/**
 * Apply randomization to slides if enabled for the row
 * Handles all edge cases and validation
 *
 * @param slides - Array of slides (already filtered by schedule)
 * @param randomizeEnabled - Whether randomization is enabled for this row
 * @param randomizeCount - Number of slides to show when randomized
 * @param randomizeInterval - Interval for re-randomization
 * @returns Randomized slides or original slides if randomization disabled
 */
export function applyRandomization(
  slides: Slide[],
  randomizeEnabled: boolean,
  randomizeCount: number | null,
  randomizeInterval: 'hourly' | 'daily' | 'weekly' | null
): Slide[] {
  // If randomization disabled or invalid config, return all slides
  if (!randomizeEnabled || !randomizeCount || !randomizeInterval) {
    return slides;
  }

  // Validate count
  if (randomizeCount < 1) {
    console.warn('[slideRandomizer] Invalid randomize_count:', randomizeCount);
    return slides;
  }

  // Get current seed based on interval
  const seed = getCurrentSeed(randomizeInterval);

  // Apply randomization
  const randomized = getRandomizedSlides(slides, randomizeCount, seed);

  console.log(`[slideRandomizer] Randomized ${slides.length} slides to ${randomized.length} (count: ${randomizeCount}, interval: ${randomizeInterval}, seed: ${seed})`);

  return randomized;
}
