'use client';

export default function CanvasToolbar({
  penSize,
  setPenSize,
  penColor,
  setPenColor,
  onUndo,
  canUndo,
  onSubmit,
  isSubmitting,
  colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'], // Default colors if none provided
}) {
  const penSizes = [4, 8, 16, 32, 64];

  // Always ensure black is the first color
  const allColors = ['#000000', ...colors.filter(c => c !== '#000000')];

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Pen Size</label>
          <div className="flex space-x-2">
            {penSizes.map((size) => (
              <button
                key={size}
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  penSize === size
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setPenSize(size)}
              >
                <div
                  className="rounded-full bg-black"
                  style={{ width: size / 2.5, height: size / 2.5 }}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <div className="flex space-x-2">
            {allColors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${
                  penColor === color
                    ? 'border-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setPenColor(color)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Actions</label>
          <div className="flex space-x-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                canUndo
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Undo
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                isSubmitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Artwork'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 