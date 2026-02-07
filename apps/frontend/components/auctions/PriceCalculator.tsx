'use client';

import { useState } from 'react';

type MetalType = 'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other';

interface PriceCalculatorProps {
  metalType: MetalType;
  weight: number;
  weightUnit: 'troy_oz' | 'grams' | 'ounces';
  purity: number;
  onPriceCalculated: (price: number) => void;
}

// Suggested spot prices (reference only)
const SUGGESTED_PRICES: Record<MetalType, number> = {
  'Gold': 4966,
  'Silver': 77.69,
  'Platinum': 2099,
  'Palladium': 1682,
  'Other': 0
};

export default function PriceCalculator({
  metalType,
  weight,
  weightUnit,
  purity,
  onPriceCalculated
}: PriceCalculatorProps) {
  const [spotPrice, setSpotPrice] = useState<number>(SUGGESTED_PRICES[metalType]);
  const [premiumPercent, setPremiumPercent] = useState<number>(0);
  const [isNumismatic, setIsNumismatic] = useState<boolean>(false);
  const [numismaticPremium, setNumismaticPremium] = useState<number>(0);

  // Convert weight to troy ounces
  const getWeightInTroyOz = () => {
    switch (weightUnit) {
      case 'troy_oz': return weight;
      case 'grams': return weight / 31.1035;
      case 'ounces': return weight / 1.09714;
      default: return weight;
    }
  };

  // Calculate total price
  const calculatePrice = () => {
    const weightInTroyOz = getWeightInTroyOz();
    const metalValue = weightInTroyOz * purity * spotPrice;
    const premiumValue = metalValue * (premiumPercent / 100);
    const numismaticValue = isNumismatic ? metalValue * (numismaticPremium / 100) : 0;
    
    const total = metalValue + premiumValue + numismaticValue;
    onPriceCalculated(total);
    return total;
  };

  const totalPrice = calculatePrice();
  const weightInTroyOz = getWeightInTroyOz();

  return (
    <div style={{ 
      background: '#f8fafc', 
      padding: '1.5rem', 
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
        Price Calculator
      </h3>

      {/* Spot Price Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Spot Price (per troy ounce)
          <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
            Current market: ${SUGGESTED_PRICES[metalType].toLocaleString()}
          </span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="number"
            value={spotPrice}
            onChange={(e) => setSpotPrice(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
          <button
            type="button"
            onClick={() => setSpotPrice(SUGGESTED_PRICES[metalType])}
            style={{
              padding: '0.75rem 1rem',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Use Suggested
          </button>
        </div>
      </div>

      {/* Premium Slider */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Premium/Discount: {premiumPercent >= 0 ? '+' : ''}{premiumPercent.toFixed(1)}%
        </label>
        <input
          type="range"
          min="-20"
          max="50"
          step="0.5"
          value={premiumPercent}
          onChange={(e) => setPremiumPercent(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280' }}>
          <span>-20% (Below spot)</span>
          <span>0% (At spot)</span>
          <span>+50% (Premium)</span>
        </div>
      </div>

      {/* Numismatic Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="checkbox"
            id="numismatic"
            checked={isNumismatic}
            onChange={(e) => setIsNumismatic(e.target.checked)}
          />
          <label htmlFor="numismatic" style={{ fontWeight: '500' }}>
            Numismatic/Collector Item
          </label>
        </div>
        
        {isNumismatic && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Collector Premium: +{numismaticPremium}%
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={numismaticPremium}
              onChange={(e) => setNumismaticPremium(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280' }}>
              <span>0% (Bullion)</span>
              <span>100% (Collectible)</span>
              <span>500% (Rare)</span>
            </div>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div style={{ 
        background: 'white', 
        padding: '1rem', 
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        marginTop: '1rem'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Price Breakdown
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Metal value:</span>
          <span>${(weightInTroyOz * purity * spotPrice).toFixed(2)}</span>
        </div>
        
        {premiumPercent !== 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span>Premium/Discount ({premiumPercent > 0 ? '+' : ''}{premiumPercent.toFixed(1)}%):</span>
            <span style={{ color: premiumPercent > 0 ? '#059669' : '#dc2626' }}>
              {premiumPercent > 0 ? '+' : ''}${(weightInTroyOz * purity * spotPrice * premiumPercent / 100).toFixed(2)}
            </span>
          </div>
        )}
        
        {isNumismatic && numismaticPremium > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span>Collector premium (+{numismaticPremium}%):</span>
            <span style={{ color: '#059669' }}>
              +${(weightInTroyOz * purity * spotPrice * numismaticPremium / 100).toFixed(2)}
            </span>
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontWeight: 'bold',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '0.5rem',
          marginTop: '0.5rem'
        }}>
          <span>Total Estimated Value:</span>
          <span style={{ color: '#1d4ed8', fontSize: '1.1rem' }}>
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          Based on: {weight.toFixed(2)} {weightUnit} ({weightInTroyOz.toFixed(4)} troy oz) × ${spotPrice}/oz × {purity} purity
        </div>
      </div>

      {/* Fair Pricing Guidelines */}
      <div style={{ 
        background: '#f0f9ff', 
        padding: '0.75rem', 
        borderRadius: '6px',
        marginTop: '1rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>
          🎯 Fair Pricing Guidelines:
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#0369a1' }}>
          <li><strong>Bullion:</strong> Typically +3% to +10% over spot</li>
          <li><strong>Coins/Rounds:</strong> +5% to +15% depending on mint</li>
          <li><strong>Bars:</strong> +2% to +8% for larger sizes</li>
          <li><strong>Extreme premiums (&gt;+100%) may reduce buyer interest</strong></li>
        </ul>
      </div>
    </div>
  );
}
