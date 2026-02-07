'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const newImages: string[] = [];
    
    Array.from(files).slice(0, maxImages - images.length).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newImages.push(result);
          
          if (newImages.length === Math.min(files.length, maxImages - images.length)) {
            const updatedImages = [...images, ...newImages];
            setImages(updatedImages);
            onImagesChange(updatedImages);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        multiple
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Upload area */}
      {images.length < maxImages && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
            Upload Item Photos
          </h3>
          <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
            Drag & drop images or click to browse
          </p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Upload up to {maxImages} photos. Recommended: high-quality, well-lit images.
          </p>
        </div>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem', color: '#374151' }}>
            Uploaded Photos ({images.length}/{maxImages})
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {images.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px',
                  textAlign: 'center'
                }}>
                  {index === 0 ? 'Main Photo' : `Photo ${index + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#0369a1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '1rem' }}>💡</div>
          <strong>Photo Tips:</strong>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Use natural lighting for accurate color representation</li>
          <li>Include close-ups of mint marks, dates, and serial numbers</li>
          <li>Show any imperfections or wear honestly</li>
          <li>Include photos with scale (ruler or coin for size reference)</li>
        </ul>
      </div>
    </div>
  );
}
