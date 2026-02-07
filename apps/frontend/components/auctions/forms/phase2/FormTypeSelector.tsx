'use client';

import { FormType, FormTypeData } from '@/components/auctions/types/phase2.types';

interface FormTypeSelectorProps {
  value: FormType;
  onChange: (formType: FormType) => void;
}

const FORM_TYPES: FormTypeData[] = [
  { id: 'coin', label: 'Coin(s)', icon: '🪙', description: 'Government minted coins' },
  { id: 'round', label: 'Round(s)', icon: '⭕', description: 'Private mint rounds' },
  { id: 'bar', label: 'Bar(s)', icon: '⬜', description: 'Bullion bars' },
  { id: 'jewelry', label: 'Jewelry', icon: '💎', description: 'Rings, chains, items' },
  { id: 'other', label: 'Other', icon: '📦', description: 'Scrap, unique items' },
];

export default function FormTypeSelector({ value, onChange }: FormTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        What form is your item?
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {FORM_TYPES.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={() => onChange(form.id)}
            className={\`
              flex flex-col items-center justify-center p-4 rounded-xl border-2
              transition-all duration-200 hover:scale-105 text-center
              \${value === form.id 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
              }
            \`}
          >
            <span className="text-2xl mb-2">{form.icon}</span>
            <span className="font-medium text-sm mb-1">{form.label}</span>
            <span className="text-xs opacity-75">{form.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
