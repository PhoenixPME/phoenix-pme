'use client';

interface FormTypeSelectorProps {
  value: 'coin' | 'round' | 'bar' | 'jewelry' | 'other';
  onChange: (form: 'coin' | 'round' | 'bar' | 'jewelry' | 'other') => void;
}

const FORM_TYPES = [
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
        Item Form
      </label>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {FORM_TYPES.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={() => onChange(form.id as any)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2
              transition-all duration-200 hover:scale-105 text-center
              ${value === form.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
          >
            <span className="text-2xl mb-2">{form.icon}</span>
            <span className="font-medium text-sm mb-1">{form.label}</span>
            <span className="text-xs text-gray-500">{form.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
