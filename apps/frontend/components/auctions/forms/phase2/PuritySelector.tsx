'use client';

import { PurityPreset } from '@/components/auctions/types/phase2.types';

interface PuritySelectorProps {
  metalType: 'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other';
  value: number;
  onChange: (purity: number) => void;
}

const PURITY_PRESETS: Record<string, PurityPreset[]> = {
  Gold: [
    { value: 0.9999, label: '.9999', description: 'Four Nines Fine' },
    { value: 0.999, label: '.999', description: 'Three Nines Fine' },
    { value: 0.995, label: '.995', description: 'Canadian Gold' },
    { value: 0.9167, label: '.9167', description: '22 Karat' },
    { value: 0.75, label: '.750', description: '18 Karat' },
    { value: 0.585, label: '.585', description: '14 Karat' },
    { value: 0.417, label: '.417', description: '10 Karat' },
  ],
  Silver: [
    { value: 0.9999, label: '.9999', description: 'Four Nines Fine' },
    { value: 0.999, label: '.999', description: 'Three Nines Fine' },
    { value: 0.958, label: '.958', description: 'Britannia Silver' },
    { value: 0.925, label: '.925', description: 'Sterling Silver' },
    { value: 0.900, label: '.900', description: 'Coin Silver' },
    { value: 0.835, label: '.835', description: 'European Silver' },
    { value: 0.800, label: '.800', description: 'Silver' },
  ],
  Platinum: [
    { value: 0.9995, label: '.9995', description: 'Fine' },
    { value: 0.999, label: '.999', description: 'Fine' },
    { value: 0.95, label: '.950', description: 'Platinum' },
  ],
  Palladium: [
    { value: 0.9995, label: '.9995', description: 'Fine' },
    { value: 0.999, label: '.999', description: 'Fine' },
  ],
  Other: [
    { value: 1, label: '1.000', description: 'Pure' },
    { value: 0.999, label: '.999', description: 'High Purity' },
    { value: 0.95, label: '.950', description: 'Commercial' },
  ],
};

export default function PuritySelector({ metalType, value, onChange }: PuritySelectorProps) {
  const presets = PURITY_PRESETS[metalType] || PURITY_PRESETS.Other;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Metal Purity / Fineness
      </label>
      
      {/* Preset buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={\`
              p-3 rounded-lg border-2 text-center transition-all duration-200
              \${Math.abs(value - preset.value) < 0.0001
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
              }
            \`}
          >
            <div className="font-bold text-lg">{preset.label}</div>
            <div className="text-xs mt-1 opacity-75">{preset.description}</div>
          </button>
        ))}
      </div>
      
      {/* Custom input */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Purity (0.000 - 1.000)
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            min="0"
            max="1"
            step="0.0001"
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 1) {
                onChange(val);
              }
            }}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="0.000 - 1.000"
          />
          <div className="text-gray-600">
            <span className="font-medium">{(value * 100).toFixed(2)}%</span>
            <span className="text-sm ml-2">pure</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Pure metal = 1.000, 90% pure = 0.900, 14K gold = 0.585
        </p>
      </div>
    </div>
  );
}
