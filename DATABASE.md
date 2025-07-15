# Database Configuration

## IMPORTANT: This app uses Firebase Realtime Database, NOT Firestore

This application is configured to use **Firebase Realtime Database**, which is different from Firebase Firestore. This distinction is critical for proper setup and troubleshooting.

## Database Type: Firebase Realtime Database

### What is Firebase Realtime Database?
- **JSON-based database** that stores data as a tree structure
- **Real-time synchronization** across all connected clients
- **Offline support** with automatic sync when connection is restored
- **Simple querying** with basic filtering and ordering

### Why Realtime Database (not Firestore)?
- **Simpler setup** for this use case
- **Real-time updates** work out of the box
- **Lower complexity** for basic CRUD operations
- **Better performance** for small to medium datasets

## Configuration Files

### 1. Firebase Configuration (`lib/firebase.ts`)
```typescript
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // NOT firebase/firestore

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // REQUIRED for Realtime Database
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); // Realtime Database instance
```

### 2. Database Service (`lib/firebase-service.ts`)
```typescript
import { ref, push, get, query, orderByChild, serverTimestamp } from 'firebase/database';
// NOT: import { collection, addDoc, getDocs } from 'firebase/firestore'

export class FirebaseService {
  static async createEntry(text: string) {
    const entriesRef = ref(db, 'journal_entries'); // Realtime Database reference
    const newEntryRef = await push(entriesRef, {
      text: text,
      timestamp: serverTimestamp(),
      tags: []
    });
    return newEntryRef.key;
  }

  static async getEntries() {
    const entriesRef = ref(db, 'journal_entries');
    const snapshot = await get(entriesRef);
    // Process snapshot data...
  }
}
```

## Environment Variables

### Required for Realtime Database:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com  # CRITICAL
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Key Points:
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is **REQUIRED** for Realtime Database
- This URL format: `https://your_project-default-rtdb.firebaseio.com`
- **NOT** the Firestore URL format

## Firebase Console Setup

### 1. Create Realtime Database (NOT Firestore)
1. Go to Firebase Console
2. Click "Realtime Database" (not "Firestore Database")
3. Click "Create database"
4. Choose "Start in test mode"
5. Select location

### 2. Database URL
- Your database URL will be: `https://your_project-default-rtdb.firebaseio.com`
- This is different from Firestore URLs

### 3. Database Rules
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Data Structure

### Realtime Database Structure:
```json
{
  "journal_entries": {
    "-NxYz123": {
      "text": "My journal entry",
      "timestamp": 1703123456789,
      "tags": ["personal", "reflection"]
    },
    "-NxYz124": {
      "text": "Another entry",
      "timestamp": 1703123456790,
      "tags": ["work", "ideas"]
    }
  }
}
```

### Key Differences from Firestore:
- **No collections/documents** - just JSON tree structure
- **No subcollections** - nested objects instead
- **No complex queries** - basic filtering and ordering only
- **Real-time by default** - no need for onSnapshot listeners

## Common Errors and Solutions

### 1. "Firestore connection failed"
**Cause**: Code is trying to use Firestore instead of Realtime Database
**Solution**: 
- Check imports: use `firebase/database` not `firebase/firestore`
- Verify `getDatabase()` not `getFirestore()`
- Ensure `databaseURL` is set in config

### 2. "Database URL not found"
**Cause**: Missing `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
**Solution**: Add the Realtime Database URL to environment variables

### 3. "Permission denied"
**Cause**: Database rules are too restrictive
**Solution**: Set rules to allow read/write in test mode

### 4. "Collection not found"
**Cause**: Using Firestore terminology with Realtime Database
**Solution**: Use `ref(db, 'path')` instead of `collection(db, 'name')`

## Migration from Firestore

If you previously used Firestore, here are the key changes:

### Imports:
```typescript
// OLD (Firestore)
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// NEW (Realtime Database)
import { ref, push, get } from 'firebase/database';
import { getDatabase } from 'firebase/database';
```

### Operations:
```typescript
// OLD (Firestore)
const docRef = await addDoc(collection(db, 'entries'), data);
const querySnapshot = await getDocs(collection(db, 'entries'));

// NEW (Realtime Database)
const newRef = await push(ref(db, 'entries'), data);
const snapshot = await get(ref(db, 'entries'));
```

## Testing

### Test Database Connection:
```bash
# Visit: http://localhost:3000/api/test-firebase
# Should return: { "success": true, "entryCount": 0 }
```

### Test Data Creation:
1. Create a journal entry in the app
2. Check Firebase Console → Realtime Database
3. Verify data appears under `journal_entries`

## Troubleshooting Checklist

- [ ] Firebase project has Realtime Database (not Firestore)
- [ ] `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is set correctly
- [ ] Database rules allow read/write
- [ ] Code uses `firebase/database` imports
- [ ] Code uses `getDatabase()` not `getFirestore()`
- [ ] Environment variables are set in Vercel (if deployed)

## Remember

**This app uses Firebase Realtime Database, NOT Firestore.**
**All documentation, setup guides, and code examples should reference Realtime Database.**
**Never use Firestore terminology or imports in this codebase.** 