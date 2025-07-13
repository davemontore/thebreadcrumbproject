# The Breadcrumb Project - Setup Guide

## How to Set Up Your Secure Journal

### 1. Set Your Login Credentials

Open `pages/login.tsx` and find these lines (around line 18-19):

```typescript
const correctUsername = 'your-username-here' // Change this to your desired username
const correctPassword = 'your-password-here' // Change this to your desired password
```

Replace `'your-username-here'` and `'your-password-here'` with your actual username and password.

**Example:**
```typescript
const correctUsername = 'dad' // Change this to your desired username
const correctPassword = 'my-secure-password-123' // Change this to your desired password
```

### 2. Set Your OpenAI API Key (One Time Setup)

After you log in for the first time, you need to set your OpenAI API key in your browser:

1. **Open your browser's Developer Tools:**
   - Chrome/Edge: Press `F12` or right-click → "Inspect"
   - Firefox: Press `F12` or right-click → "Inspect Element"
   - Safari: Enable Developer menu in Preferences → Advanced, then Develop → Show Web Inspector

2. **Go to the Console tab**

3. **Type this command (replace with your actual API key):**
   ```javascript
   localStorage.setItem('openaiApiKey', 'sk-your-actual-api-key-here')
   ```

4. **Press Enter**

Your API key is now stored securely in your browser and will be used for all transcriptions.

### 3. How Security Works

- **Login Protection**: Only someone with your username/password can access the app
- **API Key Security**: Your OpenAI API key stays in your browser's localStorage - it never gets stored in the code or sent to any server
- **Session Management**: You stay logged in for 24 hours, then need to log in again
- **Local Storage**: All your breadcrumbs are stored locally in your browser

### 4. Running the App

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open your browser to `http://localhost:3000`
4. You'll be redirected to the login page
5. Enter your username and password
6. Set up your API key (see step 2 above)
7. Start recording your thoughts!

### 5. Important Security Notes

- **Never commit your credentials to git** - the login page shows you exactly where to change them
- **Your API key is only stored in your browser** - it's not in the code or on any server
- **The app works entirely client-side** - no server stores your data
- **Change the default credentials** before deploying anywhere

### 6. Customization

You can customize:
- The app title and styling in the CSS
- The tag generation logic in `pages/index.tsx`
- The session timeout (currently 24 hours)
- The recording format and quality

Your journal is now secure and private! 🗝️ 