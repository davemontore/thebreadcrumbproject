# Audio Recording Troubleshooting Guide

## Quick Diagnosis

If audio recording isn't working on your smartphone browser, follow these steps:

### 1. Test Browser Compatibility
Visit `/test-audio.html` in your browser to check if your browser supports audio recording.

### 2. Check Environment Variables
Make sure your `.env.local` file includes:
```env
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 3. Check Console for Errors
Open browser developer tools (F12) and look for error messages in the Console tab.

## Common Issues and Solutions

### Issue 1: "Audio recording is not supported in this browser"
**Cause**: Browser doesn't support MediaRecorder API
**Solution**: 
- Use Chrome, Firefox, Safari, or Edge
- Update your browser to the latest version
- Try a different browser

### Issue 2: "Microphone access denied"
**Cause**: Browser blocked microphone access
**Solution**:
- Click the microphone icon in the browser address bar
- Select "Allow" for microphone access
- Refresh the page and try again

### Issue 3: "No microphone found"
**Cause**: No microphone detected
**Solution**:
- Check if your device has a microphone
- Try using headphones with a microphone
- Check microphone permissions in device settings

### Issue 4: "OpenAI API key not configured"
**Cause**: Missing or invalid OpenAI API key
**Solution**:
- Get an API key from [OpenAI](https://platform.openai.com/api-keys)
- Add it to your `.env.local` file
- Restart the development server

### Issue 5: "Transcription failed"
**Cause**: OpenAI API issues
**Solution**:
- Check your OpenAI API key is valid
- Verify you have credits in your OpenAI account
- Check if the audio file is too large (>25MB)

### Issue 6: "Could not save entry to database"
**Cause**: Firebase connection issues
**Solution**:
- Check your Firebase configuration in `.env.local`
- Verify your Firebase project is active
- Check Firebase Realtime Database rules

## Mobile-Specific Issues

### Edge Browser on Mobile
- Edge on mobile may have limited MediaRecorder support
- Try using Chrome or Safari instead
- Check if you're using the latest version of Edge

### iOS Safari
- iOS Safari has good MediaRecorder support
- Make sure to allow microphone access when prompted
- Try recording in a quiet environment

### Android Chrome
- Android Chrome has excellent MediaRecorder support
- Check microphone permissions in Android settings
- Try clearing browser cache and data

## Debugging Steps

### Step 1: Use the Test Page
1. Open `/test-audio.html` in your browser
2. Click "Test Browser Support"
3. Try recording audio
4. Check the debug log for errors

### Step 2: Check Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try recording audio
4. Look for failed requests to `/api/transcribe`

### Step 3: Check Server Logs
1. Look at your terminal where `npm run dev` is running
2. Check for error messages when recording

### Step 4: Test API Directly
1. Use the test page to record audio
2. Click "Test Transcription API"
3. Check if the API call succeeds

## Environment Setup Checklist

- [ ] Node.js installed (v16 or higher)
- [ ] All dependencies installed (`npm install`)
- [ ] `.env.local` file created with all required variables
- [ ] Firebase project created and configured
- [ ] OpenAI API key obtained and configured
- [ ] Development server running (`npm run dev`)

## Required Environment Variables

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

# Whisper API (for voice transcription)
OPENAI_API_KEY=your_openai_api_key_here
```

## CRITICAL: FormData Parsing Issues

### The "Invalid Audio Format" Problem

**Symptoms:**
- "Invalid audio format" errors from Whisper API
- Audio recording works but transcription fails
- Server receives malformed binary data instead of proper audio file

**Root Cause:**
The server/API handler is not correctly interpreting the FormData object sent from the client. Instead of extracting the file from the FormData fields, it's receiving the entire FormData payload as if it were a single, raw binary file.

### How FormData Works

When you create FormData on the client and append a file, it's sent with a `Content-Type: multipart/form-data` header. The body contains multiple parts, each with its own Content-Disposition and Content-Type.

**Example FormData structure:**
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ

------WebKitFormBoundaryXYZ
Content-Disposition: form-data; name="audio_file"; filename="recording.webm"
Content-Type: audio/webm

[Binary data of your WEBM file]
------WebKitFormBoundaryXYZ--
```

### The Solution: Proper FormData Parsing

**For Next.js API Routes (Our Implementation):**

1. **Disable default body parser:**
```javascript
export const config = {
  api: {
    bodyParser: false,
  },
}
```

2. **Use formidable for parsing:**
```javascript
import formidable, { Fields, Files } from 'formidable'

const form = formidable({
  maxFileSize: 100 * 1024 * 1024, // 100MB max
  allowEmptyFiles: false,
})

form.parse(req, async (err: any, fields: Fields, files: Files) => {
  if (err) {
    return res.status(400).json({ error: 'Failed to parse form data' })
  }

  const audioFile = files.audio
  const file = Array.isArray(audioFile) ? audioFile[0] : audioFile
  
  // Read the file buffer
  const fs = require('fs')
  const audioBuffer = fs.readFileSync(file.filepath)
  
  // Now pass audioBuffer to transcription service
})
```

**Key Points:**
- **NEVER** use Next.js default body parser for file uploads
- **ALWAYS** use `formidable` or similar multipart parser
- **ALWAYS** disable `bodyParser` in API config
- **ALWAYS** read file as buffer using `fs.readFileSync()`

### Common Mistakes to Avoid

1. **Using default body parser** - This treats FormData as raw binary
2. **Not disabling bodyParser** - Causes parsing conflicts
3. **Direct FormData access** - Won't work without proper parsing
4. **Wrong field names** - Must match what client sends

### Testing the Fix

1. **Check server logs** for "Form parsed successfully"
2. **Verify file details** are logged correctly
3. **Confirm audioBuffer size** is reasonable
4. **Test transcription** works after parsing

## Still Having Issues?

1. **Check the test page**: `/test-audio.html`
2. **Review console logs**: Look for specific error messages
3. **Test on desktop**: Try recording on a desktop browser first
4. **Check network**: Ensure you have a stable internet connection
5. **Try different browser**: Switch to Chrome or Safari

## Getting Help

If you're still experiencing issues:
1. Note the exact error message
2. Check which browser and version you're using
3. Test on the `/test-audio.html` page
4. Share the console logs and error messages 