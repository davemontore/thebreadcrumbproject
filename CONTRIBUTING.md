# Contributing to The Breadcrumb Project

Thank you for your interest in contributing to The Breadcrumb Project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Security](#security)

## Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment for our community include:

- Using welcoming and inclusive language
- Being respectful of differing opinions, viewpoints, and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or advances
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Git
- Firebase account
- OpenAI API key

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/breadcrumb-project.git
   cd breadcrumb-project
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/original-owner/breadcrumb-project.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.example .env.local
   ```

2. Configure your environment variables:
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
   NEXT_PUBLIC_INVITATION_CODES=dev2024,test2024
   ```

### 3. Firebase Setup

1. Create a Firebase project for development
2. Enable Realtime Database
3. Enable Firebase Authentication with Email/Password
4. Set up database rules for development:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Contributing Guidelines

### Before You Start

1. **Check existing issues**: Look for existing issues or discussions related to your contribution
2. **Create an issue**: If you're planning a significant change, create an issue first to discuss it
3. **Choose the right branch**: Create a feature branch from `main`

### Types of Contributions

We welcome contributions in the following areas:

#### 🐛 Bug Fixes
- Fix bugs and issues
- Improve error handling
- Add better error messages

#### ✨ New Features
- Add new functionality
- Enhance existing features
- Improve user experience

#### 📚 Documentation
- Update README files
- Add code comments
- Improve setup instructions
- Create tutorials or guides

#### 🎨 UI/UX Improvements
- Enhance the user interface
- Improve mobile responsiveness
- Add accessibility features
- Optimize performance

#### 🔧 Technical Improvements
- Refactor code
- Improve performance
- Add tests
- Update dependencies

### Creating a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### Making Changes

1. **Follow the code style** (see [Code Style](#code-style) section)
2. **Write meaningful commit messages**
3. **Test your changes thoroughly**
4. **Update documentation if needed**

### Commit Message Guidelines

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(auth): add password reset functionality`
- `fix(mobile): resolve audio recording issues on iOS`
- `docs(setup): update Firebase configuration instructions`
- `refactor(api): improve error handling in transcription endpoint`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

### Before Submitting

1. **Test thoroughly**:
   - Test on different browsers
   - Test on mobile devices
   - Test all related functionality
   - Ensure no breaking changes

2. **Update documentation**:
   - Update README if needed
   - Add code comments for complex logic
   - Update any relevant documentation files

3. **Check code quality**:
   - Run linting: `npm run lint`
   - Ensure TypeScript compilation passes
   - Check for any console errors

### Submitting a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots or videos for UI changes
   - Link to related issues

3. **Fill out the PR template** (if available)

### PR Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** by maintainers
4. **Approval** from at least one maintainer

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow strict TypeScript configuration
- Use meaningful variable and function names
- Add proper type annotations
- Use interfaces for object shapes

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Implement proper error boundaries
- Use Next.js conventions

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use the cream color palette
- Ensure mobile responsiveness
- Maintain accessibility standards

### File Organization

```
lib/           # Utility functions and services
pages/         # Next.js pages and API routes
styles/        # Global styles and CSS
components/    # Reusable React components (if added)
```

## Testing

### Manual Testing

Before submitting a PR, test:

1. **Authentication**:
   - User registration with invitation codes
   - Login and logout
   - Session persistence

2. **Core Features**:
   - Text entry creation and editing
   - Voice recording and transcription
   - Entry viewing and management

3. **Cross-Device**:
   - Real-time synchronization
   - Data persistence
   - User isolation

4. **Mobile Experience**:
   - Touch interactions
   - Audio recording
   - Responsive design

### Automated Testing

We encourage adding tests for:
- API endpoints
- Utility functions
- Component behavior
- Authentication flows

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Explain business rules
- Add inline comments for non-obvious code

### User Documentation

- Update README for new features
- Add setup instructions for new dependencies
- Document configuration options
- Provide troubleshooting guides

## Security

### Security Guidelines

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate user input
- Follow security best practices
- Report security issues privately

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public issue
2. **Email** the maintainers privately
3. **Provide** detailed information about the vulnerability
4. **Wait** for a response before disclosing publicly

## Getting Help

### Questions and Support

- Create an issue for questions
- Use GitHub Discussions if available
- Check existing documentation
- Review existing issues and PRs

### Community Guidelines

- Be respectful and inclusive
- Help other contributors
- Share knowledge and experience
- Follow the code of conduct

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors list
- Project documentation

Thank you for contributing to The Breadcrumb Project! 🍞 