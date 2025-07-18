# Support Guide

Welcome to The Breadcrumb Project support guide! This document provides help and troubleshooting information for users and contributors.

## Table of Contents

- [Getting Help](#getting-help)
- [Common Issues](#common-issues)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Contact Information](#contact-information)
- [Resources](#resources)

## Getting Help

### Before Asking for Help

1. **Check the Documentation**
   - Read the [README.md](README.md) for overview
   - Review [SETUP.md](SETUP.md) for installation issues
   - Check [DATABASE.md](DATABASE.md) for database problems
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues

2. **Search Existing Issues**
   - Check [GitHub Issues](https://github.com/your-repo/breadcrumb-project/issues)
   - Search for similar problems
   - Look at closed issues for solutions

3. **Check the Changelog**
   - Review [CHANGELOG.md](CHANGELOG.md) for recent changes
   - Check if your issue is a known bug
   - See if there's a fix in a newer version

### How to Ask for Help

When asking for help, please provide:

1. **Clear Description**: What you're trying to do and what's happening
2. **Environment Details**: OS, browser, device type
3. **Error Messages**: Copy and paste any error messages
4. **Steps to Reproduce**: Detailed steps to recreate the issue
5. **Expected vs Actual**: What you expected vs what happened

## Common Issues

### Authentication Issues

#### "Invalid invitation code"
- **Cause**: Invitation code validation failing
- **Solution**: 
  - Verify `NEXT_PUBLIC_INVITATION_CODES` is set correctly
  - Check that codes are comma-separated without spaces
  - Ensure the code matches exactly (case-sensitive)
  - Restart the development server after changing environment variables

#### "Authentication failed"
- **Cause**: Firebase Authentication issues
- **Solution**:
  - Verify Firebase Authentication is enabled
  - Check that Email/Password provider is enabled
  - Ensure authorized domains are configured
  - Check browser console for specific error messages

#### "No entries visible"
- **Cause**: User not authenticated or wrong data path
- **Solution**:
  - Check that user is logged in
  - Verify Firebase Auth is working
  - Check browser console for authentication status
  - Ensure database rules allow user access

### Voice Recording Issues

#### "Voice recording not working"
- **Cause**: Audio recording configuration problems
- **Solution**:
  - Check that `OPENAI_API_KEY` is set
  - Verify API key has sufficient credits
  - Check microphone permissions in browser
  - Test API key separately

#### "Invalid audio format" Whisper error
- **Cause**: Audio format detection issues
- **Solution**:
  - Uses RecordRTC with proper FormData parsing
  - Ensures correct filename extension matches actual audio format
  - Mobile browsers require proper FormData parsing

#### "Microphone permission denied"
- **Cause**: Browser blocking microphone access
- **Solution**:
  - Allow microphone permissions in browser settings
  - Check if microphone is being used by another application
  - Try refreshing the page and granting permissions again

### Database Issues

#### "Firebase connection failed"
- **Cause**: Firebase configuration problems
- **Solution**:
  - Check that Firebase environment variables are set
  - Verify your Firebase project is active
  - Ensure Realtime Database is created
  - Check that database rules allow access

#### "Permission denied"
- **Cause**: Database rules too restrictive
- **Solution**:
  - Set rules to allow read/write in test mode
  - Ensure user is authenticated for production rules
  - Check that user has access to their data path

### Mobile Issues

#### "App doesn't work on mobile"
- **Cause**: Mobile-specific compatibility issues
- **Solution**:
  - Check mobile browser compatibility
  - Ensure responsive design is working
  - Test touch interactions
  - Verify audio recording works on mobile

#### "Text preview not working on mobile"
- **Cause**: CSS line clamping issues
- **Solution**:
  - Uses custom `.line-clamp-3` class
  - Improved logic to detect when text is longer than three lines
  - Check that Tailwind CSS is properly configured

## Troubleshooting

### Development Environment

#### "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "Build fails"
```bash
# Check TypeScript compilation
npm run build

# Check for linting errors
npm run lint

# Verify environment variables
echo $NEXT_PUBLIC_FIREBASE_API_KEY
```

#### "App won't start"
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000
kill -9 <PID>

# Start development server
npm run dev
```

### Production Deployment

#### "Vercel deployment fails"
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure all dependencies are in package.json
- Check TypeScript compilation

#### "Custom domain not working"
- Verify DNS records are configured correctly
- Wait for DNS propagation (up to 48 hours)
- Check that domain is added to Firebase authorized domains
- Ensure SSL certificate is issued

#### "Environment variables missing"
- Verify all variables are set in Vercel
- Check variable names match exactly
- Ensure no extra spaces or quotes
- Restart deployment after adding variables

### Firebase Console

#### "Database not showing data"
- Check that Realtime Database is created
- Verify database rules allow access
- Check that data is being written to correct path
- Look for any error messages in console

#### "Authentication not working"
- Verify Firebase Authentication is enabled
- Check that Email/Password provider is enabled
- Ensure authorized domains are configured
- Test user registration and login

## FAQ

### General Questions

**Q: What is The Breadcrumb Project?**
A: A secure, multi-user journaling app that helps you leave a trail of wisdom for your kids to follow after you're gone. It features Firebase Authentication, AI-powered voice transcription, and real-time synchronization.

**Q: Is it free to use?**
A: The app itself is free and open source. You'll need to set up your own Firebase project and OpenAI API key, which have their own costs (Firebase has a generous free tier, OpenAI charges per use).

**Q: Can I use it without an invitation code?**
A: No, invitation codes are required for new user registration to control access to the app.

**Q: Is my data secure?**
A: Yes, your data is stored securely in Firebase Realtime Database with user isolation. Each user's data is completely separate and protected by Firebase Authentication.

### Technical Questions

**Q: What browsers are supported?**
A: The app works on all modern browsers including Chrome, Firefox, Safari, and Edge. Mobile browsers are also supported.

**Q: Does voice recording work on mobile?**
A: Yes, voice recording works on mobile browsers using RecordRTC for cross-browser compatibility.

**Q: Can I use my own domain?**
A: Yes, you can deploy the app to your own domain using Vercel's custom domain feature.

**Q: How do I migrate existing data?**
A: The app includes migration tools to move data from the old shared structure to user-specific paths. See DATABASE.md for details.

### Feature Questions

**Q: Can multiple users access the same account?**
A: No, each user has their own account and data. The app is designed for individual use with secure user isolation.

**Q: Can I export my data?**
A: You can export data from Firebase Console, or we can add an export feature if needed.

**Q: Is there a mobile app?**
A: Currently it's a web app that works on mobile browsers. A native mobile app could be developed in the future.

**Q: Can I customize the invitation codes?**
A: Yes, you can set your own invitation codes in the environment variables.

## Contact Information

### For General Support
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/breadcrumb-project/issues)
- **Email**: [Support Email] (replace with actual email)
- **Response Time**: Within 48 hours

### For Security Issues
- **Email**: [Security Email] (replace with actual email)
- **Response Time**: Within 24 hours
- **Do not** create public issues for security problems

### For Contributors
- **GitHub Discussions**: [Start a discussion](https://github.com/your-repo/breadcrumb-project/discussions)
- **Pull Requests**: [Submit a PR](https://github.com/your-repo/breadcrumb-project/pulls)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Resources

### Documentation
- [README.md](README.md) - Project overview and features
- [SETUP.md](SETUP.md) - Installation and setup guide
- [DATABASE.md](DATABASE.md) - Database configuration and migration
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment and production setup
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute to the project

### External Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI Whisper API](https://openai.com/api/)
- [Vercel Documentation](https://vercel.com/docs)

### Community
- [GitHub Repository](https://github.com/your-repo/breadcrumb-project)
- [Issues](https://github.com/your-repo/breadcrumb-project/issues)
- [Discussions](https://github.com/your-repo/breadcrumb-project/discussions)
- [Releases](https://github.com/your-repo/breadcrumb-project/releases)

### Tools
- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [OpenAI Platform](https://platform.openai.com/)

---

Thank you for using The Breadcrumb Project! If you need help that isn't covered here, please don't hesitate to reach out. 🍞 