'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import ArtworkCard from './ArtworkCard';
import CreateArtworkButton from './CreateArtworkButton';

const BATCH_SIZE = 12;

export default function ArtworkGrid() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const loadArtworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let artworksQuery = query(
        collection(db, 'artworks'),
        orderBy('createdAt', 'desc'),
        limit(BATCH_SIZE)
      );

      if (lastDocRef.current) {
        artworksQuery = query(
          collection(db, 'artworks'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDocRef.current),
          limit(BATCH_SIZE)
        );
      }

      const snapshot = await getDocs(artworksQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const newArtworks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      setArtworks(prev => [...prev, ...newArtworks]);
      setHasMore(snapshot.docs.length === BATCH_SIZE);
    } catch (error) {
      console.error('Error loading artworks:', error);
      setError('Failed to load artworks. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadArtworks();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadArtworks]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg inline-block">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Recent Artworks</h2>
        <CreateArtworkButton />
      </div>
      
      {artworks.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No artworks yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}

      {(loading || hasMore) && (
        <div
          ref={loadingRef}
          className="flex justify-center py-8"
        >
          {loading && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 text-sm">Loading more artworks...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 