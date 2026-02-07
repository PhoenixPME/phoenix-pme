'use client';

import { useState } from 'react';
import MetalSelector from './forms/MetalSelector';
import FormTypeSelector from './forms/phase2/FormTypeSelector';
import WeightInput from './forms/WeightInput';
import PuritySelector from './forms/phase2/PuritySelector';
import CertificationInput from './forms/phase2/CertificationInput';
import SerialNumberInput from './forms/phase2/SerialNumberInput';
import ImageUploader from './forms/phase2/ImageUploader';
import PriceCalculator from './forms/PriceCalculator';

// Define the exact type that CertificationInput expects
type CertificationType = {
  isGraded: boolean;
  service?: string;
  grade?: string;
  certNumber?: string;
};

export default function CreateAuctionForm() {
  // Basic Info
  const [metalType, setMetalType] = useState<'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other'>('Gold');
  const [formType, setFormType] = useState<'coin' | 'round' | 'bar' | 'jewelry' | 'other'>('coin');
  
  // Weight & Purity
  const [weight, setWeight] = useState<number>(1);
  const [weightUnit, setWeightUnit] = useState<'troy_oz' | 'grams' | 'ounces'>('troy_oz');
  const [purity, setPurity] = useState<number>(0.999);
  
  // Certification - Use the exact type
  const [certification, setCertification] = useState<CertificationType>({
    isGraded: false,
    service: undefined,
    grade: undefined,
    certNumber: undefined,
  });
  
  // Handler that matches CertificationInput's onChange type
  const handleCertificationChange = (cert: CertificationType) => {
    setCertification(cert);
  };
  
  // Details
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [images, setImages] = useState<any[]>([]);
  
  // Pricing
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [startingPrice, setStartingPrice] = useState<number>(0);
  const [buyNowPrice, setBuyNowPrice] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const auctionData = {
      metalType,
      formType,
      weight,
      weightUnit,
      purity,
      certification,
      serialNumber,
      images: images.length,
      estimatedValue,
      startingPrice,
      buyNowPrice,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('auction_draft', JSON.stringify(auctionData));
    
    console.log('Auction created:', auctionData);
    alert(`Auction created! Estimated value: $${estimatedValue.toFixed(2)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Precious Metals Auction</h1>
          <p className="text-gray-600 mt-2">List your gold, silver, platinum, or palladium for sale</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Info */}
          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">1. Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Metal Type</label>
                <MetalSelector value={metalType} onChange={setMetalType} />
              </div>
              <div>
                <FormTypeSelector value={formType} onChange={setFormType} />
              </div>
            </div>
          </section>

          {/* Step 2: Weight & Purity */}
          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">2. Weight & Purity</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <WeightInput
                  weight={weight}
                  unit={weightUnit}
                  onWeightChange={setWeight}
                  onUnitChange={setWeightUnit}
                />
              </div>
              <div>
                <PuritySelector metalType={metalType} value={purity} onChange={setPurity} />
              </div>
            </div>
          </section>

          {/* Step 3: Certification */}
          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">3. Certification & Grading</h2>
            <CertificationInput
              value={certification}
              onChange={handleCertificationChange}
            />
          </section>

          {/* Step 4: Details & Photos */}
          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">4. Details & Photos</h2>
            <div className="space-y-6">
              <div>
                <SerialNumberInput value={serialNumber} onChange={setSerialNumber} />
              </div>
              <div>
                <ImageUploader onImagesChange={setImages} />
              </div>
            </div>
          </section>

          {/* Step 5: Pricing */}
          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Set Your Price</h2>
            <PriceCalculator
              metalType={metalType}
              weight={weight}
              weightUnit={weightUnit}
              purity={purity}
              onPriceUpdate={setEstimatedValue}
            />
          </section>

          {/* Step 6: Auction Settings */}
          <section className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Auction Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Starting Price</label>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(parseFloat(e.target.value) || 0)}
                  min="10"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="Minimum 10 TEST"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buy Now Price (Optional)</label>
                <input
                  type="number"
                  value={buyNowPrice || ''}
                  onChange={(e) => setBuyNowPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={startingPrice + 1}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="Optional instant buy"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to List</h3>
                <p className="text-gray-600">Your item will be listed for auction</p>
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Auction Listing
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
