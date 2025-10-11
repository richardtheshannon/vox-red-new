# Railway Deployment Guide for MP3 Manager

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your code
- PostgreSQL service on Railway

## Step 1: Create Railway Project

1. Go to https://railway.app and create a new project
2. Connect your GitHub repository (`richardtheshannon/vox-red-new`)
3. Select the `nextjs-app` directory as the root

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database and provide environment variables

## Step 3: Configure Environment Variables

Railway will automatically provide `DATABASE_URL`. Add these additional environment variables in the Railway dashboard:

```env
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-app-name.railway.app
MAX_FILE_SIZE=50000000
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/mp3,audio/flac,audio/ogg
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=secure-password-here
```

## Step 4: Prepare for Deployment

Before deploying, you need to switch to the PostgreSQL schema:

```bash
# Copy the PostgreSQL schema over the SQLite schema
cp railway.schema.prisma prisma/schema.prisma

# Commit the change
git add .
git commit -m "Switch to PostgreSQL for Railway deployment"
git push origin master
```

## Step 5: Deploy

1. Railway will automatically detect the changes and start deploying
2. The deployment will:
   - Install dependencies
   - Generate Prisma client
   - Build the Next.js application
   - Run database migrations automatically (via postinstall script)

## Step 6: Seed the Database

After deployment, you can seed the database with initial data:

1. Go to Railway dashboard
2. Open your web service
3. Go to "Connect" tab and get the shell command
4. Run: `npm run db:seed`

## Step 7: Verify Deployment

1. Visit your Railway app URL
2. Test the database connection: `https://your-app.railway.app/api/test-db`
3. Should return: `{"status":"success","message":"Database connection successful","data":{"users":1,"categories":4,"serviceCommitments":2}}`

## Database Models Included

Your MP3 Manager now has a complete database schema:

- **Users**: Admin/user management with roles
- **AudioFiles**: Complete metadata support for MP3s
- **Playlists**: User playlists with ordering
- **Categories**: Meditation, Yoga, Courses, Mantras
- **ServiceCommitments**: Daily service prompt repository
- **BugReports**: Admin issue tracking
- **Documentation**: Help articles management
- **Analytics**: System usage tracking

## Railway Configuration Files

- `railway.json`: Railway-specific deployment configuration
- `railway.schema.prisma`: PostgreSQL-optimized schema
- Health check endpoint: `/api/test-db`

## Local vs Production

- **Local**: SQLite database (`dev.db`)
- **Production**: PostgreSQL (Railway managed)
- Both use the same Prisma models and API structure

## Troubleshooting

1. **Build fails**: Check that all dependencies are in package.json
2. **Database errors**: Verify DATABASE_URL is set by Railway
3. **Migration issues**: Ensure railway.schema.prisma is copied to prisma/schema.prisma
4. **Health check fails**: Check /api/test-db endpoint logs in Railway dashboard

The application is now ready for production use with a full-featured database backend!