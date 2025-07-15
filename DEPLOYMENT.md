# Deployment Guide

This guide will help you deploy your HFL journal app to Vercel with Firebase Realtime Database.

## Prerequisites

- Firebase project with Realtime Database set up
- GitHub repository with your code
- Vercel account (free at [vercel.com](https://vercel.com))

## Step 1: Prepare Your Code

### 1. **Ensure Environment Variables are Set**
Make sure your `.env.local` file has all required variables:

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

# Whisper API (for voice transcription)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. **Test Locally**
```bash
npm run dev
```
Make sure everything works on localhost:3000

### 3. **Commit and Push**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### 1. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Click "New Project"
- Import your GitHub repository

### 2. **Configure Project**
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 3. **Add Environment Variables**
In the Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. **Deploy**
Click "Deploy" and wait for the build to complete.

## Step 3: Configure Firebase

### 1. **Update Firebase Rules**
In your Firebase Console, go to Realtime Database → Rules and set:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Note**: This allows public read/write access. For production, implement proper authentication.

### 2. **Add Domain to Firebase**
- Go to Firebase Console → Authentication → Settings
- Add your Vercel domain to "Authorized domains"
- Format: `your-app.vercel.app`

## Step 4: Test Your Deployment

### 1. **Check Basic Functionality**
- Visit your Vercel URL
- Create a test journal entry
- Verify it saves to Firebase Realtime Database

### 2. **Test Voice Recording**
- Try the voice recording feature
- Verify transcription works
- Check that entries are saved

### 3. **Test Cross-Device Sync**
- Open the app on another device
- Verify entries appear
- Test real-time updates

## Step 5: Custom Domain (Optional)

### 1. **Add Custom Domain**
- In Vercel, go to Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

### 2. **Update Firebase**
- Add your custom domain to Firebase authorized domains
- Update any hardcoded URLs in your code

## Troubleshooting

### Common Deployment Issues:

1. **"Build failed"**
   - Check that all dependencies are in package.json
   - Verify TypeScript compilation
   - Check build logs for specific errors

2. **"Environment variables missing"**
   - Verify all variables are set in Vercel
   - Check variable names match exactly
   - Ensure no extra spaces or quotes

3. **"Firebase connection failed"**
   - Verify Firebase project is active
   - Check that Realtime Database is created
   - Ensure Realtime Database is in test mode
   - Verify environment variables are correct

4. **"Voice recording not working"**
   - Check OPENAI_API_KEY is set
   - Verify API key has sufficient credits
   - Test API key separately

### Environment Variables Checklist:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `OPENAI_API_KEY`

## Security Considerations

### For Production:

1. **Implement Authentication**
   - Add Firebase Auth
   - Restrict database access to authenticated users
   - Update Firebase rules accordingly

2. **Secure Database Rules**
   ```json
   {
     "rules": {
       "journal_entries": {
         "$uid": {
           ".read": "auth != null && auth.uid == $uid",
           ".write": "auth != null && auth.uid == $uid"
         }
       }
     }
   }
   ```

3. **HTTPS Only**
   - Vercel provides HTTPS by default
   - Ensure all API calls use HTTPS

4. **Rate Limiting**
   - Consider adding rate limiting for API endpoints
   - Monitor usage to prevent abuse

## Monitoring

### 1. **Vercel Analytics**
- Enable Vercel Analytics for performance monitoring
- Track page views and user behavior

### 2. **Firebase Console**
- Monitor Realtime Database usage
- Check for errors in Firebase logs
- Track API usage and costs

### 3. **Error Tracking**
- Consider adding error tracking (Sentry, LogRocket)
- Monitor for JavaScript errors in production

## Cost Optimization

### 1. **Firebase Usage**
- Monitor Realtime Database reads/writes
- Stay within free tier limits
- Optimize queries to reduce usage

### 2. **Whisper API**
- Monitor API usage
- Consider caching transcriptions
- Set up usage alerts

### 3. **Vercel**
- Free tier includes 100GB bandwidth
- Monitor usage in Vercel dashboard

## Updates and Maintenance

### 1. **Automatic Deployments**
- Vercel automatically deploys on git push
- Test changes locally before pushing

### 2. **Database Backups**
- Firebase Realtime Database has built-in backup
- Consider exporting data periodically

### 3. **Security Updates**
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update Firebase rules as needed

Your journal app is now deployed and ready to use! 🎉 