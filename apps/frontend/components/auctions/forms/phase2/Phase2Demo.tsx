'use client';

import { useState } from 'react';
import FormTypeSelector from './FormTypeSelector';
import PuritySelector from './PuritySelector';
import CertificationInput from './CertificationInput';
import ImageUploader from './ImageUploader';
import SerialNumberInput from './SerialNumberInput';

export default function Phase2Demo() {
  // Each component manages its own state - truly modular
  const [formType, setFormType] = useState<'coin' | 'round' | 'bar' | 'jewelry' | 'other'>('coin');
  const [purity, setPurity] = useState<number>(0.999);
  const [metalType, setMetalType] = useState<'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other'>('Gold');
  const [certification, setCertification] = useState({
    isGraded: false,
    service: undefined,
    grade: undefined,
    certNumber: undefined,
  });
  const [serialNumber, setSerialNumber] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Phase 2 Data:', {
      formType,
      purity,
      metalType,
      certification,
      serialNumber,
      images: images.length,
    });
    alert('Form data logged to console');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Phase 2: Modular Components</h1>
        <p className="text-gray-600 mt-2">Each component is self-contained and independent</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Component 1: Form Type Selector */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Form Type</h2>
          <FormTypeSelector value={formType} onChange={setFormType} />
        </div>

        {/* Component 2: Purity Selector */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Purity Selection</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metal Type</label>
              <select
                value={metalType}
                onChange={(e) => setMetalType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="Palladium">Palladium</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <PuritySelector metalType={metalType} value={purity} onChange={setPurity} />
          </div>
        </div>

        {/* Component 3: Certification */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Certification</h2>
          <CertificationInput value={certification} onChange={setCertification} />
        </div>

        {/* Component 4: Serial Number */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Serial Number</h2>
          <SerialNumberInput value={serialNumber} onChange={setSerialNumber} />
        </div>

        {/* Component 5: Image Uploader */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Images</h2>
          <ImageUploader onImagesChange={setImages} />
        </div>

        {/* Submit */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Phase 2 Components
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Each component is under 200 lines and handles one responsibility only
          </p>
        </div>
      </form>
    </div>
  );
}
