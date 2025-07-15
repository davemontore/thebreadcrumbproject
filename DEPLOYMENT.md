# Deployment Guide

This guide will help you deploy your journal app to production so you can access it from any device.

## Prerequisites

- **GitHub account** - For code storage
- **Vercel account** - Free hosting at [vercel.com](https://vercel.com)
- **Firebase project** - Already set up from [SETUP.md](SETUP.md)

## Step 1: Prepare Your Code

1. **Ensure all changes are committed:**
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. **Verify your Firebase configuration** is working locally:
```bash
npm run dev
# Test that entries save to Firebase
```

## Step 2: Deploy to Vercel

### Option A: Deploy from GitHub (Recommended)

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import your repository:**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure environment variables:**
   - In the project settings, go to "Environment Variables"
   - Add each Firebase variable:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is now live!

### Option B: Deploy from CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts** to configure your project

## Step 3: Configure Custom Domain (Optional)

1. **In Vercel dashboard:**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain

2. **Configure DNS:**
   - Follow Vercel's DNS instructions
   - Wait for DNS propagation (up to 24 hours)

## Step 4: Test Your Deployment

1. **Test basic functionality:**
   - Create a journal entry
   - Verify it saves to Firebase
   - Check that it appears in your basket

2. **Test cross-device sync:**
   - Open the app on your phone
   - Create an entry
   - Check that it appears on your computer

3. **Test authentication:**
   - Log in from different devices
   - Verify your data is synced

## Production Features

1. **Database Syncing**: Uses Firebase database to sync data across multiple devices
2. **Real-time Updates**: Changes appear instantly across all devices
3. **Secure Storage**: All data encrypted and stored securely
4. **Mobile Optimized**: Works perfectly on phones and tablets
5. **Offline Support**: Works even without internet connection
6. **Automatic Updates**: Deployments happen automatically when you push to GitHub

## Environment Variables

Make sure these are set in your Vercel project:
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID

## Monitoring and Maintenance

### Vercel Analytics
- Monitor your app's performance
- Track user engagement
- Identify issues quickly

### Firebase Console
- Monitor database usage
- Check authentication logs
- Manage your data

### Automatic Deployments
- Every push to GitHub triggers a new deployment
- No manual intervention needed
- Rollback to previous versions if needed

## Cost Breakdown

- **Vercel**: Free tier (unlimited deployments, 100GB bandwidth)
- **Firebase**: Free tier (1GB database, 10GB bandwidth)
- **Total**: $0/month for personal use

## Troubleshooting

### Deployment Issues
1. **Build fails:**
   - Check that all dependencies are in `package.json`
   - Verify environment variables are set
   - Check build logs in Vercel dashboard

2. **App won't load:**
   - Verify Firebase configuration is correct
   - Check that Firestore database is created
   - Test locally first

3. **Database connection fails:**
   - Verify Firebase environment variables in Vercel
   - Check that your Firebase project is active
   - Ensure Firestore is in test mode

### Performance Issues
1. **Slow loading:**
   - Enable Vercel's edge caching
   - Optimize images and assets
   - Use Firebase's offline persistence

2. **High costs:**
   - Monitor Firebase usage in console
   - Set up billing alerts
   - Optimize database queries

## Security Best Practices

1. **Environment Variables**: Never commit secrets to GitHub
2. **Firebase Rules**: Set up proper security rules for production
3. **HTTPS**: Vercel provides automatic HTTPS
4. **Authentication**: Use Firebase Auth for user management
5. **Data Backup**: Firebase provides automatic backups

Your journal app is now deployed and ready for production use! 