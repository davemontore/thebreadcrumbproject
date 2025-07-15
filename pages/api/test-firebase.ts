import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { ref, get } from 'firebase/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing Firebase connection...');
    console.log('Database instance:', db);
    
    // Try to access the journal_entries node
    const entriesRef = ref(db, 'journal_entries');
    console.log('Database reference created');
    
    // Try to get data
    const snapshot = await get(entriesRef);
    console.log('Successfully queried database, found', snapshot.exists() ? Object.keys(snapshot.val()).length : 0, 'entries');
    
    res.status(200).json({ 
      success: true, 
      message: 'Firebase connection successful',
      entryCount: snapshot.exists() ? Object.keys(snapshot.val()).length : 0
    });
  } catch (error: any) {
    console.error('Firebase test error:', error);
    res.status(500).json({ 
      error: 'Firebase connection failed',
      message: error.message,
      code: error.code,
      details: error.toString()
    });
  }
} 