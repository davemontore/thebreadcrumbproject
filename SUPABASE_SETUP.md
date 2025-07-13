# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `breadcrumb-project`
   - Database Password: Choose a strong password
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 3: Set Environment Variables

1. Create a file called `.env.local` in your project root
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Create Database Table

1. In your Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Paste and run this SQL:

```sql
-- Create breadcrumbs table
CREATE TABLE breadcrumbs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  type TEXT CHECK (type IN ('audio', 'text')) DEFAULT 'text',
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

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_breadcrumbs_updated_at 
    BEFORE UPDATE ON breadcrumbs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 5: Enable Email Authentication

1. In your Supabase dashboard, go to Authentication → Settings
2. Under "Email Auth", make sure it's enabled
3. (Optional) Configure email templates if you want custom emails

## Step 6: Test the Setup

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Go to `http://localhost:3000`
4. Try creating an account and adding a breadcrumb

## Step 7: Deploy

1. Commit your changes: `git add . && git commit -m "Add Supabase integration"`
2. Push to GitHub: `git push origin master`
3. Your GitHub Actions should automatically deploy the changes

## Troubleshooting

### Common Issues:

1. **"Cannot find module '@supabase/supabase-js'"**
   - Run `npm install` to install dependencies

2. **"Invalid API key"**
   - Double-check your environment variables in `.env.local`
   - Make sure you copied the correct anon key (not the service role key)

3. **"Permission denied"**
   - Make sure you ran the SQL to create the RLS policies
   - Check that the user is authenticated

4. **"Table doesn't exist"**
   - Make sure you ran the SQL to create the breadcrumbs table

### Getting Help:

- Check the Supabase documentation: https://supabase.com/docs
- Check the browser console for error messages
- Verify your environment variables are loaded correctly 