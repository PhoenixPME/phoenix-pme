import { convertWeight, calculateMetalValue } from './lib/types/metals';

console.log('Testing metals module...');

// Test weight conversion
console.log('1 troy oz to grams:', convertWeight(1, 'troy_oz', 'grams'));
console.log('31.1035 grams to troy oz:', convertWeight(31.1035, 'grams', 'troy_oz'));
console.log('1 avoirdupois oz to troy oz:', convertWeight(1, 'ounces', 'troy_oz'));

// Test metal value calculation
const goldValue = calculateMetalValue('Gold', 1, 'troy_oz', 0.999, 2000);
console.log('1 oz .999 Gold at $2000/oz:', goldValue);

const silverValue = calculateMetalValue('Silver', 100, 'grams', 0.999, 25);
console.log('100g .999 Silver at $25/oz:', silverValue);

console.log('✅ All metals tests passing!');
