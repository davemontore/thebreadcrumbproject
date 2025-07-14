# Cloud Journal Setup Guide

This journal app syncs across all your devices using Supabase cloud database.

## Prerequisites

1. **Supabase Account** - Free at [supabase.com](https://supabase.com)
2. **GitHub Account** - For code storage
3. **Vercel Account** - Free deployment at [vercel.com](https://vercel.com)

## Step 1: Set Up Supabase Database

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "my-journal")
   - Set a database password
   - Choose a region close to you
   - Click "Create new project"

2. **Create Database Table:**
   - In your Supabase dashboard, go to "SQL Editor"
   - Run this SQL command:
   ```sql
   CREATE TABLE journal_entries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Get Your API Keys:**
   - Go to "Settings" → "API"
   - Copy your "Project URL"
   - Copy your "anon public" key

## Step 2: Configure Environment Variables

1. **Create `.env.local` file:**
   ```bash
   cp env.example .env.local
   ```

2. **Add your Supabase credentials:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Test Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test the app:**
   - Open `http://localhost:3000`
   - Set up your password
   - Create a journal entry
   - Verify it saves to Supabase

## Step 4: Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add cloud sync journal app"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Your app is now live!**
   - Access from any device
   - All entries sync automatically
   - Password protected

## How It Works

- **Cloud Database**: All entries stored in Supabase
- **Real-time Sync**: Changes appear instantly across devices
- **Password Protection**: Secure access with your password
- **Mobile Optimized**: Works great on phones and tablets
- **Automatic Deployment**: Updates when you push to GitHub

## Security Features

- **Password Protection**: Your journal is protected by a password
- **Secure Database**: Supabase provides enterprise-grade security
- **HTTPS**: All connections are encrypted
- **No Public Access**: Only you can access your data

## Troubleshooting

### App won't start
- Check that Supabase environment variables are set
- Verify your Supabase project is active
- Check the browser console for errors

### Entries not syncing
- Verify your Supabase credentials are correct
- Check that the database table was created
- Ensure you're using the same password on all devices

### Deployment issues
- Make sure environment variables are set in Vercel
- Check that your GitHub repository is public or Vercel has access
- Verify the build completes successfully

## Cost

- **Supabase**: Free tier includes 500MB database, 2GB bandwidth
- **Vercel**: Free tier includes unlimited deployments
- **GitHub**: Free for public repositories

This setup gives you a professional, secure journal that syncs across all your devices! 