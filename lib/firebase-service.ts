import { db } from './firebase';
import { ref, push, get, update, serverTimestamp } from 'firebase/database';
import { FirebaseAuthService } from './firebase-auth';

export interface JournalEntry {
  id: string;
  title?: string;
  text: string;
  timestamp: Date;
  tags?: string[];
}

export class FirebaseService {
  // Get the current user's data path
  private static getUserDataPath(): string {
    const user = FirebaseAuthService.getCurrentUser();
    console.log('FirebaseService: Current user:', user ? { uid: user.uid, email: user.email } : 'null');
    console.log('FirebaseService: Is authenticated:', FirebaseAuthService.isAuthenticated());
    console.log('FirebaseService: Auth object:', FirebaseAuthService.getCurrentUser());
    
    if (user) {
      // New multi-user structure
      const path = `users/${user.uid}/journal_entries`;
      console.log('FirebaseService: Using user-specific path:', path);
      return path;
    } else {
      // Fallback to old structure for backward compatibility
      console.log('FirebaseService: No user found, using fallback path: journal_entries');
      console.log('FirebaseService: This should not happen if user is authenticated!');
      return 'journal_entries';
    }
  }

  static async createEntry(text: string, title?: string, tags?: string[]): Promise<JournalEntry | null> {
    try {
      console.log('FirebaseService: Attempting to create entry with text:', text);
      console.log('FirebaseService: Database instance:', db);
      
      const dataPath = this.getUserDataPath();
      console.log('FirebaseService: Using data path:', dataPath);
      
      const entriesRef = ref(db, dataPath);
      const newEntryRef = await push(entriesRef, {
        text: text,
        title: title || '',
        timestamp: serverTimestamp(),
        tags: tags || []
      });

      console.log('FirebaseService: Entry created successfully with ID:', newEntryRef.key);

      return {
        id: newEntryRef.key || '',
        title: title || '',
        text: text,
        timestamp: new Date(),
        tags: tags || []
      };
    } catch (error: any) {
      console.error('FirebaseService: Error creating entry:', error);
      console.error('FirebaseService: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return null;
    }
  }

  static async updateEntry(id: string, text: string, title?: string, tags?: string[]): Promise<boolean> {
    try {
      console.log('FirebaseService: Attempting to update entry with ID:', id);
      
      const dataPath = this.getUserDataPath();
      const entryRef = ref(db, `${dataPath}/${id}`);
      await update(entryRef, {
        text: text,
        title: title || '',
        tags: tags || [],
        lastModified: serverTimestamp()
      });

      console.log('FirebaseService: Entry updated successfully');
      return true;
    } catch (error: any) {
      console.error('FirebaseService: Error updating entry:', error);
      console.error('FirebaseService: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return false;
    }
  }

  static async getEntries(): Promise<JournalEntry[]> {
    try {
      console.log('FirebaseService: Attempting to get entries');
      
      // Wait a moment for auth state to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataPath = this.getUserDataPath();
      console.log('FirebaseService: Using data path:', dataPath);
      
      const entriesRef = ref(db, dataPath);
      const snapshot = await get(entriesRef);
      
      console.log('FirebaseService: Retrieved entries:', snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
      
      const entries: JournalEntry[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          entries.push({
            id: childSnapshot.key || '',
            title: data.title || '',
            text: data.text,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            tags: data.tags || []
          });
        });
      }
      
      // Sort by timestamp descending (newest first)
      return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error: any) {
      console.error('FirebaseService: Error getting entries:', error);
      console.error('FirebaseService: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return [];
    }
  }

  static async migrateExistingEntries(): Promise<boolean> {
    try {
      console.log('FirebaseService: Starting migration of existing entries');
      
      const user = FirebaseAuthService.getCurrentUser();
      if (!user) {
        console.error('FirebaseService: No authenticated user for migration');
        return false;
      }

      // Get entries from old path
      const oldEntriesRef = ref(db, 'journal_entries');
      const oldSnapshot = await get(oldEntriesRef);
      
      if (!oldSnapshot.exists()) {
        console.log('FirebaseService: No existing entries to migrate');
        return true;
      }

      const userEntriesRef = ref(db, `users/${user.uid}/journal_entries`);
      const migrationPromises: Promise<any>[] = [];

      oldSnapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const newEntryRef = ref(db, `users/${user.uid}/journal_entries/${childSnapshot.key}`);
        migrationPromises.push(update(newEntryRef, data));
      });

      await Promise.all(migrationPromises);
      console.log('FirebaseService: Migration completed successfully');
      
      return true;
    } catch (error: any) {
      console.error('FirebaseService: Migration failed:', error);
      return false;
    }
  }
} 