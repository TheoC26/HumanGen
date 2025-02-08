'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStroke } from 'perfect-freehand';
import { getSvgPathFromStroke } from '@/lib/utils/drawing';
import CanvasToolbar from './CanvasToolbar';
import { submitArtwork } from '@/lib/firebase/db';

export default function Canvas({ prompt, colors }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [penSize, setPenSize] = useState(8);
  const [penColor, setPenColor] = useState('#000000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match container with proper pixel density
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth; // Width will be constrained by parent, height will match
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    redrawCanvas();
  }, []);

  // Redraw when strokes or currentPoints change
  useEffect(() => {
    redrawCanvas();
  }, [strokes, currentPoints]);

  const redrawCanvas = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw all strokes
    strokes.forEach(stroke => {
      ctx.fillStyle = stroke.color;
      const outlinePoints = getStroke(stroke.points, {
        size: stroke.size,
        thinning: 0.0,
        smoothing: 0.0,
        streamline: 0.0,
      });
      
      const path = new Path2D(getSvgPathFromStroke(outlinePoints));
      ctx.fill(path);
    });

    // Draw current stroke
    if (currentPoints.length > 0) {
      ctx.fillStyle = penColor;
      const outlinePoints = getStroke(currentPoints, {
        size: penSize,
        thinning: 0.0,
        smoothing: 0.0,
        streamline: 0.0,
      });
      
      const path = new Path2D(getSvgPathFromStroke(outlinePoints));
      ctx.fill(path);
    }
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    setCurrentPoints([[offsetX, offsetY, e.pressure || 0.5]]);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    setCurrentPoints(points => [...points, [offsetX, offsetY, e.pressure || 0.5]]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentPoints.length > 0) {
      setStrokes(prev => [...prev, {
        points: currentPoints,
        size: penSize,
        color: penColor
      }]);
      setCurrentPoints([]);
      setIsDrawing(false);
    }
  };

  const getCoordinates = (e) => {
    if (e.touches) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY,
    };
  };

  const undo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const canUndo = strokes.length > 0;

  const handleSubmit = async () => {
    if (!canvasRef.current) return;
    
    try {
      setIsSubmitting(true);
      setError(null);

      // Get canvas data
      const imageData = canvasRef.current.toDataURL('image/png');
      
      // Submit to Firebase
      await submitArtwork(imageData, prompt);
      
      // Redirect to gallery
      router.push('/');
    } catch (error) {
      console.error('Error submitting artwork:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <CanvasToolbar
        penSize={penSize}
        setPenSize={setPenSize}
        penColor={penColor}
        setPenColor={setPenColor}
        onUndo={undo}
        canUndo={canUndo}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        colors={colors}
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative w-full aspect-square bg-white rounded-lg shadow-inner border border-gray-200">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
} 