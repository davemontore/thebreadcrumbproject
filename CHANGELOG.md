# Changelog

All notable changes to The Breadcrumb Project will be documented in this file.

## [1.3.0] - 2025-08-10

### Changed
- Renamed "Basket" page text to "Entries" (browser tab title and on‑screen heading) without altering routes.

### Performance
- Optimized edit save on Entries page (mobile): after a successful update, the UI now updates the edited entry locally instead of reloading all entries. This removes perceived hangs on iPhone while preserving behavior and design.

### Improved
- Typed-entry tagging now uses the same AI analysis as audio entries (with safe fallback). Sentiment-only words are filtered and tags remain capped at four.

### Notes
- AI-based tagging may add ~1–3 seconds on save depending on network and model latency. See future optimization options in PR discussion.

## [1.2.0] - 2024-12-19

### Fixed
- **Search Functionality**
  - Fixed broken search that returned no results
  - Implemented local search with instant results
  - Added "One sec while we get things ready..." loading message
  - Search now works through titles, text, tags, sentiment, and emotions
  - Removed server-side authentication complexity

- **Edit Mode Styling**
  - Fixed blue border issue on edit title and body text boxes
  - Implemented consistent bold cream border styling
  - Added smooth transitions for focus states
  - Matches search bar styling for visual consistency

### Technical Improvements
- **Search Architecture**
  - Switched from server-side API search to client-side local search
  - Eliminated authentication context issues in API routes
  - Improved performance with instant search results
  - Maintained user data isolation and security

- **Code Quality**
  - Fixed TypeScript build errors in search API
  - Improved error handling and debugging logs
  - Better separation of concerns between frontend and backend

## [1.1.0] - 2024-12-19

### Added
- **Hybrid AssemblyAI + OpenAI GPT-4 Workflow**
  - AssemblyAI for accurate audio transcription (supports longer recordings)
  - OpenAI GPT-4 for intelligent analysis and contextual tagging
  - Intelligent topic-based tags instead of basic sentiment analysis
  - Robust fallback system (AssemblyAI data if GPT-4 fails)
  - Enhanced sentiment analysis with nuanced emotions
  - Key highlights extraction from journal entries

- **Advanced Search Functionality**
  - Full-text search across journal entries
  - Search by tags, sentiment, emotions, and highlights
  - Debounced search with real-time results
  - Search results pagination and "Load More" functionality
  - Search bar with cream-colored focus styling

- **Enhanced Entry Management**
  - Edit functionality for existing journal entries
  - Automatic tag regeneration when entries are edited
  - Improved entry display with sentiment and emotion indicators
  - Better mobile-responsive entry layout

## [1.0.0] - 2024-12-19

### Added
- **Multi-User Authentication System**
  - Firebase Authentication with email/password login
  - Invitation code system for controlled user registration
  - User-specific data isolation in Firebase Realtime Database
  - Automatic session management and authentication state handling

- **Voice Recording & Transcription**
  - AI-powered voice recording using OpenAI Whisper API
  - Cross-browser audio recording compatibility (desktop and mobile)
  - RecordRTC integration for improved mobile browser support
  - Proper FormData parsing with formidable to prevent "Invalid audio format" errors

- **Enhanced User Interface**
  - Beautiful cream color palette design
  - Mobile-optimized responsive layout
  - Touch-friendly interface for mobile devices
  - Smart text preview with CSS line clamping
  - Breadcrumb basket view for all entries

- **Security Features**
  - User data isolation in separate database paths (`users/{uid}/journal_entries`)
  - Firebase database rules enforcing user-specific access
  - Invitation code validation preventing unauthorized signups
  - HTTPS-only connections with SSL certificates

- **Real-time Synchronization**
  - Instant cross-device sync using Firebase Realtime Database
  - Real-time updates across all connected devices
  - Offline support with automatic sync when connection is restored

### Changed
- **Database Structure Migration**
  - Migrated from shared `journal_entries` path to user-specific paths
  - Implemented migration tools for existing data
  - Updated Firebase database rules to enforce user isolation
  - Blocked access to old shared path for security

- **Authentication System**
  - Replaced local storage-based SimpleAuth with Firebase Authentication
  - Added invitation code requirement for new user registration
  - Implemented proper error handling for authentication failures
  - Added automatic authentication state initialization

