# Deployment Guide

This guide will help you deploy The Breadcrumb Project to Vercel with Firebase Realtime Database, Firebase Authentication, and custom domain support.

## Prerequisites

- Firebase project with Realtime Database and Authentication set up
- GitHub repository with your code
- Vercel account (free at [vercel.com](https://vercel.com))
- OpenAI API key for Whisper transcription
- Custom domain (optional)

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

# OpenAI Whisper API
OPENAI_API_KEY=your_openai_api_key_here

# Invitation Codes (comma-separated, no spaces)
NEXT_PUBLIC_INVITATION_CODES=breadcrumb17
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
NEXT_PUBLIC_INVITATION_CODES=family2024,friends2024,trusted2024
```

### 4. **Deploy**
Click "Deploy" and wait for the build to complete.

## Step 3: Configure Firebase

### 1. **Update Firebase Rules**
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

### 2. **Add Domain to Firebase Auth**
- Go to Firebase Console → Authentication → Settings
- Add your Vercel domain to "Authorized domains"
- Format: `your-app.vercel.app`
- If using custom domain, add that too

### 3. **Verify Firebase Authentication**
- Ensure Email/Password provider is enabled
- Test user registration and login
- Verify invitation code validation works

## Step 4: Test Your Deployment

### 1. **Check Basic Functionality**
- Visit your Vercel URL
- Test user registration with invitation code
- Test login and logout
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

### 4. **Test User Isolation**
- Create multiple user accounts
- Verify each user only sees their own entries
- Test that users cannot access each other's data

## Step 5: Custom Domain Setup

### 1. **Add Custom Domain in Vercel**
- In Vercel, go to Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

### 2. **Configure DNS Records**
If using NameCheap or similar:
- Add CNAME record: `@` → `cname.vercel-dns.com`
- Add CNAME record: `www` → `cname.vercel-dns.com`
- Wait for DNS propagation (can take up to 48 hours)

### 3. **Update Firebase Authorized Domains**
- Go to Firebase Console → Authentication → Settings
- Add your custom domain to "Authorized domains"
- Remove any test domains if needed

### 4. **Verify SSL Certificate**
- Vercel automatically provides SSL certificates
- Wait for certificate to be issued (usually 24-48 hours)
- Test HTTPS access

## Step 6: Security Configuration

### 1. **Production Database Rules**
Ensure your Firebase Realtime Database rules enforce user isolation:

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

### 2. **Environment Variable Security**
- Never commit `.env.local` to version control
- Use Vercel's environment variable interface
- Rotate API keys regularly
- Use different invitation codes for different environments

### 3. **HTTPS Enforcement**
- Vercel provides HTTPS by default
- Ensure all API calls use HTTPS
- Test that HTTP redirects to HTTPS

## Troubleshooting

### Common Deployment Issues:

1. **"Build failed"**
   - Check that all dependencies are in package.json
   - Verify TypeScript compilation
   - Check build logs for specific errors
   - Ensure all environment variables are set

2. **"Environment variables missing"**
   - Verify all variables are set in Vercel
   - Check variable names match exactly
   - Ensure no extra spaces or quotes
   - Restart deployment after adding variables

3. **"Firebase connection failed"**
   - Verify Firebase project is active
   - Check that Realtime Database is created
   - Ensure Firebase Authentication is enabled
   - Verify environment variables are correct

4. **"Invalid invitation code"**
   - Check `NEXT_PUBLIC_INVITATION_CODES` is set in Vercel
   - Verify codes are comma-separated without spaces
   - Ensure the code matches exactly (case-sensitive)
   - Redeploy after changing environment variables

5. **"Voice recording not working"**
   - Check `OPENAI_API_KEY` is set in Vercel
   - Verify API key has sufficient credits
   - Test API key separately
   - Check browser console for errors

6. **"Custom domain not working"**
   - Verify DNS records are configured correctly
   - Wait for DNS propagation (up to 48 hours)
   - Check that domain is added to Firebase authorized domains
   - Ensure SSL certificate is issued

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

## Security Considerations

### For Production:

1. **User Authentication**
   - Firebase Auth provides industry-standard security
   - Invitation codes prevent unauthorized signups
   - Session management is handled automatically

2. **Database Security**
   - User data is isolated by Firebase Auth UID
   - Database rules enforce user-specific access
   - Old shared paths are blocked

3. **API Security**
   - OpenAI API key is server-side only
   - All API calls use HTTPS
   - Rate limiting is handled by Vercel

4. **Domain Security**
   - Custom domains use SSL certificates
   - Firebase authorized domains prevent unauthorized access
   - DNS records are properly configured

## Monitoring and Maintenance

### 1. **Vercel Analytics**
- Enable Vercel Analytics for performance monitoring
- Track page views and user behavior
- Monitor build performance

### 2. **Firebase Console**
- Monitor Realtime Database usage
- Check for errors in Firebase logs
- Track API usage and costs
- Monitor Authentication usage

### 3. **Error Tracking**
- Consider adding error tracking (Sentry, LogRocket)
- Monitor for JavaScript errors in production
- Set up alerts for critical failures

### 4. **Performance Monitoring**
- Monitor app load times
- Track API response times
- Monitor database read/write operations

## Cost Optimization

### 1. **Firebase Usage**
- Monitor Realtime Database reads/writes
- Stay within free tier limits (1GB database, 10GB bandwidth)
- Optimize queries to reduce usage
- Monitor Authentication usage (10K/month free)

### 2. **Whisper API**
- Monitor API usage and costs
- Consider caching transcriptions
- Set up usage alerts
- Optimize audio quality for cost efficiency

### 3. **Vercel**
- Free tier includes 100GB bandwidth
- Monitor usage in Vercel dashboard
- Optimize bundle size for faster loading

## Updates and Maintenance

### 1. **Automatic Deployments**
- Vercel automatically deploys on git push
- Test changes locally before pushing
- Use feature branches for major changes

### 2. **Database Backups**
- Firebase Realtime Database has built-in backup
- Consider exporting data periodically
- Test restore procedures

### 3. **Security Updates**
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update Firebase rules as needed
- Rotate API keys regularly

### 4. **Feature Updates**
- Test new features thoroughly
- Monitor user feedback
- Plan for backward compatibility
- Document changes

## Migration from Development

### 1. **Data Migration**
- If migrating from development, use the migration tools
- Backup existing data before migration
- Test migration on staging environment
- Update database rules after migration

### 2. **Environment Variables**
- Ensure all production environment variables are set
- Use different invitation codes for production
- Verify API keys have sufficient credits
- Test all features in production environment

### 3. **Domain Configuration**
- Set up custom domain if desired
- Configure DNS records properly
- Add domain to Firebase authorized domains
- Wait for SSL certificate issuance

Your journal app is now deployed and ready for production use! 🎉

## Support

For additional support:
- Check the troubleshooting section above
- Review Firebase Console logs
- Monitor Vercel deployment logs
- Test all features thoroughly before going live 