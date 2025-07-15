import { db } from './firebase';
import { ref, push, get, update, serverTimestamp } from 'firebase/database';

export interface JournalEntry {
  id: string;
  title?: string;
  text: string;
  timestamp: Date;
  tags?: string[];
}

export class FirebaseService {
  static async createEntry(text: string, title?: string, tags?: string[]): Promise<JournalEntry | null> {
    try {
      console.log('FirebaseService: Attempting to create entry with text:', text);
      console.log('FirebaseService: Database instance:', db);
      
      const entriesRef = ref(db, 'journal_entries');
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
      // alert(`Firebase Error: ${error.message}`);
      return null;
    }
  }

  static async updateEntry(id: string, text: string, title?: string, tags?: string[]): Promise<boolean> {
    try {
      console.log('FirebaseService: Attempting to update entry with ID:', id);
      
      const entryRef = ref(db, `journal_entries/${id}`);
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
      const entriesRef = ref(db, 'journal_entries');
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
      // alert(`Firebase Error: ${error.message}`);
      return [];
    }
  }
} 