'use client';

import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';

export default function CreateArtworkButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/create')}
      className="group relative inline-flex items-center px-6 py-3 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden"
      style={{
        background: theme.gradients.creative,
        boxShadow: theme.shadows.medium,
      }}
    >
      {/* Animated background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-shift"
        style={{
          background: `${theme.gradients.playful}, ${theme.gradients.creative}`,
          backgroundSize: '200% 200%',
        }}
      />

      {/* Icon */}
      <svg
        className="relative w-5 h-5 mr-2 transform transition-transform duration-300 group-hover:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>

      {/* Text */}
      <span className="relative text-sm">Create Artwork</span>
    </button>
  );
} 