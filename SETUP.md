# Setup Guide

This journal app syncs across all your devices using Firebase Realtime Database.

## Prerequisites

1. **Node.js** - Download from [nodejs.org](https://nodejs.org)
2. **Firebase Account** - Free at [firebase.google.com](https://firebase.google.com)

## Step 1: Set Up Firebase Realtime Database

### 1. **Create Firebase Project:**
- Go to [firebase.google.com](https://firebase.google.com)
- Click "Get started"
- Create a new project
- Give it a name (e.g., "my-journal-app")
- Enable Google Analytics (optional)
- Click "Create project"

### 2. **Create Realtime Database:**
- In your Firebase project, click "Realtime Database"
- Click "Create database"
- Choose "Start in test mode" for Realtime Database
- Select a location close to you
- Click "Done"

### 3. **Get Firebase Config:**
- In your Firebase project, click the gear icon (⚙️)
- Click "Project settings"
- Scroll down to "Your apps"
- Click the web icon (</>)
- Give your app a nickname (e.g., "journal-web")
- Click "Register app"
- Copy the config object

### 4. **Set Environment Variables:**
1. **Copy `.env.example` to `.env.local`**
2. **Replace the values** with your actual Firebase config

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
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Test the App

1. **Create your first entry**
2. **Test voice recording**
3. **Verify it saves to Firebase Realtime Database**

## Troubleshooting

### Common Issues:

1. **"Firebase connection failed"**
   - Check your `.env.local` file exists
   - Verify your Firebase project is active
   - Ensure all environment variables are set

2. **"Method not allowed" errors**
   - Make sure you're using the latest version
   - Check that all API routes are working

3. **Database connection issues**
   - Verify Realtime Database is created
   - Check that Realtime Database is in test mode
   - Ensure your Firebase config is correct

### Environment Variables Checklist:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Costs

- **Firebase**: Free tier (1GB database, 10GB bandwidth)
- **Vercel**: Free tier (100GB bandwidth)
- **Whisper API**: Pay per use (very cheap)

## Security

- **Local Encryption**: All data encrypted locally
- **Secure Database**: Firebase provides enterprise-grade security
- **HTTPS Only**: All connections use HTTPS 