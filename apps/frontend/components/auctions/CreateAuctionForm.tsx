'use client';

import { useState } from 'react';
import ImageUpload from '@/components/common/ImageUpload';

type MetalType = 'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other';
type FormType = 'Coin' | 'Round' | 'Bar' | 'Jewelry' | 'Scrap' | 'Other';
type WeightUnit = 'troy_oz' | 'grams' | 'ounces';
type CurrencyType = 'USDC' | 'TEST' | 'XRP' | 'CORE';

export default function CreateAuctionForm() {
  // Form state
  const [itemType, setItemType] = useState<MetalType>('Gold');
  const [form, setForm] = useState<FormType>('Coin');
  const [purity, setPurity] = useState<number>(0.999);
  const [weight, setWeight] = useState<number>(1);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('troy_oz');
  const [itemName, setItemName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [startingPrice, setStartingPrice] = useState<number>(0);
  const [buyNowPrice, setBuyNowPrice] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState<CurrencyType>('TEST');
  const [auctionDuration, setAuctionDuration] = useState<number>(24);
  const [requiresShipping, setRequiresShipping] = useState<boolean>(true);
  const [location, setLocation] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [certification, setCertification] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form options
  const metalTypes: MetalType[] = ['Gold', 'Silver', 'Platinum', 'Palladium', 'Other'];
  const formTypes: FormType[] = ['Coin', 'Round', 'Bar', 'Jewelry', 'Scrap', 'Other'];
  const weightUnits = [
    { value: 'troy_oz' as WeightUnit, label: 'Troy Ounces' },
    { value: 'grams' as WeightUnit, label: 'Grams' },
    { value: 'ounces' as WeightUnit, label: 'Avoirdupois Ounces' }
  ];
  const currencies: CurrencyType[] = ['TEST', 'USDC', 'XRP', 'CORE'];
  const durationOptions = [
    { value: 1, label: '1 hour' },
    { value: 6, label: '6 hours' },
    { value: 24, label: '24 hours' },
    { value: 72, label: '3 days' },
    { value: 168, label: '7 days' }
  ];

  // Calculate weight in troy oz
  const getWeightInTroyOz = () => {
    switch (weightUnit) {
      case 'troy_oz': return weight;
      case 'grams': return weight / 31.1035;
      case 'ounces': return weight / 1.09714;
      default: return weight;
    }
  };

  // Estimated value
  const getEstimatedValue = () => {
    const weightInTroyOz = getWeightInTroyOz();
    const purityMultiplier = purity;
    
    const spotPrices: Record<MetalType, number> = {
      'Gold': 2100,
      'Silver': 24.5,
      'Platinum': 950,
      'Palladium': 1050,
      'Other': 0
    };
    
    return weightInTroyOz * purityMultiplier * spotPrices[itemType];
  };

  // Form validation
  const validateForm = () => {
    if (!itemName.trim()) {
      alert('Please enter an item name');
      return false;
    }
    if (weight <= 0) {
      alert('Please enter a valid weight');
      return false;
    }
    if (startingPrice <= 0) {
      alert('Please enter a starting price');
      return false;
    }
    if (buyNowPrice !== undefined && buyNowPrice <= startingPrice) {
      alert('Buy Now price must be higher than starting price');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const auctionData = {
        itemType,
        form,
        purity,
        weight,
        weightUnit,
        itemName,
        description,
        images,
        startingPrice,
        buyNowPrice,
        currency,
        auctionDuration,
        requiresShipping,
        location,
        serialNumber,
        certification,
        estimatedValue: getEstimatedValue(),
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage as draft
      localStorage.setItem('auction_draft', JSON.stringify(auctionData));
      
      console.log('Auction data:', auctionData);
      alert('Auction created successfully! (Mock for now)\n\nData saved as draft.');
      
      // Optionally clear form after successful submission
      // setItemName('');
      // setDescription('');
      // setImages([]);
      // etc...
      
    } catch (error) {
      console.error('Error creating auction:', error);
      alert('Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load draft from localStorage on component mount
  const loadDraft = () => {
    const draft = localStorage.getItem('auction_draft');
    if (draft) {
      if (confirm('Found a saved draft. Load it?')) {
        const parsed = JSON.parse(draft);
        setItemType(parsed.itemType || 'Gold');
        setForm(parsed.form || 'Coin');
        setPurity(parsed.purity || 0.999);
        setWeight(parsed.weight || 1);
        setWeightUnit(parsed.weightUnit || 'troy_oz');
        setItemName(parsed.itemName || '');
        setDescription(parsed.description || '');
        setImages(parsed.images || []);
        setStartingPrice(parsed.startingPrice || 0);
        setBuyNowPrice(parsed.buyNowPrice);
        setCurrency(parsed.currency || 'TEST');
        setAuctionDuration(parsed.auctionDuration || 24);
        setRequiresShipping(parsed.requiresShipping !== undefined ? parsed.requiresShipping : true);
        setLocation(parsed.location || '');
        setSerialNumber(parsed.serialNumber || '');
        setCertification(parsed.certification || '');
      }
    }
  };

  // Call loadDraft on component mount
  useState(() => {
    loadDraft();
  });

  return (
    <div className="create-auction-form">
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px 12px 0 0',
        position: 'relative'
      }}>
        <button
          type="button"
          onClick={loadDraft}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Load Draft
        </button>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Precious Metals Auction</h1>
        <p>List your gold, silver, platinum, or palladium for sale</p>
      </div>

      <form onSubmit={handleSubmit} style={{ 
        padding: '2rem',
        background: 'white',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Image Upload - Moved to top for better UX */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>1. Upload Photos</h2>
          <ImageUpload 
            onImagesChange={setImages}
            maxImages={5}
          />
        </div>

        {/* Metal Type Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>2. Select Metal Type</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {metalTypes.map((metal) => (
              <button
                key={metal}
                type="button"
                onClick={() => setItemType(metal)}
                style={{
                  padding: '1rem 1.5rem',
                  background: itemType === metal ? '#3b82f6' : '#f3f4f6',
                  color: itemType === metal ? 'white' : '#6B7280',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {metal}
              </button>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>3. Item Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Form Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Form</label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as FormType)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                {formTypes.map((formType) => (
                  <option key={formType} value={formType}>{formType}</option>
                ))}
              </select>
            </div>

            {/* Purity - Simplified for now */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Purity</label>
              <select
                value={purity}
                onChange={(e) => setPurity(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value={0.9999}>.9999 fine (Four Nines)</option>
                <option value={0.999}>.999 fine (Three Nines)</option>
                <option value={0.995}>.995 fine</option>
                <option value={0.925}>.925 sterling</option>
                <option value={0.900}>.900 coin silver</option>
              </select>
            </div>
          </div>

          {/* Weight Input */}
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="Enter weight"
                required
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {weightUnits.map((unit) => (
                  <button
                    key={unit.value}
                    type="button"
                    onClick={() => setWeightUnit(unit.value)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: weightUnit === unit.value ? '#3b82f6' : '#f3f4f6',
                      color: weightUnit === unit.value ? 'white' : '#6B7280',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {unit.label}
                  </button>
                ))}
              </div>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
              ≈ {getWeightInTroyOz().toFixed(4)} troy ounces
            </p>
          </div>

          {/* Item Name & Description */}
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Item Name *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                marginBottom: '1.5rem'
              }}
              placeholder="e.g., 2024 American Gold Eagle 1oz Coin"
              required
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              placeholder="Describe your item's condition, year, mint, special features..."
            />
          </div>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>4. Pricing</h2>
          
          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6B7280' }}>Estimated metal value:</span>
              <span style={{ fontWeight: 'bold' }}>${getEstimatedValue().toFixed(2)} USD</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              Based on current spot prices (Gold: $2100/oz, Silver: $24.5/oz, Platinum: $950/oz, Palladium: $1050/oz)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Starting Price */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Starting Price * (Minimum: 10 TEST)
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(parseFloat(e.target.value) || 0)}
                  min="10"
                  step="0.01"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px 0 0 6px',
                    fontSize: '1rem'
                  }}
                  placeholder="10.00"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderLeft: 'none',
                    borderRadius: '0 6px 6px 0',
                    fontSize: '1rem',
                    background: '#f9fafb'
                  }}
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buy Now Price (Optional) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Buy Now Price (Optional)
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={buyNowPrice || ''}
                  onChange={(e) => setBuyNowPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                  min={startingPrice + 1}
                  step="0.01"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px 0 0 6px',
                    fontSize: '1rem'
                  }}
                  placeholder="Optional instant buy price"
                />
                <div style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderLeft: 'none',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '1rem',
                  background: '#f9fafb',
                  color: '#6B7280'
                }}>
                  {currency}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auction Settings */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>5. Auction Settings</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Duration */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Auction Duration</label>
              <select
                value={auctionDuration}
                onChange={(e) => setAuctionDuration(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Shipping */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Shipping</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setRequiresShipping(true)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: requiresShipping ? '#3b82f6' : '#f3f4f6',
                    color: requiresShipping ? 'white' : '#6B7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Shipping Required
                </button>
                <button
                  type="button"
                  onClick={() => setRequiresShipping(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: !requiresShipping ? '#3b82f6' : '#f3f4f6',
                    color: !requiresShipping ? 'white' : '#6B7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Local Pickup Only
                </button>
              </div>
            </div>
          </div>

          {/* Location */}
          {requiresShipping && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ship From Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., United States"
              />
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>6. Additional Details (Optional)</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Serial Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., ABC123456"
              />
            </div>

            {/* Certification */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Certification</label>
              <input
                type="text"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., NGC MS70, PCGS PR69"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div>
            <button
              type="button"
              onClick={() => {
                const draftData = {
                  itemType, form, purity, weight, weightUnit, itemName, description,
                  images, startingPrice, buyNowPrice, currency, auctionDuration,
                  requiresShipping, location, serialNumber, certification
                };
                localStorage.setItem('auction_draft', JSON.stringify(draftData));
                alert('Draft saved!');
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                color: '#6B7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Save Draft
            </button>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Auction duration: </span>
              <span style={{ fontWeight: 'bold' }}>{auctionDuration} hours</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Creating Auction...' : 'Create Auction'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
