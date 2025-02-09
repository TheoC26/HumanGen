'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/providers/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { theme } from '@/lib/theme';
import { toggleLikeArtwork } from '@/lib/firebase/db';

export default function ArtworkCard({ artwork, onLike, allowLike }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(artwork.likes);
  const [hasLiked, setHasLiked] = useState(artwork.hasLiked || false);
  const { showToast } = useToast();

  const handleLike = useCallback(async (e) => {
    e.preventDefault(); // Prevent link navigation if card is wrapped in a link
    if (isLiking) return;

    try {
      setIsLiking(true);
      setOptimisticLikes(prev => prev + (hasLiked ? -1 : 1));
      setHasLiked(prev => !prev);
      
      // Attempt to toggle like
      const result = await toggleLikeArtwork(artwork.id);
      
      // If the like was successful and the count changed, notify parent
      if (result.likes !== artwork.likes) {
        onLike(artwork.id, result.likes);
      }
      
      // Update local state to match server
      setOptimisticLikes(result.likes);
      setHasLiked(result.hasLiked);
    } catch (error) {
      // Revert optimistic updates
      setOptimisticLikes(artwork.likes);
      setHasLiked(artwork.hasLiked || false);
      showToast({
        message: error.message || 'Failed to update like',
        type: 'error'
      });
    } finally {
      setIsLiking(false);
    }
  }, [artwork.id, artwork.likes, artwork.hasLiked, hasLiked, isLiking, onLike, showToast]);

  const handleImageError = () => {
    setIsImageError(true);
    setIsLoading(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group relative aspect-square bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: isHovered ? theme.shadows.strong : theme.shadows.medium,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => allowLike && handleLike(e)}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <LoadingSpinner size="md" className="border-primary-500" />
        </div>
      )}
      {isImageError ? (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      ) : (
        <>
          <Image
            src={artwork.imageData}
            alt="Artwork"
            fill
            className={`object-cover transition-all duration-500 ${
              isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
            } group-hover:scale-[1.02] cursor-pointer`}
            onLoadingComplete={() => setIsLoading(false)}
            onError={handleImageError}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay with like button */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              style={{ background: "rgba(0, 0, 0, 0.3)" }}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={{ scale: isLiking ? 0.8 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{
                    scale: hasLiked ? 1.2 : 1,
                    color: hasLiked ? theme.colors.accent[500] : "white",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill={hasLiked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </motion.div>
                <motion.span
                  className="text-white text-2xl font-bold mt-2"
                  key={optimisticLikes}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {optimisticLikes}
                </motion.span>
              </motion.div>
            </div>
        </>
      )}
    </motion.div>
  );
} 