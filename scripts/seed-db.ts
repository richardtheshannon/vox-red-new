import { config } from 'dotenv'

// Load environment variables from .env file FIRST
config()

import { query } from '../src/lib/db'

const seedData = async () => {
  try {
    console.log('🌱 Seeding database with initial data...')

    // Create default admin user
    await query(`
      INSERT INTO users (id, email, username, name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin-001', 'admin@mp3manager.local', 'admin', 'Administrator', 'ADMIN'])

    // Create categories
    const categories = [
      { name: 'Meditation', description: 'Guided meditations and mindfulness practices', color: '#4F46E5', icon: 'self_improvement' },
      { name: 'Yoga', description: 'Yoga sessions and breathing exercises', color: '#059669', icon: 'fitness_center' },
      { name: 'Courses', description: 'Educational spiritual courses and teachings', color: '#DC2626', icon: 'school' },
      { name: 'Mantras', description: 'Sacred chants and mantras', color: '#7C2D12', icon: 'record_voice_over' }
    ]

    for (const category of categories) {
      await query(`
        INSERT INTO categories (name, description, color, icon)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.description, category.color, category.icon])
    }

    // Create sample service commitments
    const serviceCommitments = [
      {
        title: 'Morning Gratitude Practice',
        description: 'Start your day with appreciation and positive intention',
        prompt: 'Begin each morning by writing down three things you are grateful for and setting a positive intention for the day ahead.',
        category: 'Morning Practices'
      },
      {
        title: 'Evening Reflection',
        description: 'End your day with mindful contemplation',
        prompt: 'Before sleep, spend 5 minutes reflecting on the day: What went well? What did you learn? How can tomorrow be even better?',
        category: 'Evening Practices'
      },
      {
        title: 'Acts of Kindness',
        description: 'Spread compassion through daily service',
        prompt: 'Perform one genuine act of kindness today, no matter how small. Notice how it affects both you and the recipient.',
        category: 'Service'
      },
      {
        title: 'Mindful Breathing',
        description: 'Center yourself with conscious breathing',
        prompt: 'Take 10 conscious breaths at three different times today. Focus completely on the sensation of breathing.',
        category: 'Mindfulness'
      },
      {
        title: 'Digital Detox Hour',
        description: 'Create space for inner peace',
        prompt: 'Spend one hour today completely disconnected from digital devices. Use this time for reflection, nature, or meaningful connection.',
        category: 'Balance'
      }
    ]

    for (const commitment of serviceCommitments) {
      await query(`
        INSERT INTO service_commitments (title, description, prompt, category)
        VALUES ($1, $2, $3, $4)
      `, [commitment.title, commitment.description, commitment.prompt, commitment.category])
    }

    // Create sample documentation
    const docs = [
      {
        title: 'Getting Started with MP3 Manager',
        content: 'Welcome to MP3 Manager! This guide will help you get started with organizing your spiritual audio library.',
        category: 'User Guide',
        is_published: true
      },
      {
        title: 'Creating Playlists',
        content: 'Learn how to create and manage your personal playlists for different spiritual practices.',
        category: 'User Guide',
        is_published: true
      },
      {
        title: 'Admin Interface Guide',
        content: 'Complete guide for administrators managing the MP3 Manager backend.',
        category: 'Admin Guide',
        is_published: true
      }
    ]

    for (const doc of docs) {
      await query(`
        INSERT INTO documentation (title, content, category, is_published)
        VALUES ($1, $2, $3, $4)
      `, [doc.title, doc.content, doc.category, doc.is_published])
    }

    console.log('✅ Database seeded successfully with:')
    console.log('   - 1 Admin user')
    console.log('   - 4 Categories (Meditation, Yoga, Courses, Mantras)')
    console.log('   - 5 Service Commitments')
    console.log('   - 3 Documentation articles')

  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('🎉 Database seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Database seeding failed:', error)
      process.exit(1)
    })
}

export { seedData }