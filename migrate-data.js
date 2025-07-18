const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, remove } = require('firebase/database');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Get all entries from the old path
    const oldEntriesRef = ref(db, 'journal_entries');
    const oldSnapshot = await get(oldEntriesRef);
    
    if (!oldSnapshot.exists()) {
      console.log('No existing entries found to migrate.');
      return;
    }
    
    console.log(`Found ${Object.keys(oldSnapshot.val()).length} entries to migrate.`);
    
    // Get all users from Firebase Auth (you'll need to provide user IDs)
    // For now, we'll migrate to a default user or you can specify user IDs
    const userIds = process.env.MIGRATE_TO_USER_IDS?.split(',') || [];
    
    if (userIds.length === 0) {
      console.log('No user IDs specified. Please set MIGRATE_TO_USER_IDS environment variable.');
      console.log('Example: MIGRATE_TO_USER_IDS=user1,user2');
      return;
    }
    
    // Distribute entries among users (round-robin)
    const entries = [];
    oldSnapshot.forEach((childSnapshot) => {
      entries.push({
        id: childSnapshot.key,
        data: childSnapshot.val()
      });
    });
    
    console.log(`Distributing ${entries.length} entries among ${userIds.length} users...`);
    
    // Migrate entries to user-specific paths
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const userId = userIds[i % userIds.length]; // Round-robin distribution
      
      const newEntryRef = ref(db, `users/${userId}/journal_entries/${entry.id}`);
      await set(newEntryRef, entry.data);
      
      console.log(`Migrated entry ${entry.id} to user ${userId}`);
    }
    
    console.log('Migration completed successfully!');
    console.log('You can now update the database rules to block the old path.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateData(); 