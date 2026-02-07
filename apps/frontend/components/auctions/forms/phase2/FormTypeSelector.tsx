'use client';

import * as React from 'react';

type FormType = 'coin' | 'round' | 'bar' | 'jewelry' | 'other';

interface FormTypeSelectorProps {
  value: FormType;
  onChange: (formType: FormType) => void;
}

const FORM_TYPES = [
  { id: 'coin', label: 'Coin(s)', icon: '🪙', description: 'Government minted' },
  { id: 'round', label: 'Round(s)', icon: '⭕', description: 'Private mint rounds' },
  { id: 'bar', label: 'Bar(s)', icon: '⬜', description: 'Bullion bars' },
  { id: 'jewelry', label: 'Jewelry', icon: '💎', description: 'Rings, chains, etc' },
  { id: 'other', label: 'Other', icon: '📦', description: 'Scrap, unique items' },
];

export default function FormTypeSelector({ value, onChange }: FormTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        What form is your item?
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {FORM_TYPES.map((form) => {
          const isSelected = value === form.id;
          const buttonClass = isSelected 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700';
          
          return (
            <button
              key={form.id}
              type="button"
              onClick={() => onChange(form.id as FormType)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-center ${buttonClass}`}
            >
              <span className="text-2xl mb-2">{form.icon}</span>
              <span className="font-medium text-sm mb-1">{form.label}</span>
              <span className="text-xs opacity-75">{form.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
