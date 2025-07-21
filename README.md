# Write Here. Right Now.

> **⚠️ IMPORTANT: This app uses Firebase Realtime Database, NOT Firestore. See [DATABASE.md](DATABASE.md) for details.**

A secure, multi-user journaling app that helps you capture meaningful moments in your life. Built with Firebase Authentication, AI-powered voice transcription, and real-time sync.

## ✨ Features

- 🎤 **Voice Recording**: Record your thoughts with AI-powered transcription
- ✍️ **Text Entry**: Write your thoughts directly with rich text support
- 🔐 **Secure Authentication**: Firebase Auth with invitation code system
- 📱 **Real-time Sync**: Your entries sync across all devices instantly
- 🏷️ **Smart Tagging**: AI-generated tags help organize your thoughts
- 📖 **Entries View**: View all your entries in a beautiful interface
- 📱 **Mobile Responsive**: Works perfectly on desktop and mobile

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/davemontore/write-here-right-now.git
   cd write-here-right-now
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your Firebase and OpenAI credentials.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Setup Guide](SETUP.md) - Complete setup instructions
- [Database Configuration](DATABASE.md) - Firebase Realtime Database setup
- [Deployment Guide](DEPLOYMENT.md) - Deploy to Vercel
- [Security Guide](SECURITY.md) - Security best practices
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Support Guide](SUPPORT.md) - Troubleshooting and help

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **AI Transcription**: OpenAI Whisper API
- **Deployment**: Vercel
- **Icons**: Heroicons, Lucide React

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 🆘 Support

Need help? Check our [Support Guide](SUPPORT.md) or create an issue on GitHub. 