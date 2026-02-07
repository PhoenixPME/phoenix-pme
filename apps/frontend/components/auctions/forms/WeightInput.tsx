'use client';

import * as React from 'react';

interface WeightInputProps {
  weight: number;
  unit: 'troy_oz' | 'grams' | 'ounces';
  onWeightChange: (weight: number) => void;
  onUnitChange: (unit: 'troy_oz' | 'grams' | 'ounces') => void;
}

const UNIT_OPTIONS: Array<{value: 'troy_oz' | 'grams' | 'ounces', label: string, abbreviation: string}> = [
  { value: 'troy_oz', label: 'Troy Ounces', abbreviation: 'ozt' },
  { value: 'grams', label: 'Grams', abbreviation: 'g' },
  { value: 'ounces', label: 'Avoirdupois Ounces', abbreviation: 'oz' },
];

export default function WeightInput({ 
  weight, 
  unit, 
  onWeightChange, 
  onUnitChange 
}: WeightInputProps) {
  
  const handleUnitChange = (newUnit: 'troy_oz' | 'grams' | 'ounces') => {
    onUnitChange(newUnit);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Weight
        </label>
        <div className="flex space-x-3">
          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter weight"
          />
          <div className="flex space-x-1">
            {UNIT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleUnitChange(option.value)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md
                  ${unit === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {option.abbreviation}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <div className="text-sm text-gray-600">
          <div className="mb-1">Common conversions:</div>
          <div className="text-xs text-gray-500">
            1 troy oz = 31.1035 grams = 1.09714 avoirdupois ounces
          </div>
        </div>
      </div>
    </div>
  );
}
