'use client';

import { useCallback, useState } from 'react';
import { ImageData } from '@/components/auctions/types/phase2.types';

interface ImageUploaderProps {
  maxImages?: number;
  maxSizeMB?: number;
  onImagesChange: (images: ImageData[]) => void;
  initialImages?: ImageData[];
}

export default function ImageUploader({
  maxImages = 5,
  maxSizeMB = 5,
  onImagesChange,
  initialImages = [],
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    const newImages: ImageData[] = [];
    const fileArray = Array.from(files).slice(0, maxImages - images.length);

    fileArray.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files');
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File must be less than ${maxSizeMB}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const imageData: ImageData = {
          id: Date.now() + index.toString(),
          url,
          file,
          isPrimary: images.length === 0 && newImages.length === 0,
        };
        newImages.push(imageData);

        if (newImages.length === fileArray.length) {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onImagesChange(updatedImages);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images, maxImages, maxSizeMB, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const setPrimaryImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id,
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [moved] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, moved);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Item Photos</h3>
        <p className="text-sm text-gray-600">
          Upload clear photos. First image is the primary thumbnail.
        </p>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={\`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            \${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }
          \`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <div className="text-gray-400 text-4xl mb-4">📸</div>
          <h4 className="font-medium text-gray-700 mb-2">
            Drag & drop photos here
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse. Max {maxImages} images, {maxSizeMB}MB each
          </p>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={\`Item view \${index + 1}\`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1 bg-white rounded-full shadow"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1 bg-white rounded-full shadow"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-1 bg-red-500 text-white rounded-full shadow"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(image.id)}
                      className={\`
                        px-2 py-1 text-xs rounded
                        \${image.isPrimary
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700'
                        }
                      \`}
                    >
                      {image.isPrimary ? 'Primary' : 'Set as primary'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Photo Guidelines */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Photo Guidelines</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clear front and back photos</li>
              <li>• Close-ups of mint marks or serial numbers</li>
              <li>• Certification label (if applicable)</li>
              <li>• Plain, uncluttered background</li>
              <li>• Good lighting without glare or shadows</li>
            </ul>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        {images.length} of {maxImages} photos uploaded
      </div>
    </div>
  );
}
