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
      const docRef = await addDoc(collection(db, 'journal_entries'), {
        text: text,
        timestamp: Timestamp.now(),
        tags: []
      });

      return {
        id: docRef.id,
        text: text,
        timestamp: new Date(),
        tags: []
      };
    } catch (error) {
      console.error('Error creating entry:', error);
      return null;
    }
  }

  static async getEntries(): Promise<JournalEntry[]> {
    try {
      const q = query(collection(db, 'journal_entries'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        timestamp: doc.data().timestamp.toDate(),
        tags: doc.data().tags || []
      }));
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];
    }
  }
} 