- **Audio Recording System**
  - Switched to RecordRTC for better cross-browser compatibility
  - Fixed mobile browser audio recording issues
  - Improved audio format handling and validation
  - Enhanced error handling for transcription failures

- **Mobile Experience**
  - Optimized interface for mobile devices
  - Improved touch interactions and button sizes
  - Enhanced text preview system with proper line clamping
  - Better responsive design for all screen sizes

### Fixed
- **Mobile Audio Recording**
  - Fixed "Invalid audio format" errors from Whisper API
  - Resolved mobile browser compatibility issues
  - Improved FormData parsing in transcription API
  - Enhanced audio format detection and processing

- **Authentication Issues**
  - Fixed navigation loops caused by mixed authentication checks
  - Resolved authentication state initialization timing issues
  - Fixed user data path resolution after authentication
  - Corrected invitation code validation

- **Data Migration**
  - Fixed entries appearing under wrong user accounts
  - Resolved data path issues during authentication state changes
  - Corrected migration function to use proper user-specific paths
  - Fixed authentication state waiting in Firebase service

- **UI/UX Issues**
  - Fixed mobile preview text display with proper line clamping
  - Resolved text overflow issues on mobile devices
  - Improved button states and loading indicators
  - Enhanced error message display

### Technical Improvements
- **Code Architecture**
  - Separated authentication logic into dedicated Firebase Auth service
  - Improved Firebase service with user-specific data paths
  - Enhanced error handling and logging throughout the application
  - Better TypeScript type definitions and interfaces

- **Performance**
  - Optimized database queries for user-specific data
  - Improved authentication state management
  - Enhanced mobile performance with better audio handling
  - Reduced bundle size and improved loading times

- **Security**
  - Implemented proper user data isolation
  - Added invitation code system for access control
  - Enhanced Firebase database security rules
  - Improved environment variable management

### Documentation
- **Complete Documentation Overhaul**
  - Updated README.md with current features and setup instructions
  - Comprehensive SETUP.md with Firebase Authentication setup
  - Detailed DATABASE.md with multi-user structure and migration info
  - Enhanced DEPLOYMENT.md with custom domain and security setup
  - Updated environment variable examples and requirements

### Deployment
- **Vercel Integration**
  - Configured automatic deployments from GitHub
  - Set up environment variable management in Vercel
  - Implemented custom domain support with SSL certificates
  - Added proper Firebase authorized domains configuration

### Breaking Changes
- **Authentication System**
  - Removed SimpleAuth local storage system
  - Required Firebase Authentication for all users
  - Mandatory invitation codes for new user registration
  - User data now stored in separate database paths

- **Database Structure**
  - Changed from shared `journal_entries` to `users/{uid}/journal_entries`
  - Updated Firebase database rules to enforce user isolation
  - Blocked access to old shared data path

### Migration Notes
- **For Existing Users**
  - Data migration tools provided for moving from shared to user-specific paths
  - Manual cleanup may be required for mixed user data
  - Backup recommended before migration
  - New authentication required for all users

### Environment Variables
- **New Required Variables**
  - `OPENAI_API_KEY` for Whisper transcription
  - `NEXT_PUBLIC_INVITATION_CODES` for user registration control
  - All existing Firebase configuration variables remain required

### Dependencies
- **Added**
  - `recordrtc` for cross-browser audio recording
  - `formidable` for proper FormData parsing
  - `openai` for Whisper API integration

- **Updated**
  - Firebase SDK to latest version
  - Next.js to version 14
  - React to version 18
  - All other dependencies to latest stable versions

---

## [0.9.0] - 2024-12-18

### Added
- Initial journaling app with basic text entry functionality
- Firebase Realtime Database integration
- Basic voice recording capability
- Simple authentication system (SimpleAuth)

### Known Issues
- Mobile audio recording compatibility issues
- Shared data structure without user isolation
- Limited security features
- Basic UI without mobile optimization

---

For detailed information about each release, see the individual documentation files:
- [README.md](README.md) - Overview and features
- [SETUP.md](SETUP.md) - Installation and setup
- [DATABASE.md](DATABASE.md) - Database configuration and migration
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment and production setup 