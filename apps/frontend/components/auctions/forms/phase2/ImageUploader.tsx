'use client';
import * as React from 'react';

interface ImageUploaderProps {
  onImagesChange: (images: any[]) => void;
}

export default function ImageUploader({
  onImagesChange,
}: ImageUploaderProps) {
  const [images, setImages] = React.useState<any[]>([]);

  const handleFileSelect = (files: FileList) => {
    const newImages: any[] = [];
    const fileArray = Array.from(files).slice(0, 5 - images.length);

    fileArray.forEach((file, index) => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const imageData = {
          id: Date.now() + index.toString(),
          url,
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Item Photos</h3>
        <p className="text-sm text-gray-600">
          Upload clear photos. First image is the primary thumbnail.
        </p>
      </div>

      {images.length < 5 && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <div className="text-gray-400 text-4xl mb-4">📸</div>
          <h4 className="font-medium text-gray-700 mb-2">
            Click to upload photos
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Max 5 images, 5MB each
          </p>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative">
              <img
                src={image.url}
                alt={`Item view ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              {image.isPrimary && (
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    Primary
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500">
        {images.length} of 5 photos uploaded
      </div>
    </div>
  );
}
