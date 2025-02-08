'use client';

import { useEffect, useState } from 'react';
import Canvas from '@/components/canvas/Canvas';
import { getCurrentPrompt } from '@/lib/firebase/prompts';
import { userHasSubmittedAlready } from '@/lib/firebase/db'

export default function CreatePage() {
  const [prompt, setPrompt] = useState('Draw something amazing!');
  const [colors, setColors] = useState(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userHasSubmitted, setUserHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        setLoading(true);
        const promptData = await getCurrentPrompt();
        setPrompt(promptData.prompt);
        setColors(promptData.colors);
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setError('Failed to load today\'s prompt. Using default prompt instead.');
      } finally {
        setLoading(false);
      }
    };

    setUserHasSubmitted(userHasSubmittedAlready());

    fetchPrompt();

  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Artwork</h1>
        </div>

        {!userHasSubmitted && "stop"}

        {/* Prompt Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Prompt</h2>
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse bg-gray-200 h-6 w-3/4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-6 w-1/2 rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-xl text-gray-800 font-medium">{prompt}</p>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </>
              )}
            </div>
            
            {/* Color Palette Display */}
            <div className="ml-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Color Palette</h3>
              <div className="flex gap-2">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Container with Square Aspect Ratio */}
          <div className="max-w-3xl mx-auto">
            <Canvas prompt={prompt} colors={colors} />
          </div>
      </div>
    </div>
  );
} 