export type MetalType = 'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other';
export type WeightUnit = 'troy_oz' | 'grams' | 'ounces';
export type FormType = 'coin' | 'round' | 'bar' | 'jewelry' | 'other';

export interface MetalPrice {
  metal: MetalType;
  pricePerTroyOz: number;
  lastUpdated: Date;
}

export interface WeightConversion {
  from: WeightUnit;
  to: WeightUnit;
  factor: number;
}

// Conversion factors TO troy ounces
const CONVERSION_FACTORS: Record<WeightUnit, number> = {
  troy_oz: 1,
  grams: 31.1035,
  ounces: 1.09714,
};

/**
 * Convert weight between units
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  
  // Convert to troy ounces first, then to target unit
  const valueInTroyOz = value / CONVERSION_FACTORS[from];
  return valueInTroyOz * CONVERSION_FACTORS[to];
}

/**
 * Calculate pure metal value
 */
export function calculateMetalValue(
  metalType: MetalType,
  weight: number,
  weightUnit: WeightUnit,
  purity: number,
  spotPrice: number
): number {
  const weightInTroyOz = weight / CONVERSION_FACTORS[weightUnit];
  const pureWeight = weightInTroyOz * purity;
  return pureWeight * spotPrice;
}

/**
 * Get metal color
 */
export function getMetalColor(metal: MetalType): string {
  const colors: Record<MetalType, string> = {
    Gold: '#FFD700',
    Silver: '#C0C0C0',
    Platinum: '#E5E4E2',
    Palladium: '#B4B4B4',
    Other: '#6B7280',
  };
  return colors[metal];
}

/**
 * Get metal icon
 */
export function getMetalIcon(metal: MetalType): string {
  const icons: Record<MetalType, string> = {
    Gold: '🪙',
    Silver: '🥈',
    Platinum: '⚪',
    Palladium: '⚫',
    Other: '💎',
  };
  return icons[metal];
}

/**
 * Get purity options for metal type
 */
export function getPurityOptions(metal: MetalType): Array<{value: number, label: string}> {
  const options: Record<MetalType, Array<{value: number, label: string}>> = {
    Gold: [
      { value: 0.9999, label: '.9999 Fine' },
      { value: 0.999, label: '.999 Fine' },
      { value: 0.995, label: '.995 Fine' },
      { value: 0.9167, label: '.9167 (22k)' },
      { value: 0.75, label: '.750 (18k)' },
      { value: 0.585, label: '.585 (14k)' },
      { value: 0.417, label: '.417 (10k)' },
    ],
    Silver: [
      { value: 0.9999, label: '.9999 Fine' },
      { value: 0.999, label: '.999 Fine' },
      { value: 0.958, label: '.958 Britannia' },
      { value: 0.925, label: '.925 Sterling' },
      { value: 0.900, label: '.900 Coin' },
      { value: 0.835, label: '.835 European' },
      { value: 0.800, label: '.800' },
    ],
    Platinum: [
      { value: 0.9995, label: '.9995 Fine' },
      { value: 0.999, label: '.999 Fine' },
      { value: 0.95, label: '.950' },
    ],
    Palladium: [
      { value: 0.9995, label: '.9995 Fine' },
      { value: 0.999, label: '.999 Fine' },
      { value: 0.95, label: '.950' },
    ],
    Other: [
      { value: 1, label: 'Pure' },
      { value: 0.999, label: '.999' },
      { value: 0.95, label: '.950' },
    ],
  };
  
  return options[metal];
}

/**
 * Get common weight units with conversions
 */
export function getWeightUnits(): Array<{unit: WeightUnit, label: string, conversionToTroyOz: number}> {
  return [
    { unit: 'troy_oz', label: 'Troy Ounces', conversionToTroyOz: 1 },
    { unit: 'grams', label: 'Grams', conversionToTroyOz: 31.1035 },
    { unit: 'ounces', label: 'Avoirdupois Ounces', conversionToTroyOz: 1.09714 },
  ];
}
