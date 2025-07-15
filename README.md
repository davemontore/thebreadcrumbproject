# The Breadcrumb Project

A beautiful, secure journaling app that syncs across all your devices using Firebase cloud database.

## Features

- ✍️ **Text Journaling** - Write your thoughts and memories
- 🎤 **Audio Recording** - Record voice messages (coming soon)
- 📱 **Cross-Device Sync** - Access your entries from any device
- 🔒 **Secure Storage** - All data encrypted and secure
- 🎨 **Beautiful UI** - Elegant, minimalist design

## Quick Start

1. **Set up Firebase database** (see [SETUP.md](SETUP.md))
2. **Install dependencies**: `npm install`
3. **Run the app**: `npm run dev`
4. **Open**: http://localhost:3000

## Requirements

- **Node.js** (v16 or higher)
- **Firebase account** - Free cloud database
- **Modern web browser**

## How It Works

1. **Cloud Database**: All entries stored securely in Firebase
2. **Real-time Sync**: Changes appear instantly across devices
3. **Offline Support**: Works even without internet connection
4. **Secure Authentication**: Simple, secure user management
5. **Beautiful Design**: Clean, elegant interface

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Vercel (recommended)

## Security Features

- **Encrypted Data**: All data encrypted in transit and at rest
- **Secure Database**: Firebase provides enterprise-grade security
- **User Isolation**: Each user's data is completely separate
- **No Data Mining**: Your data belongs to you

## Troubleshooting

### Common Issues

1. **"Database connection failed"**
   - Check that Firebase environment variables are set
   - Verify your Firebase project is active

2. **"Authentication failed"**
   - Clear browser cache and cookies
   - Verify your Firebase credentials are correct

3. **"App won't load"**
   - Check that all dependencies are installed
   - Verify Node.js version is 16 or higher

### Support

- **Documentation**: See [SETUP.md](SETUP.md) for detailed setup
- **Issues**: Create an issue on GitHub
- **Firebase**: Free tier (1GB database, 10GB bandwidth) 