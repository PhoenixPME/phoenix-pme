'use client';

import { useState, useEffect } from 'react';

interface PriceCalculatorProps {
  metalType: string;
  weight: number;
  weightUnit: 'troy_oz' | 'grams' | 'ounces';
  purity: number;
  onPriceUpdate: (price: number) => void;
}

export default function PriceCalculator({
  metalType,
  weight,
  weightUnit,
  purity,
  onPriceUpdate,
}: PriceCalculatorProps) {
  const [spotPrice, setSpotPrice] = useState<number>(0);
  const [premiumPercent, setPremiumPercent] = useState<number>(5);
  const [isCollectible, setIsCollectible] = useState<boolean>(false);
  const [collectiblePremium, setCollectiblePremium] = useState<number>(0);

  // Suggested spot prices (reference only)
  const SUGGESTED_SPOT: Record<string, number> = {
    'Gold': 4966,
    'Silver': 77.69,
    'Platinum': 2099,
    'Palladium': 1682,
    'Other': 0
  };

  // Convert to troy oz
  const convertToTroyOz = (): number => {
    switch (weightUnit) {
      case 'troy_oz': return weight;
      case 'grams': return weight / 31.1035;
      case 'ounces': return weight / 1.09714;
      default: return weight;
    }
  };

  // Calculate all prices
  const calculatePrices = () => {
    const troyOz = convertToTroyOz();
    const pureMetalValue = troyOz * spotPrice;
    const actualMetalValue = pureMetalValue * purity;
    const premiumValue = actualMetalValue * (premiumPercent / 100);
    const collectibleValue = isCollectible ? 
      actualMetalValue * (collectiblePremium / 100) : 0;
    
    const totalValue = actualMetalValue + premiumValue + collectibleValue;
    
    return {
      pureMetalValue,
      actualMetalValue,
      premiumValue,
      collectibleValue,
      totalValue
    };
  };

  // Use useEffect to update parent only when values change
  useEffect(() => {
    const prices = calculatePrices();
    if (onPriceUpdate) {
      onPriceUpdate(prices.totalValue);
    }
  }, [spotPrice, premiumPercent, isCollectible, collectiblePremium, weight, weightUnit, purity, onPriceUpdate]);

  const prices = calculatePrices();
  const troyOz = convertToTroyOz();

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-gray-900">Pricing Calculator</h3>
      
      {/* Spot Price Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spot Price (per troy ounce)
          <span className="ml-2 text-sm text-gray-500">
            Current market: ${SUGGESTED_SPOT[metalType]?.toLocaleString()}
          </span>
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="number"
              value={spotPrice || ''}
              onChange={(e) => setSpotPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current spot price"
            />
          </div>
          <button
            type="button"
            onClick={() => setSpotPrice(SUGGESTED_SPOT[metalType] || 0)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Use Suggested
          </button>
        </div>
      </div>

      {/* Premium Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Market Premium: <span className="text-blue-600">{premiumPercent}%</span>
          </label>
          <span className="text-sm text-gray-500">
            {premiumPercent >= 0 ? '+' : ''}{premiumPercent}%
          </span>
        </div>
        <input
          type="range"
          min="-20"
          max="100"
          step="1"
          value={premiumPercent}
          onChange={(e) => setPremiumPercent(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-20% (Below spot)</span>
          <span>0% (At spot)</span>
          <span>+100% (High premium)</span>
        </div>
      </div>

      {/* Collectible Toggle */}
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="collectible"
            checked={isCollectible}
            onChange={(e) => setIsCollectible(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="collectible" className="ml-2 text-sm font-medium text-gray-700">
            Collector/Numismatic Item
          </label>
        </div>
        
        {isCollectible && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Collector Premium: <span className="text-green-600">{collectiblePremium}%</span>
              </label>
              <span className="text-sm text-gray-500">
                +{collectiblePremium}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={collectiblePremium}
              onChange={(e) => setCollectiblePremium(parseInt(e.target.value))}
              className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (Bullion)</span>
              <span>100% (Collectible)</span>
              <span>500% (Rare)</span>
            </div>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Pure metal value:</span>
            <span className="font-medium">${prices.pureMetalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Purity adjustment ({purity * 100}%):</span>
            <span className="font-medium">${prices.actualMetalValue.toFixed(2)}</span>
          </div>
          {premiumPercent !== 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Market premium ({premiumPercent}%):</span>
              <span className={`font-medium ${premiumPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {premiumPercent > 0 ? '+' : ''}${prices.premiumValue.toFixed(2)}
              </span>
            </div>
          )}
          {isCollectible && collectiblePremium > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Collector premium ({collectiblePremium}%):</span>
              <span className="font-medium text-green-600">
                +${prices.collectibleValue.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Estimated Value:</span>
              <span className="font-bold text-lg text-blue-600">
                ${prices.totalValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <div>Based on: {troyOz.toFixed(4)} troy oz × ${spotPrice}/oz × {purity} purity</div>
        </div>
      </div>

      {/* Fair Pricing Guide */}
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
        <div className="flex items-start">
          <span className="text-blue-500 mr-2">💡</span>
          <div>
            <h5 className="text-sm font-semibold text-blue-800">Fair Pricing Guide</h5>
            <ul className="mt-1 text-xs text-blue-700 space-y-1">
              <li>• <strong>Bullion bars:</strong> Typically +2% to +8% over spot</li>
              <li>• <strong>Government coins:</strong> +5% to +15% (American Eagles, etc.)</li>
              <li>• <strong>Rounds/Generic:</strong> +3% to +10% over spot</li>
              <li>• <strong>Premiums above +50%</strong> may require justification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
