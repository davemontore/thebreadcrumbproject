// Script to fix data distribution - run this in browser console
// This will help identify which entries belong to which users

console.log('=== Data Distribution Fix Script ===');

// First, let's check what's in the old shared path
const oldEntriesRef = ref(db, 'journal_entries');
get(oldEntriesRef).then(oldSnapshot => {
  console.log('=== OLD SHARED PATH (journal_entries) ===');
  if (oldSnapshot.exists()) {
    const oldEntries = [];
    oldSnapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      oldEntries.push({
        id: childSnapshot.key,
        text: data.text,
        timestamp: data.timestamp,
        // Look for any user identification in the data
        ...data
      });
    });
    
    console.log(`Found ${oldEntries.length} entries in old shared path:`);
    oldEntries.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.id}] ${entry.text.substring(0, 50)}...`);
    });
  } else {
    console.log('No entries in old shared path');
  }
  
  // Now check current user's path
  const user = FirebaseAuthService.getCurrentUser();
  if (user) {
    const userEntriesRef = ref(db, `users/${user.uid}/journal_entries`);
    get(userEntriesRef).then(userSnapshot => {
      console.log(`\n=== CURRENT USER PATH (users/${user.uid}/journal_entries) ===`);
      if (userSnapshot.exists()) {
        const userEntries = [];
        userSnapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          userEntries.push({
            id: childSnapshot.key,
            text: data.text,
            timestamp: data.timestamp,
            ...data
          });
        });
        
        console.log(`Found ${userEntries.length} entries for current user:`);
        userEntries.forEach((entry, index) => {
          console.log(`${index + 1}. [${entry.id}] ${entry.text.substring(0, 50)}...`);
        });
      } else {
        console.log('No entries for current user');
      }
      
      console.log('\n=== NEXT STEPS ===');
      console.log('1. If you see entries in the old shared path that belong to you, they need to be moved');
      console.log('2. If you see entries in your user path that don\'t belong to you, they need to be removed');
      console.log('3. Run the cleanup script to remove wrong entries from your user path');
    });
  }
}).catch(error => {
  console.error('Error checking data:', error);
}); 