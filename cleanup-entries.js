// Cleanup script to identify and remove entries that don't belong to the current user
// Run this in the browser console on your app

import { db } from './lib/firebase';
import { ref, get, remove } from 'firebase/database';
import { FirebaseAuthService } from './lib/firebase-auth';

async function cleanupEntries() {
  const user = FirebaseAuthService.getCurrentUser();
  if (!user) {
    console.error('No authenticated user found');
    return;
  }

  console.log('Current user:', user.uid);
  
  try {
    // Get all entries from user's path
    const userEntriesRef = ref(db, `users/${user.uid}/journal_entries`);
    const snapshot = await get(userEntriesRef);
    
    if (!snapshot.exists()) {
      console.log('No entries found for user');
      return;
    }

    const entries = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      entries.push({
        id: childSnapshot.key,
        text: data.text,
        timestamp: data.timestamp,
        // Add any other fields that might help identify ownership
      });
    });

    console.log(`Found ${entries.length} entries for user ${user.uid}:`);
    entries.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.id}] ${entry.text.substring(0, 50)}...`);
    });

    // Ask user which entries to keep
    console.log('\nTo remove an entry, call: removeEntry("entry_id")');
    console.log('Example: removeEntry("abc123")');
    
    // Make the function available globally
    window.removeEntry = async (entryId) => {
      try {
        const entryRef = ref(db, `users/${user.uid}/journal_entries/${entryId}`);
        await remove(entryRef);
        console.log(`Removed entry: ${entryId}`);
      } catch (error) {
        console.error('Error removing entry:', error);
      }
    };

  } catch (error) {
    console.error('Error getting entries:', error);
  }
}

// Run the cleanup
cleanupEntries(); 