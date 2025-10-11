import { pool } from '../src/lib/db'

const createTables = `
-- User Management
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    role VARCHAR DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audio File Management
CREATE TABLE IF NOT EXISTS audio_files (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR NOT NULL,
    artist VARCHAR,
    album VARCHAR,
    genre VARCHAR,
    duration INTEGER, -- Duration in seconds
    file_size INTEGER, -- File size in bytes
    file_name VARCHAR UNIQUE NOT NULL,
    file_path VARCHAR UNIQUE NOT NULL,
    mime_type VARCHAR,
    bitrate INTEGER,
    sample_rate INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Metadata
    year INTEGER,
    track_number INTEGER,
    album_art VARCHAR, -- URL or path to album art

    -- Status and moderation
    status VARCHAR DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING')),
    is_public BOOLEAN DEFAULT FALSE
);

-- Playlist Management
CREATE TABLE IF NOT EXISTS playlists (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    cover_art VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playlist_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT NOW(),
    playlist_id VARCHAR NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    audio_file_id VARCHAR NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
    UNIQUE(playlist_id, audio_file_id)
);

-- Category Management (for organizing content)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR, -- Hex color for UI
    icon VARCHAR, -- Material icon name
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    added_at TIMESTAMP DEFAULT NOW(),
    category_id VARCHAR NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    audio_file_id VARCHAR NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
    UNIQUE(category_id, audio_file_id)
);

-- User favorites (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    audio_file_id VARCHAR NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, audio_file_id)
);

-- Service Commitments (for your service prompts repository)
CREATE TABLE IF NOT EXISTS service_commitments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    prompt TEXT NOT NULL,
    category VARCHAR,
    tags TEXT, -- JSON array of tags
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bug Reports & Documentation
CREATE TABLE IF NOT EXISTS bug_reports (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    steps TEXT,
    priority VARCHAR DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    reported_by VARCHAR, -- User email or name
    assigned_to VARCHAR, -- Admin/developer
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Documentation/Help Articles
CREATE TABLE IF NOT EXISTS documentation (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR,
    tags TEXT, -- JSON array of tags
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System Analytics
CREATE TABLE IF NOT EXISTS analytics (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event VARCHAR NOT NULL, -- Event name (e.g., "file_upload", "playlist_create")
    data TEXT, -- JSON data
    user_id VARCHAR,
    session_id VARCHAR,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_audio_files_title ON audio_files(title);
CREATE INDEX IF NOT EXISTS idx_audio_files_artist ON audio_files(artist);
CREATE INDEX IF NOT EXISTS idx_audio_files_status ON audio_files(status);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_category_items_category_id ON category_items(category_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);

-- Create trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_commitments_updated_at BEFORE UPDATE ON service_commitments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bug_reports_updated_at BEFORE UPDATE ON bug_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentation_updated_at BEFORE UPDATE ON documentation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing PostgreSQL database...')

    const client = await pool.connect()
    try {
      // Execute the CREATE TABLES script
      await client.query(createTables)
      console.log('✅ Database tables created successfully')
    } finally {
      client.release()
    }

    console.log('🎉 Database initialization completed!')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { initializeDatabase }