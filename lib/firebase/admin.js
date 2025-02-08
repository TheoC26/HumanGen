import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '@/firebase';

export const generateNewPrompt = async () => {
  try {
    const functions = getFunctions();
    const generatePrompt = httpsCallable(functions, 'generatePromptManually');
    const result = await generatePrompt();
    return result.data;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}; 