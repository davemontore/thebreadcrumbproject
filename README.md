# HFL - Secure Journal App

> **⚠️ IMPORTANT: This app uses Firebase Realtime Database, NOT Firestore. See [DATABASE.md](DATABASE.md) for details.**

A beautiful, secure journaling app that syncs across all your devices using Firebase Realtime Database.

## Features

- ✍️ **Text Journaling**: Write your thoughts and memories
- 🎤 **Voice Recording**: Speak your entries with AI transcription
- 📱 **Cross-Device Sync**: Access from phone, tablet, computer
- 🔒 **Secure Storage**: All data encrypted and secure
- 🏷️ **Smart Tagging**: AI-powered tags for easy organization
- 🎨 **Beautiful Design**: Clean, distraction-free interface

## Quick Start

1. **Set up Firebase Realtime Database** (see [SETUP.md](SETUP.md))
2. **Review database configuration** (see [DATABASE.md](DATABASE.md))
3. **Install dependencies**: `npm install`
4. **Run locally**: `npm run dev`
5. **Open**: [http://localhost:3000](http://localhost:3000)

## Requirements

- **Node.js** - JavaScript runtime
- **Firebase account** - Free cloud database
- **Whisper API key** - For voice transcription

## How It Works

1. **Cloud Database**: All entries stored securely in Firebase Realtime Database
2. **Real-time Sync**: Changes appear instantly across all devices
3. **Voice AI**: Whisper API transcribes your voice to text
4. **Smart Tags**: AI generates relevant tags for organization
5. **Local Storage**: Sensitive data encrypted locally

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Voice AI**: OpenAI Whisper API
- **Deployment**: Vercel

## Security

- **Encrypted Data**: All data encrypted in transit and at rest
- **Secure Database**: Firebase provides enterprise-grade security
- **User Isolation**: Each user's data is completely separate
- **No Data Mining**: Your data belongs to you

## Troubleshooting

### Common Issues:

1. **"Firebase connection failed"**
   - Check that Firebase environment variables are set
   - Verify your Firebase project is active
   - Ensure Realtime Database is created

2. **"Index not defined" Firebase error**
   - Go to Firebase Console → Realtime Database → Rules
   - Replace all rules with this exact format:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - **Important**: Copy the ENTIRE block including outer braces
   - Delete any existing rules before pasting
   - Click "Publish"

3. **"Voice recording not working"**
   - Check that Whisper API key is set
   - Verify microphone permissions
   - Check browser console for errors
   - **Mobile Audio Recording Fix**: If audio recording fails on mobile browsers, ensure the API properly parses FormData using formidable. The transcription API must correctly handle multipart form data to avoid "Invalid audio format" errors from Whisper.

4. **"Invalid audio format" Whisper error**
   - **CRITICAL FIX**: Use formidable to parse FormData in the transcription API
   - Ensure correct filename extension matches actual audio format (WebM files should have .webm extension)
   - Mobile browsers require proper FormData parsing to avoid format detection issues
   - This was the key fix that resolved mobile audio recording issues

5. **"App won't load"**
   - Verify your Firebase credentials are correct
   - Check that all dependencies are installed
   - Clear browser cache and try again

## Costs

- **Firebase**: Free tier (1GB database, 10GB bandwidth)
- **Vercel**: Free tier (100GB bandwidth)
- **Whisper API**: Pay per use (very cheap)
- **Total**: ~$0-5/month for personal use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. 