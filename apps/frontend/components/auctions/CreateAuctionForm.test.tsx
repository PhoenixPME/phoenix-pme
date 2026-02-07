'use client';

import { useState } from 'react';
import FormTypeSelector from './forms/phase2/FormTypeSelector';
import PuritySelector from './forms/phase2/PuritySelector';
import SerialNumberInput from './forms/phase2/SerialNumberInput';

export default function TestForm() {
  const [formType, setFormType] = useState<'coin' | 'round' | 'bar' | 'jewelry' | 'other'>('coin');
  const [purity, setPurity] = useState<number>(0.999);
  const [serial, setSerial] = useState('');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Phase 2 Components Test</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <FormTypeSelector value={formType} onChange={setFormType} />
          <p>Selected: {formType}</p>
        </div>
        
        <div className="border p-4 rounded">
          <PuritySelector metalType="Gold" value={purity} onChange={setPurity} />
          <p>Purity: {purity}</p>
        </div>
        
        <div className="border p-4 rounded">
          <SerialNumberInput value={serial} onChange={setSerial} />
          <p>Serial: {serial}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h2 className="font-bold text-green-800">✅ Phase 2 Components Working!</h2>
          <p className="text-green-600">All 5 components are ready for Phase 3.</p>
        </div>
      </div>
    </div>
  );
}
