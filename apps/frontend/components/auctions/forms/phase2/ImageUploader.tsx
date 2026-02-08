'use client';

import { useState, useRef } from 'react';

interface ImageUploaderProps {
  images: any[];
  onChange: (images: any[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    // Filter for images and limit size to 2MB
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024
    );

    if (validFiles.length === 0) {
      alert('Please select image files under 2MB each');
      setUploading(false);
      return;
    }

    // Limit to 5 images total
    if (images.length + validFiles.length > 5) {
      alert(`Maximum 5 images allowed. You have ${images.length} already.`);
      setUploading(false);
      return;
    }

    const newImages: any[] = [];
    let loadedCount = 0;

    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push({
            id: Date.now() + index,
            src: e.target.result as string,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
            type: file.type,
          });
          
          loadedCount++;
          
          // When all files are loaded, update state
          if (loadedCount === validFiles.length) {
            const updatedImages = [...images, ...newImages];
            onChange(updatedImages);
            setUploading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: number) => {
    const updatedImages = images.filter(img => img.id !== id);
    onChange(updatedImages);
  };

  const setPrimaryImage = (id: number) => {
    const image = images.find(img => img.id === id);
    if (image) {
      const otherImages = images.filter(img => img.id !== id);
      onChange([image, ...otherImages]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Item Photos
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="text-4xl">📸</div>
          <div>
            <h3 className="font-medium text-gray-900">Click to upload photos</h3>
            <p className="text-sm text-gray-500 mt-1">
              Max 5 images, 2MB each. First image is the primary thumbnail.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= 5}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Select Images'}
          </button>
          
          <p className="text-xs text-gray-400">
            JPG, PNG, WebP supported. For video, use YouTube/Vimeo links in description.
          </p>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Uploaded Photos ({images.length}/5)
            </h4>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {images.map((img, index) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Remove"
                    >
                      ✕
                    </button>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(img.id)}
                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Set as primary"
                      >
                        ⭐
                      </button>
                    )}
                  </div>
                </div>
                
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-600 truncate">
                  {img.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Upload Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">🎥 Video Option</h4>
        <p className="text-sm text-blue-700">
          For video demonstrations (max 20 seconds), upload to YouTube/Vimeo and include the link in your auction description.
          Example: "Video tour: https://youtube.com/shorts/..."
        </p>
      </div>
    </div>
  );
}
