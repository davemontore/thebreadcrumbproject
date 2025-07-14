# Deployment Requirements

## Important Notes

**This is NOT a locally-run app.** This application requires cloud deployment because:

1. **Database Syncing**: Uses Supabase database to sync data across multiple devices
2. **Cross-Device Access**: Users need to access their breadcrumbs from any device
3. **Real-time Updates**: Database changes need to be available immediately across all devices

## Deployment Options

### Vercel (Recommended)
- Perfect for Next.js applications
- Automatic deployments from GitHub
- Built-in environment variable management
- Free tier available

### Required Environment Variables
- `SUPABASE_DATABASE_URL` - Your Supabase project URL
- `SUPABASE_API_KEY` - Your Supabase API key

### Required GitHub Secrets for Vercel Deployment
- `VERCEL_TOKEN` - Vercel authentication token
- `ORG_ID` - Vercel organization ID  
- `PROJECT_ID` - Vercel project ID

## Local Development
While the app can be run locally for development, it will still connect to the cloud Supabase database. Local development is for testing and development only.

## Setup Instructions
1. Create a Vercel account
2. Connect your GitHub repository
3. Add the required environment variables in Vercel dashboard
4. Add the required secrets to GitHub repository
5. Deploy automatically via GitHub Actions 