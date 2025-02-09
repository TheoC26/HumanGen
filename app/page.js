"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { getCurrentPrompt } from "@/lib/firebase/prompts";
import { getArtworksByPrompt } from "@/lib/firebase/db";
import ArtworkCard from "@/components/artwork/ArtworkCard";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const promptData = await getCurrentPrompt();
        setPrompt(promptData.prompt);

        const artworksData = await getArtworksByPrompt(promptData.prompt);
        setArtworks(artworksData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with prompt and archive link */}
        <div className="flex justify-between items-center mb-12">
          <div className="max-w-4xl">
            {loading ? (
              <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {prompt}
              </h1>
            )}
          </div>
          {/* <Link 
            href="/archive"
            className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
          >
            View Archive
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link> */}
        </div>

        {/* Artwork Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/create"
              className="aspect-square relative rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
              <svg
                className="relative w-12 h-12 mb-3 text-white transform transition-transform duration-300 group-hover:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="relative text-white font-medium">
                Create a Piece!
              </span>
            </Link>
            <AnimatePresence mode="popLayout">
              {artworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onLike={handleLike}
                  allowLike={true}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
