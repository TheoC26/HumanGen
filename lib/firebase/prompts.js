import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';

const SYSTEM_COLLECTION = 'system';
const PROMPTS_COLLECTION = 'prompts';

export const getCurrentPrompt = async () => {
  try {
    const now = Timestamp.now();
    const promptsQuery = query(
      collection(db, SYSTEM_COLLECTION, 'daily', PROMPTS_COLLECTION),
      where('startDate', '<=', now),
      where('endDate', '>', now),
      orderBy('startDate', 'desc'),
      limit(1)
    );

    const promptDocs = await getDocs(promptsQuery);
    
    if (promptDocs.empty) {
      return {
        prompt: 'Draw something amazing!',
        colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
        startDate: now,
        endDate: Timestamp.fromDate(new Date(now.toDate().getTime() + 7 * 24 * 60 * 60 * 1000)),
      };
    }

    const promptData = promptDocs.docs[0].data();
    return {
      id: promptDocs.docs[0].id,
      ...promptData,
      colors: promptData.colors || ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'], // Fallback colors if not present
    };
  } catch (error) {
    console.error('Error getting current prompt:', error);
    throw error;
  }
};

export const getPromptHistory = async (limitCount = 10) => {
  try {
    const promptsQuery = query(
      collection(db, SYSTEM_COLLECTION, 'daily', PROMPTS_COLLECTION),
      orderBy('startDate', 'desc'),
      limit(limitCount)
    );

    const promptDocs = await getDocs(promptsQuery);
    return promptDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      colors: doc.data().colors || ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'], // Fallback colors
    }));
  } catch (error) {
    console.error('Error getting prompt history:', error);
    throw error;
  }
}; 