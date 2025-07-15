import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing Firebase connection...');
    console.log('Database instance:', db);
    
    // Try to access the collection
    const testCollection = collection(db, 'journal_entries');
    console.log('Collection reference created');
    
    // Try to get documents
    const querySnapshot = await getDocs(testCollection);
    console.log('Successfully queried collection, found', querySnapshot.docs.length, 'documents');
    
    res.status(200).json({ 
      success: true, 
      message: 'Firebase connection successful',
      documentCount: querySnapshot.docs.length
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