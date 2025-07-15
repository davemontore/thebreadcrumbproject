export interface JournalEntry {
  id: string;
  text: string;
  timestamp: Date;
  tags?: string[];
}

export class LocalStorageService {
  private static STORAGE_KEY = 'journal_entries';

  static async createEntry(text: string): Promise<JournalEntry | null> {
    try {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        text: text,
        timestamp: new Date(),
        tags: []
      };

      const existingEntries = this.getEntriesFromStorage();
      existingEntries.unshift(entry); // Add to beginning
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingEntries));

      console.log('LocalStorageService: Entry created successfully:', entry.id);
      return entry;
    } catch (error) {
      console.error('LocalStorageService: Error creating entry:', error);
      return null;
    }
  }

  static async getEntries(): Promise<JournalEntry[]> {
    try {
      return this.getEntriesFromStorage();
    } catch (error) {
      console.error('LocalStorageService: Error getting entries:', error);
      return [];
    }
  }

  private static getEntriesFromStorage(): JournalEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const entries = JSON.parse(stored);
      return entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.error('LocalStorageService: Error parsing stored entries:', error);
      return [];
    }
  }
} 