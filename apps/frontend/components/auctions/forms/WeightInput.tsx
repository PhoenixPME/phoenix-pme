'use client';

interface WeightInputProps {
  value: number;
  unit: 'troy_oz' | 'grams' | 'ounces';
  onChange: (value: number, unit: 'troy_oz' | 'grams' | 'ounces') => void;
}

const UNITS = [
  { value: 'troy_oz', label: 'Troy Ounces', symbol: 'oz t' },
  { value: 'grams', label: 'Grams', symbol: 'g' },
  { value: 'ounces', label: 'Avoirdupois Ounces', symbol: 'oz' },
];

export default function WeightInput({ value, unit, onChange }: WeightInputProps) {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue, unit);
  };

  const handleUnitChange = (newUnit: 'troy_oz' | 'grams' | 'ounces') => {
    onChange(value, newUnit);
  };

  const convertValue = (val: number, fromUnit: string, toUnit: string) => {
    // Convert to grams first
    let grams = val;
    switch (fromUnit) {
      case 'troy_oz': grams = val * 31.1035; break;
      case 'ounces': grams = val * 28.3495; break;
      // grams already
    }
    
    // Convert from grams to target unit
    switch (toUnit) {
      case 'troy_oz': return grams / 31.1035;
      case 'ounces': return grams / 28.3495;
      default: return grams;
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Weight
      </label>

      <div className="flex items-center space-x-3">
        <input
          type="number"
          value={value}
          onChange={handleValueChange}
          min="0"
          step="0.01"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter weight"
        />
        <div className="flex space-x-1">
          {UNITS.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => handleUnitChange(u.value as any)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                unit === u.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {u.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {UNITS.map((u) => (
          <div
            key={u.value}
            className={`p-3 rounded-lg text-center ${
              unit === u.value
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="text-sm text-gray-600">{u.label}</div>
            <div className="text-lg font-semibold mt-1">
              {convertValue(value, unit, u.value).toFixed(4)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{u.symbol}</div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium text-gray-700 mb-2">Common Weights</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 5, 10, 100].map((commonWeight) => (
            <button
              key={commonWeight}
              type="button"
              onClick={() => onChange(commonWeight, unit)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              {commonWeight} {unit === 'grams' ? 'g' : 'oz'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
