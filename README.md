# The Breadcrumb Project

> **⚠️ IMPORTANT: This app uses Firebase Realtime Database, NOT Firestore. See [DATABASE.md](DATABASE.md) for details.**

A beautiful, secure journaling app that helps you leave a trail of wisdom for your kids to follow after you're gone. Built with Firebase Authentication, multi-user support, and AI-powered voice transcription.

## Features

- ✍️ **Text Journaling**: Write your thoughts and memories
- 🎤 **Voice Recording**: Speak your entries with AI transcription using OpenAI Whisper
- 📱 **Cross-Device Sync**: Access from phone, tablet, computer with real-time updates
- 🔒 **Secure Multi-User**: Firebase Authentication with invitation code system
- 🏷️ **Smart Tagging**: AI-powered tags for easy organization
- 🎨 **Beautiful Design**: Clean, distraction-free interface optimized for mobile
- 🍞 **Breadcrumb Trail**: View all your entries in a beautiful basket interface

## Quick Start

1. **Set up Firebase Realtime Database** (see [SETUP.md](SETUP.md))
2. **Configure Firebase Authentication** (see [SETUP.md](SETUP.md))
3. **Set up invitation codes** (see [SETUP.md](SETUP.md))
4. **Install dependencies**: `npm install`
5. **Run locally**: `npm run dev`
6. **Open**: [http://localhost:3000](http://localhost:3000)

## Requirements

- **Node.js** - JavaScript runtime
- **Firebase account** - Free cloud database and authentication
- **OpenAI API key** - For voice transcription (Whisper API)
- **Invitation codes** - For controlled user access

## How It Works

1. **Multi-User Authentication**: Firebase Auth with email/password and invitation code validation
2. **Cloud Database**: All entries stored securely in Firebase Realtime Database with user isolation
3. **Real-time Sync**: Changes appear instantly across all devices
4. **Voice AI**: OpenAI Whisper API transcribes your voice to text
5. **Smart Tags**: AI generates relevant tags for organization
6. **Mobile Optimized**: Responsive design with touch-friendly interface

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom cream color palette
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth with invitation code system
- **Voice AI**: OpenAI Whisper API
- **Audio Recording**: RecordRTC for cross-browser compatibility
- **Deployment**: Vercel with custom domain support

## Security

- **User Isolation**: Each user's data is completely separate in `users/{uid}/journal_entries`
- **Firebase Auth**: Industry-standard authentication with email/password
- **Invitation Codes**: Controlled access to prevent unauthorized signups
- **Secure Database**: Firebase provides enterprise-grade security
- **HTTPS Only**: All connections use HTTPS

## Multi-User System

- **Firebase Authentication**: Secure email/password login
- **Invitation Codes**: Required for new account creation
- **User Data Isolation**: Each user's entries stored in separate database paths
- **Session Management**: Automatic authentication state handling

## Voice Recording Features

- **Cross-Browser Support**: Works on desktop and mobile browsers
- **AI Transcription**: OpenAI Whisper API for accurate speech-to-text
- **Mobile Optimized**: Touch-friendly recording interface
- **Format Handling**: Proper audio format detection and processing

## Mobile Experience

- **Responsive Design**: Optimized for all screen sizes
- **Touch Interface**: Large buttons and intuitive gestures
- **Audio Recording**: Full mobile browser compatibility
- **Preview System**: Smart text preview with line clamping

## Troubleshooting

### Common Issues:

1. **"Firebase connection failed"**
   - Check that Firebase environment variables are set
   - Verify your Firebase project is active
   - Ensure Realtime Database is created

2. **"Invalid invitation code"**
   - Verify invitation codes are set in environment variables
   - Check that codes are comma-separated without spaces
   - Ensure the code matches exactly (case-sensitive)

3. **"Voice recording not working"**
   - Check that OpenAI API key is set
   - Verify microphone permissions
   - Check browser console for errors
   - **Mobile Audio Recording Fix**: Uses RecordRTC with proper FormData parsing

4. **"Invalid audio format" Whisper error**
   - **CRITICAL FIX**: Uses formidable to parse FormData in the transcription API
   - Ensures correct filename extension matches actual audio format
   - Mobile browsers require proper FormData parsing

5. **"No entries visible"**
   - Check that user is authenticated
   - Verify Firebase database rules allow user access
   - Check browser console for authentication status

6. **"App won't load"**
   - Verify your Firebase credentials are correct
   - Check that all dependencies are installed
   - Clear browser cache and try again

## Environment Variables

### Required Variables:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI Whisper API
OPENAI_API_KEY=your_openai_api_key

# Invitation Codes (comma-separated)
NEXT_PUBLIC_INVITATION_CODES=code1,code2,code3
```

## Costs

- **Firebase**: Free tier (1GB database, 10GB bandwidth, 10K authentications/month)
- **Vercel**: Free tier (100GB bandwidth)
- **Whisper API**: Pay per use (~$0.006 per minute)
- **Total**: ~$0-10/month for personal use

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Vercel deployment setup
- Custom domain configuration
- Firebase security rules
- Environment variable configuration

## Database Structure

See [DATABASE.md](DATABASE.md) for detailed information about:
- Firebase Realtime Database setup
- User data isolation
- Security rules configuration
- Migration from shared to user-specific paths

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. 