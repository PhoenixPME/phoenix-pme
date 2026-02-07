'use client';
import * as React from 'react';

interface SerialNumberInputProps {
  value: string;
  onChange: (serial: string) => void;
}

const COMMON_EXAMPLES = [
  '123456', 'JM Bullion', 'APMEX', 'PAMP Suisse',
  'Engelhard', 'Johnson Matthey', 'Credit Suisse',
];

export default function SerialNumberInput({
  value,
  onChange,
}: SerialNumberInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Serial Number / Mint Mark
          <span className="ml-1 text-gray-500 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter serial number or mint mark"
        />
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Common Examples:
        </h4>
        <div className="flex flex-wrap gap-2">
          {COMMON_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onChange(example)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
