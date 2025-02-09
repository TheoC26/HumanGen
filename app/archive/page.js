'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getPromptHistory } from '@/lib/firebase/prompts';
import { getArtworksByPrompt } from '@/lib/firebase/db';
import ArtworkCard from '@/components/artwork/ArtworkCard';

export default function ArchivePage() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        let promptsData = await getPromptHistory(50); // Get up to 50 past prompts
        promptsData.shift();
        setPrompts(promptsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prompts:', error);
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      if (!selectedPrompt) return;
      
      try {
        setLoading(true);
        const artworksData = await getArtworksByPrompt(selectedPrompt.prompt);
        setArtworks(artworksData);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [selectedPrompt]);

  const handleLike = useCallback((artworkId, newLikes) => {
    setArtworks(prevArtworks => {
      // Find the artwork that was liked
      const artworkIndex = prevArtworks.findIndex(a => a.id === artworkId);
      if (artworkIndex === -1) return prevArtworks;

      // Create a new array with the updated artwork
      const newArtworks = [...prevArtworks];
      newArtworks[artworkIndex] = {
        ...newArtworks[artworkIndex],
        likes: newLikes,
        hasLiked: !newArtworks[artworkIndex].hasLiked // Toggle the hasLiked status
      };

      // Sort by likes (descending) and then by creation date (descending)
      return newArtworks.sort((a, b) => {
        if (a.likes !== b.likes) return b.likes - a.likes;
        return b.createdAt.toDate() - a.createdAt.toDate();
      });
    });
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Archive</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Prompt List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedPrompt?.id === prompt.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-500 mb-1">
                      {formatDate(prompt.startDate)}
                    </p>
                    <p className="text-gray-900 font-medium line-clamp-2">
                      {prompt.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Artwork Grid */}
          <div className="lg:col-span-3">
            {selectedPrompt ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedPrompt.prompt}
                </h2>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artworks.map((artwork) => (
                        <ArtworkCard
                          key={artwork.id}
                          artwork={artwork}
                          onLike={() => {}}
                          allowLike={false}
                        />
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Select a prompt to view artworks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 