import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { closeDatabase } from '../src/lib/db'
import { createSlideRow } from '../src/lib/queries/slideRows'
import { createSlide } from '../src/lib/queries/slides'

async function seedSlideData() {
  try {
    console.log('🔄 Seeding slide data...')

    // Create "Legacy Content" row from existing hardcoded slides
    console.log('📦 Creating Legacy Content slide row...')
    const legacyRow = await createSlideRow({
      title: 'Legacy Content',
      description: 'Original hardcoded slides migrated to database',
      row_type: 'CUSTOM',
      icon_set: ['check_circle_unread', 'clock_arrow_up', 'select_check_box'],
      theme_color: '#dc2626',
      is_published: true,
      display_order: 0,
    })
    console.log('✅ Legacy Content row created:', legacyRow.id)

    // Migrate existing slides
    const slides = [
      {
        title: 'Audio Library',
        body_content: '<p>Browse meditation tracks, yoga sessions, and spiritual courses curated for your journey.</p>',
        audio_url: '/media/meditation-sample.mp3',
        position: 1,
        layout_type: 'STANDARD' as const,
      },
      {
        title: 'Playlists',
        body_content: '<p>Create and manage your personal playlists. Organize your favorite meditation sessions and spiritual practices.</p>',
        audio_url: '/media/playlist-sample.mp3',
        position: 2,
        layout_type: 'STANDARD' as const,
      },
      {
        title: 'Service Commitments',
        body_content: '<p>Daily service prompts and spiritual practices to deepen your commitment to growth and transformation.</p>',
        audio_url: '/media/service-sample.mp3',
        position: 3,
        layout_type: 'STANDARD' as const,
      },
      {
        title: 'Spiritual Teachings',
        subtitle: 'A Collection of Wisdom Traditions',
        body_content: `<p>Welcome to our comprehensive collection of spiritual teachings from various wisdom traditions around the world. This collection brings together timeless insights from Buddhism, Hinduism, Christianity, Islam, and other spiritual paths.</p>

<p>Each teaching offers unique perspectives on meditation, mindfulness, compassion, and inner transformation. Whether you're new to spiritual practice or a seasoned practitioner, these teachings provide guidance for deepening your understanding and experience.</p>

<p><strong>Buddhist Teachings:</strong> Explore the Four Noble Truths, the Eightfold Path, and practices of mindfulness meditation. Learn about compassion, loving-kindness, and the nature of suffering and liberation.</p>

<p><strong>Hindu Philosophy:</strong> Discover the wisdom of the Bhagavad Gita, Yoga Sutras, and Vedantic teachings. Understand concepts of dharma, karma, and the path to self-realization.</p>

<p><strong>Christian Contemplation:</strong> Dive into Christian mysticism, centering prayer, and the writings of saints and mystics throughout history. Explore practices of silence, contemplation, and devotion.</p>

<p><strong>Islamic Sufism:</strong> Experience the poetry and teachings of Rumi, Hafiz, and other Sufi masters. Learn about the path of divine love and spiritual awakening.</p>

<p><strong>Zen Practices:</strong> Engage with Zen koans, zazen meditation, and the teachings of Zen masters. Discover the direct path to awakening through present-moment awareness.</p>

<p><strong>Taoism:</strong> Study the Tao Te Ching and learn about wu wei (effortless action), balance, and harmony with nature.</p>

<p><strong>Indigenous Wisdom:</strong> Honor the teachings of indigenous spiritual traditions from around the world, emphasizing connection to earth, community, and sacred living.</p>

<p>These teachings are meant to be contemplated slowly, practiced deeply, and integrated into daily life. Take your time with each tradition, allowing the wisdom to settle into your heart and transform your understanding.</p>

<p>May these teachings illuminate your path and support your spiritual journey.</p>`,
        audio_url: '/media/meditation-sample.mp3',
        position: 4,
        layout_type: 'OVERFLOW' as const,
      },
    ]

    console.log('📝 Creating slides...')
    for (const slideData of slides) {
      const slide = await createSlide({
        slide_row_id: legacyRow.id,
        ...slideData,
      })
      console.log(`✅ Created slide: "${slide.title}" (position ${slide.position})`)
    }

    // Create sample "Morning Meditation Routine" row
    console.log('\n📦 Creating Morning Meditation Routine slide row...')
    const morningRow = await createSlideRow({
      title: 'Morning Meditation Routine',
      description: 'A 7-day guided meditation sequence to start your day with clarity and peace',
      row_type: 'ROUTINE',
      icon_set: ['self_improvement', 'wb_twilight', 'spa'],
      theme_color: '#2563eb',
      is_published: false, // Keep as draft
      display_order: 1,
    })
    console.log('✅ Morning Meditation Routine row created:', morningRow.id)

    const morningSlides = [
      {
        title: 'Day 1: Setting Intention',
        subtitle: 'Begin Your Journey',
        body_content: '<p>Welcome to Day 1 of your morning meditation practice. Today we focus on setting a clear intention for your spiritual journey.</p><p>Take a moment to connect with your breath and ask yourself: What do I seek to cultivate in my life?</p>',
        audio_url: '/media/meditation-sample.mp3',
        position: 1,
      },
      {
        title: 'Day 2: Breath Awareness',
        subtitle: 'The Foundation of Practice',
        body_content: '<p>Today we deepen our practice by bringing full attention to the natural rhythm of breathing. Notice each inhale and exhale without trying to change anything.</p>',
        audio_url: '/media/meditation-sample.mp3',
        position: 2,
      },
      {
        title: 'Day 3: Body Scan',
        subtitle: 'Connecting With Physical Sensations',
        body_content: '<p>In today\'s practice, we systematically bring awareness to each part of the body, releasing tension and cultivating presence from head to toe.</p>',
        audio_url: '/media/meditation-sample.mp3',
        position: 3,
      },
    ]

    console.log('📝 Creating morning meditation slides...')
    for (const slideData of morningSlides) {
      const slide = await createSlide({
        slide_row_id: morningRow.id,
        layout_type: 'STANDARD',
        ...slideData,
      })
      console.log(`✅ Created slide: "${slide.title}" (position ${slide.position})`)
    }

    console.log('\n🎉 Slide data seeding completed!')
    console.log('Summary:')
    console.log(`  - 2 slide rows created`)
    console.log(`  - ${slides.length + morningSlides.length} slides created`)
    console.log(`  - 1 published row (Legacy Content)`)
    console.log(`  - 1 draft row (Morning Meditation Routine)`)
  } catch (error) {
    console.error('❌ Slide data seeding failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedSlideData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { seedSlideData }
