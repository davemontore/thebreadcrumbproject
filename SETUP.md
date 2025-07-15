# Setup Guide

This journal app syncs across all your devices using Firebase cloud database.

## Prerequisites

1. **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org)
2. **Firebase Account** - Free at [firebase.google.com](https://firebase.google.com)
3. **Git** (optional) - For version control

## Step 1: Set Up Firebase Database

### 1. **Create Firebase Project:**
- Go to [firebase.google.com](https://firebase.google.com)
- Click "Get started" or "Create a project"
- Name your project (e.g., "my-journal-app")
- Follow the setup wizard
- Choose "Start in test mode" for Firestore

### 2. **Create Firestore Database:**
- In your Firebase project, click "Firestore Database"
- Click "Create database"
- Choose "Start in test mode"
- Pick a location close to you
- Click "Done"

### 3. **Get Firebase Config:**
- Click the gear icon → "Project settings"
- Scroll down to "Your apps"
- Click the web icon (</>)
- Register your app with any name
- Copy the config object

## Step 2: Configure Environment Variables

1. **Create `.env.local` file** in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. **Replace the values** with your actual Firebase config

## Step 3: Install and Run

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
- Go to http://localhost:3000
- Create your first journal entry
- Verify it saves to Firebase

## Step 4: Deploy (Optional)

### Deploy to Vercel (Recommended):

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push
```

2. **Deploy to Vercel:**
- Go to [vercel.com](https://vercel.com)
- Connect your GitHub repository
- Add your environment variables
- Deploy!

## Features

- **Text Journaling**: Write your thoughts and memories
- **Cross-Device Sync**: Access from phone, tablet, computer
- **Real-time Updates**: Changes appear instantly
- **Secure Storage**: All data encrypted and secure
- **Beautiful Design**: Clean, distraction-free interface

## Troubleshooting

### Common Issues:

1. **"Firebase connection failed"**
   - Check that all environment variables are set
   - Verify your Firebase project is active
   - Make sure Firestore database is created

2. **"App won't load"**
   - Check that all dependencies are installed
   - Verify Node.js version is 16 or higher
   - Check browser console for errors

3. **"Cannot save entries"**
   - Verify Firebase config is correct
   - Check that Firestore is in test mode
   - Clear browser cache and try again

### Environment Variables:

Make sure these are set in your `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Cost

- **Firebase**: Free tier (1GB database, 10GB bandwidth)
- **Vercel**: Free tier (unlimited deployments)
- **Total**: $0/month for personal use

## Security

- **Encrypted Data**: All data encrypted in transit and at rest
- **Secure Database**: Firebase provides enterprise-grade security
- **User Isolation**: Each user's data is completely separate
- **No Data Mining**: Your data belongs to you

Your secure, syncing journal is ready to use! 