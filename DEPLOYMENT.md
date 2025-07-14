# Deployment Guide

## Prerequisites

1. **Install Node.js**: Download and install Node.js from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. **Supabase Setup**: Make sure your Supabase project is configured with the correct environment variables

## Environment Variables

Create a `.env.local` file in your project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Option 2: Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Set build command: `npm run build`
5. Set publish directory: `.next`

### Option 3: Railway

1. Push your code to GitHub
2. Connect your repository to Railway
3. Add environment variables in Railway dashboard
4. Deploy automatically

## Database Setup

Make sure your Supabase database has the following table:

```sql
CREATE TABLE breadcrumbs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  type TEXT CHECK (type IN ('audio', 'text')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE breadcrumbs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own breadcrumbs
CREATE POLICY "Users can view own breadcrumbs" ON breadcrumbs
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own breadcrumbs
CREATE POLICY "Users can insert own breadcrumbs" ON breadcrumbs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own breadcrumbs
CREATE POLICY "Users can update own breadcrumbs" ON breadcrumbs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own breadcrumbs
CREATE POLICY "Users can delete own breadcrumbs" ON breadcrumbs
  FOR DELETE USING (auth.uid() = user_id);
```

## Troubleshooting

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check that environment variables are set correctly
- Verify Supabase connection

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that `tailwind.config.js` and `postcss.config.js` exist
- Verify that `globals.css` includes Tailwind directives

### Database Issues
- Check Supabase project settings
- Verify table structure matches the expected schema
- Ensure Row Level Security policies are in place 