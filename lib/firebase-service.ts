import { db } from './firebase';
import { ref, push, get, query, orderByChild, serverTimestamp } from 'firebase/database';

export interface JournalEntry {
  id: string;
  text: string;
  timestamp: Date;
  tags?: string[];
}

export class FirebaseService {
  static async createEntry(text: string): Promise<JournalEntry | null> {
    try {
      console.log('FirebaseService: Attempting to create entry with text:', text);
      console.log('FirebaseService: Database instance:', db);
      
      const entriesRef = ref(db, 'journal_entries');
      const newEntryRef = await push(entriesRef, {
        text: text,
        timestamp: serverTimestamp(),
        tags: []
      });

      console.log('FirebaseService: Entry created successfully with ID:', newEntryRef.key);

      return {
        id: newEntryRef.key || '',
        text: text,
        timestamp: new Date(),
        tags: []
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

  static async getEntries(): Promise<JournalEntry[]> {
    try {
      console.log('FirebaseService: Attempting to get entries');
      const entriesRef = ref(db, 'journal_entries');
      const entriesQuery = query(entriesRef, orderByChild('timestamp'));
      const snapshot = await get(entriesQuery);
      
            console.log('FirebaseService: Retrieved entries:', snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
      
      const entries: JournalEntry[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          entries.push({
            id: childSnapshot.key || '',
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