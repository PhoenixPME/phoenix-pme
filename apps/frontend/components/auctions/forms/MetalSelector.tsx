'use client';

interface MetalSelectorProps {
  value: 'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other';
  onChange: (metal: 'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other') => void;
}

const METAL_OPTIONS = [
  { id: 'gold', label: 'Gold', color: '#FFD700', icon: '🪙' },
  { id: 'silver', label: 'Silver', color: '#C0C0C0', icon: '🥈' },
  { id: 'platinum', label: 'Platinum', color: '#E5E4E2', icon: '⚪' },
  { id: 'palladium', label: 'Palladium', color: '#B4B4B4', icon: '⚫' },
  { id: 'other', label: 'Other', color: '#6B7280', icon: '💎' },
];

export default function MetalSelector({ value, onChange }: MetalSelectorProps) {
  return (
    <div className="metal-selector">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Metal Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {METAL_OPTIONS.map((metal) => (
          <button
            key={metal.id}
            type="button"
            onClick={() => onChange(metal.label as any)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg border-2
              transition-all duration-200 hover:scale-105
              ${value === metal.label 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
              }
            `}
          >
            <span className="text-2xl mb-2">{metal.icon}</span>
            <span className="font-medium text-sm">{metal.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
