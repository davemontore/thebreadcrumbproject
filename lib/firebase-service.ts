import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

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
      
      const docRef = await addDoc(collection(db, 'journal_entries'), {
        text: text,
        timestamp: Timestamp.now(),
        tags: []
      });

      console.log('FirebaseService: Entry created successfully with ID:', docRef.id);

      return {
        id: docRef.id,
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
      const q = query(collection(db, 'journal_entries'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('FirebaseService: Retrieved entries:', querySnapshot.docs.length);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        timestamp: doc.data().timestamp.toDate(),
        tags: doc.data().tags || []
      }));
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