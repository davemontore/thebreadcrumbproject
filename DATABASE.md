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

## Multi-User Data Structure

### Current Structure (User-Specific Paths):
```json
{
  "users": {
    "user1_uid": {
      "journal_entries": {
        "-NxYz123": {
          "text": "My journal entry",
          "title": "Entry title",
          "timestamp": 1703123456789,
          "tags": ["personal", "reflection"]
        },
        "-NxYz124": {
          "text": "Another entry",
          "title": "Another title",
          "timestamp": 1703123456790,
          "tags": ["work", "ideas"]
        }
      }
    },
    "user2_uid": {
      "journal_entries": {
        "-NxYz125": {
          "text": "User 2's entry",
          "title": "User 2 title",
          "timestamp": 1703123456791,
          "tags": ["family", "memories"]
        }
      }
    }
  },
  "journal_entries": {
    ".read": false,
    ".write": false
  }
}
```

### Key Features:
- **User Isolation**: Each user's data is completely separate
- **Firebase Auth Integration**: User UID from Firebase Auth determines data path
- **Secure Access**: Database rules enforce user-specific access
- **Migration Support**: Tools to migrate from old shared structure

## Configuration Files

### 1. Firebase Configuration (`lib/firebase.ts`)
```typescript
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // NOT firebase/firestore
import { getAuth } from "firebase/auth";

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
export const auth = getAuth(app); // Firebase Auth instance
```

### 2. Database Service (`lib/firebase-service.ts`)
```typescript
import { ref, push, get, query, orderByChild, serverTimestamp } from 'firebase/database';
// NOT: import { collection, addDoc, getDocs } from 'firebase/firestore'

export class FirebaseService {
  // Get the current user's data path
  private static async getUserDataPath(): Promise<string> {
    const user = FirebaseAuthService.getCurrentUser();
    if (user) {
      // New multi-user structure
      return `users/${user.uid}/journal_entries`;
    } else {
      // Fallback to old structure for backward compatibility
      return 'journal_entries';
    }
  }

  static async createEntry(text: string, title?: string, tags?: string[]): Promise<JournalEntry | null> {
    const dataPath = await this.getUserDataPath();
    const entriesRef = ref(db, dataPath);
    const newEntryRef = await push(entriesRef, {
      text: text,
      title: title || '',
      timestamp: serverTimestamp(),
      tags: tags || []
    });
    return newEntryRef.key;
  }

  static async getEntries(): Promise<JournalEntry[]> {
    const dataPath = await this.getUserDataPath();
    const entriesRef = ref(db, dataPath);
    const snapshot = await get(entriesRef);
    // Process snapshot data...
  }
}
```

### 3. Authentication Service (`lib/firebase-auth.ts`)
```typescript
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export class FirebaseAuthService {
  static async registerUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      // Handle specific error codes...
      return { success: false, error: errorMessage };
    }
  }

  static async loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      // Handle specific error codes...
      return { success: false, error: errorMessage };
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }
}
```

## Environment Variables

### Required for Realtime Database + Auth:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com  # CRITICAL
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_INVITATION_CODES=code1,code2,code3
```

### Key Points:
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is **REQUIRED** for Realtime Database
- This URL format: `https://your_project-default-rtdb.firebaseio.com`
- **NOT** the Firestore URL format
- `NEXT_PUBLIC_INVITATION_CODES` controls user registration access

## Firebase Console Setup

### 1. Create Realtime Database (NOT Firestore)
1. Go to Firebase Console
2. Click "Realtime Database" (not "Firestore Database")
3. Click "Create database"
4. Choose "Start in test mode"
5. Select location

### 2. Enable Firebase Authentication
1. Go to Firebase Console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 3. Database URL
- Your database URL will be: `https://your_project-default-rtdb.firebaseio.com`
- This is different from Firestore URLs

