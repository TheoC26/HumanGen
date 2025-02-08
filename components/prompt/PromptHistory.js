'use client';

import { useEffect, useState } from 'react';
import { getPromptHistory } from '@/lib/firebase/prompts';

export default function PromptHistory() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const promptsData = await getPromptHistory();
        setPrompts(promptsData);
      } catch (error) {
        console.error('Error fetching prompt history:', error);
        setError('Failed to load prompt history');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Previous Prompts</h2>
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-white p-4 rounded-lg shadow border border-gray-200"
          >
            <div className="text-sm text-gray-500 mb-1">
              Week of{' '}
              {new Date(prompt.startDate.toDate()).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="text-gray-900">{prompt.prompt}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 