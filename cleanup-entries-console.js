// Copy and paste this into your browser console while on your app

// First, let's see what entries you have
const user = FirebaseAuthService.getCurrentUser();
console.log('Current user:', user.uid);

// Get all entries from your user path
const userEntriesRef = ref(db, `users/${user.uid}/journal_entries`);
get(userEntriesRef).then(snapshot => {
  if (!snapshot.exists()) {
    console.log('No entries found');
    return;
  }

  const entries = [];
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    entries.push({
      id: childSnapshot.key,
      text: data.text,
      timestamp: data.timestamp
    });
  });

  console.log(`Found ${entries.length} entries:`);
  entries.forEach((entry, index) => {
    console.log(`${index + 1}. [${entry.id}] ${entry.text.substring(0, 50)}...`);
  });

  // Create a function to remove entries
  window.removeEntry = async (entryId) => {
    try {
      const entryRef = ref(db, `users/${user.uid}/journal_entries/${entryId}`);
      await remove(entryRef);
      console.log(`Removed entry: ${entryId}`);
      // Refresh the page to see changes
      window.location.reload();
    } catch (error) {
      console.error('Error removing entry:', error);
    }
  };

  console.log('\nTo remove an entry, call: removeEntry("entry_id")');
  console.log('Example: removeEntry("abc123")');
}).catch(error => {
  console.error('Error getting entries:', error);
}); 