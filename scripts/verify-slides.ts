import { config } from 'dotenv'
config()

import { closeDatabase } from '../src/lib/db'
import { getAllSlideRows } from '../src/lib/queries/slideRows'
import { getSlidesForRow } from '../src/lib/queries/slides'

async function verifySlides() {
  try {
    console.log('🔍 Verifying slide data...\n')

    const rows = await getAllSlideRows()
    console.log(`📊 Found ${rows.length} slide rows:\n`)

    for (const row of rows) {
      console.log(`${row.is_published ? '✅' : '📝'} ${row.title}`)
      console.log(`   Type: ${row.row_type}`)
      console.log(`   Slides: ${row.slide_count}`)
      console.log(`   Published: ${row.is_published}`)
      console.log(`   Order: ${row.display_order}`)
      if (row.icon_set && row.icon_set.length > 0) {
        console.log(`   Icons: ${row.icon_set.join(', ')}`)
      }

      const slides = await getSlidesForRow(row.id)
      console.log(`   Slide details:`)
      for (const slide of slides) {
        console.log(`     ${slide.position}. ${slide.title} (${slide.layout_type})`)
      }
      console.log('')
    }

    console.log('✅ Verification complete!')
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

verifySlides()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