### 4. Database Rules (Production)
```json
{
  "rules": {
    "users": {
      "$uid": {
        "journal_entries": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid"
        }
      }
    },
    "journal_entries": {
      ".read": false,
      ".write": false
    }
  }
}
```

### 5. Database Rules (Development/Test)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Data Migration

### From Shared to User-Specific Structure

The app originally used a shared `journal_entries` path. Migration to user-specific paths was implemented to support multi-user functionality.

### Migration Process:
1. **Automatic Migration**: The app includes a migration function that moves entries from the old shared path to user-specific paths
2. **Manual Migration**: A standalone migration script is available for manual execution
3. **Database Rules**: After migration, rules block access to the old shared path

### Migration Function:
```typescript
static async migrateExistingEntries(): Promise<boolean> {
  try {
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) return false;

    // Get entries from old path
    const oldEntriesRef = ref(db, 'journal_entries');
    const oldSnapshot = await get(oldEntriesRef);
    
    if (!oldSnapshot.exists()) return true;

    const userEntriesRef = ref(db, `users/${user.uid}/journal_entries`);
    const migrationPromises: Promise<any>[] = [];

    oldSnapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const newEntryRef = ref(db, `users/${user.uid}/journal_entries/${childSnapshot.key}`);
      migrationPromises.push(update(newEntryRef, data));
    });

    await Promise.all(migrationPromises);
    return true;
  } catch (error) {
    return false;
  }
}
```

### Migration Considerations:
- **Data Ownership**: The old shared structure didn't contain user ownership information
- **Manual Assignment**: Migration may require manual cleanup if entries were mixed between users
- **Backup**: Always backup data before migration
- **Testing**: Test migration on a copy of production data first

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
**Solution**: Set rules to allow read/write in test mode, or ensure user is authenticated

### 4. "Collection not found"
**Cause**: Using Firestore terminology with Realtime Database
**Solution**: Use `ref(db, 'path')` instead of `collection(db, 'name')`

### 5. "No entries visible"
**Cause**: User not authenticated or wrong data path
**Solution**: 
- Check that user is logged in
- Verify Firebase Auth is working
- Check browser console for authentication status
- Ensure database rules allow user access

### 6. "Invalid invitation code"
**Cause**: Invitation code validation failing
**Solution**:
- Verify `NEXT_PUBLIC_INVITATION_CODES` is set
- Check that codes are comma-separated without spaces
- Ensure the code matches exactly (case-sensitive)

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

### Test Authentication:
1. Try creating an account with invitation code
2. Test logging in and out
3. Verify user-specific data paths are used

### Test Data Creation:
1. Create a journal entry in the app
2. Check Firebase Console → Realtime Database
3. Verify data appears under `users/{uid}/journal_entries`

## Troubleshooting Checklist

- [ ] Firebase project has Realtime Database (not Firestore)
- [ ] Firebase Authentication is enabled
- [ ] `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_INVITATION_CODES` is set
- [ ] Database rules allow authenticated user access
- [ ] Code uses `firebase/database` imports
- [ ] Code uses `getDatabase()` not `getFirestore()`
- [ ] Environment variables are set in Vercel (if deployed)
- [ ] Authorized domains are configured in Firebase Auth

## Security Best Practices

### 1. User Isolation
- Each user's data is stored in separate paths
- Database rules enforce user-specific access
- No cross-user data access is possible

### 2. Authentication
- Firebase Auth provides industry-standard security
- Invitation codes prevent unauthorized signups
- Session management is handled automatically

### 3. Database Rules
- Production rules should enforce user isolation
- Old shared paths should be blocked
- Regular security audits are recommended

### 4. Environment Variables
- Never commit sensitive keys to version control
- Use environment variables for all configuration
- Rotate API keys regularly

## Remember

**This app uses Firebase Realtime Database, NOT Firestore.**
**All documentation, setup guides, and code examples should reference Realtime Database.**
**Never use Firestore terminology or imports in this codebase.**
**User data is isolated by Firebase Auth UID in separate database paths.** 