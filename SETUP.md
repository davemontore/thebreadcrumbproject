# Setup Guide

This guide will help you set up The Breadcrumb Project - a secure, multi-user journaling app with Firebase Authentication and AI-powered voice transcription.

## Prerequisites

1. **Node.js** - Download from [nodejs.org](https://nodejs.org)
2. **Firebase Account** - Free at [firebase.google.com](https://firebase.google.com)
3. **OpenAI Account** - For Whisper API at [openai.com](https://openai.com)

## Step 1: Set Up Firebase Project

### 1. **Create Firebase Project:**
- Go to [firebase.google.com](https://firebase.google.com)
- Click "Get started"
- Create a new project
- Give it a name (e.g., "breadcrumb-project")
- Enable Google Analytics (optional)
- Click "Create project"

### 2. **Create Realtime Database:**
- In your Firebase project, click "Realtime Database"
- Click "Create database"
- Choose "Start in test mode" for Realtime Database
- Select a location close to you
- Click "Done"

### 3. **Enable Firebase Authentication:**
- In your Firebase project, click "Authentication"
- Click "Get started"
- Go to "Sign-in method" tab
- Enable "Email/Password" provider
- Click "Save"

### 4. **Get Firebase Config:**
- In your Firebase project, click the gear icon (⚙️)
- Click "Project settings"
- Scroll down to "Your apps"
- Click the web icon (</>)
- Give your app a nickname (e.g., "breadcrumb-web")
- Click "Register app"
- Copy the config object

## Step 2: Set Up Environment Variables

### 1. **Copy Environment Template:**
```bash
cp env.example .env.local
```

### 2. **Update Environment Variables:**
Replace the values in `.env.local` with your actual Firebase config:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI Whisper API
OPENAI_API_KEY=your_openai_api_key_here

# Invitation Codes (comma-separated, no spaces)
NEXT_PUBLIC_INVITATION_CODES=family2024,friends2024,trusted2024
```

### 3. **Get OpenAI API Key:**
- Go to [platform.openai.com](https://platform.openai.com)
- Sign up or log in
- Go to "API Keys"
- Create a new secret key
- Copy the key to your `.env.local` file

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the App

### 1. **Test Authentication:**
- Visit the login page
- Try creating an account with an invitation code
- Test logging in and out

### 2. **Test Voice Recording:**
- Create a new entry using voice recording
- Verify transcription works
- Check that entries are saved

### 3. **Test Cross-Device Sync:**
- Open the app on another device
- Verify entries appear
- Test real-time updates

## Step 6: Configure Firebase Security Rules

### 1. **Update Database Rules:**
In your Firebase Console, go to Realtime Database → Rules and set:

```json
{
  "rules": {
    "users": {
      "$uid": {
        "journal_entries": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid"
        }
      }
    },
    "journal_entries": {
      ".read": false,
      ".write": false
    }
  }
}
```

**Important**: These rules enforce user isolation and block the old shared path.

### 2. **Add Authorized Domains:**
- Go to Firebase Console → Authentication → Settings
- Add your domains to "Authorized domains":
  - `localhost` (for development)
  - `your-app.vercel.app` (for production)
  - Your custom domain (if using one)

## Environment Variables Reference

### Required Variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL` - Realtime Database URL
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID
- `OPENAI_API_KEY` - OpenAI API key for Whisper transcription
- `NEXT_PUBLIC_INVITATION_CODES` - Comma-separated invitation codes

### Optional Variables:
- `NEXT_PUBLIC_MIGRATION_USER_IDS` - For migrating existing data (see DATABASE.md)

## Troubleshooting

### Common Issues:

1. **"Firebase connection failed"**
   - Check your `.env.local` file exists
   - Verify your Firebase project is active
   - Ensure all environment variables are set correctly
   - Check that Realtime Database is created

2. **"Invalid invitation code"**
   - Verify `NEXT_PUBLIC_INVITATION_CODES` is set
   - Check that codes are comma-separated without spaces
   - Ensure the code matches exactly (case-sensitive)
   - Restart the development server after changing environment variables

3. **"Authentication failed"**
   - Verify Firebase Authentication is enabled
   - Check that Email/Password provider is enabled
   - Ensure authorized domains are configured
   - Check browser console for specific error messages

4. **"Voice recording not working"**
   - Check that `OPENAI_API_KEY` is set
   - Verify API key has sufficient credits
   - Check microphone permissions in browser
   - Test API key separately

5. **"No entries visible"**
   - Check that user is authenticated
   - Verify Firebase database rules allow user access
   - Check browser console for authentication status
   - Ensure database rules are published

6. **"Method not allowed" errors**
   - Make sure you're using the latest version
   - Check that all API routes are working
   - Verify environment variables are set correctly

### Environment Variables Checklist:
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- [ ] `OPENAI_API_KEY`
- [ ] `NEXT_PUBLIC_INVITATION_CODES`

## Costs

- **Firebase**: Free tier (1GB database, 10GB bandwidth, 10K authentications/month)
- **Vercel**: Free tier (100GB bandwidth)
- **Whisper API**: Pay per use (~$0.006 per minute)

## Security Features

- **User Isolation**: Each user's data is completely separate
- **Firebase Auth**: Industry-standard authentication
- **Invitation Codes**: Controlled access to prevent unauthorized signups
- **Secure Database**: Firebase provides enterprise-grade security
- **HTTPS Only**: All connections use HTTPS

## Next Steps

1. **Deploy to Production**: See [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Configure Custom Domain**: See [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Set Up Monitoring**: Monitor usage in Firebase Console
4. **Backup Strategy**: Consider regular data exports

Your journal app is now set up and ready to use! 🎉 