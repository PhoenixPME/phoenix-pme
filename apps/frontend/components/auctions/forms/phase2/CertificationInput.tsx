'use client';

import { GradingService, GradingServiceData } from '@/components/auctions/types/phase2.types';
import { useState } from 'react';

interface CertificationInputProps {
  value: {
    isGraded: boolean;
    service?: GradingService;
    grade?: string;
    certNumber?: string;
  };
  onChange: (cert: {
    isGraded: boolean;
    service?: GradingService;
    grade?: string;
    certNumber?: string;
  }) => void;
}

const GRADING_SERVICES: GradingServiceData[] = [
  { id: 'NGC', label: 'NGC', color: 'bg-blue-100 text-blue-800' },
  { id: 'PCGS', label: 'PCGS', color: 'bg-green-100 text-green-800' },
  { id: 'ANACS', label: 'ANACS', color: 'bg-purple-100 text-purple-800' },
  { id: 'ICG', label: 'ICG', color: 'bg-orange-100 text-orange-800' },
  { id: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

const GRADE_PRESETS = [
  'MS/PF 70', 'MS/PF 69', 'MS/PF 68', 'MS/PF 67', 'MS/PF 66', 'MS/PF 65',
  'MS/PF 64', 'MS/PF 63', 'MS/PF 62', 'MS/PF 61', 'MS/PF 60',
  'AU 58', 'AU 55', 'AU 53', 'AU 50',
  'XF 45', 'XF 40',
  'VG 30', 'VG 25', 'VG 20',
  'G 12', 'G 10', 'G 8', 'G 6', 'G 4',
];

export default function CertificationInput({ value, onChange }: CertificationInputProps) {
  const { isGraded, service, grade, certNumber } = value;
  
  const toggleGraded = () => {
    onChange({
      isGraded: !isGraded,
      service: !isGraded ? 'NGC' : undefined,
      grade: !isGraded ? 'MS 70' : undefined,
      certNumber: !isGraded ? '' : undefined,
    });
  };
  
  const updateField = (field: string, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Certification</h3>
          <p className="text-sm text-gray-600">Professional grading details</p>
        </div>
        <button
          type="button"
          onClick={toggleGraded}
          className="flex items-center space-x-2"
        >
          <span className="text-sm font-medium text-gray-700">
            {isGraded ? 'Certified' : 'Not Certified'}
          </span>
          <div className={\`
            relative inline-flex h-6 w-11 items-center rounded-full
            \${isGraded ? 'bg-blue-600' : 'bg-gray-200'}
          \`}>
            <span className={\`
              inline-block h-4 w-4 transform rounded-full bg-white transition
              \${isGraded ? 'translate-x-6' : 'translate-x-1'}
            \`} />
          </div>
        </button>
      </div>

      {/* Certification Form */}
      {isGraded && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grading Service
            </label>
            <div className="flex flex-wrap gap-2">
              {GRADING_SERVICES.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => updateField('service', srv.id)}
                  className={\`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    \${service === srv.id
                      ? \`\${srv.color} border-2 border-blue-500\`
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  \`}
                >
                  {srv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-1 mb-3">
              {GRADE_PRESETS.slice(0, 12).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('grade', g)}
                  className={\`
                    px-2 py-1 text-xs rounded
                    \${grade === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  \`}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={grade || ''}
              onChange={(e) => updateField('grade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter grade (e.g., MS 65)"
            />
          </div>

          {/* Certificate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Number
            </label>
            <input
              type="text"
              value={certNumber || ''}
              onChange={(e) => updateField('certNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 1234567-123"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-1">Value Impact Guide</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>MS/PR 70:</strong> Perfect specimen, highest premium</li>
              <li>• <strong>MS/PR 65-69:</strong> Gem quality, significant premium</li>
              <li>• <strong>MS/PR 60-64:</strong> Uncirculated, moderate premium</li>
              <li>• <strong>AU 50-58:</strong> About uncirculated, small premium</li>
            </ul>
          </div>
        </div>
      )}

      {/* Not Graded State */}
      {!isGraded && (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-400 text-3xl mb-2">📦</div>
          <h4 className="font-medium text-gray-700 mb-1">Raw / Un-graded</h4>
          <p className="text-sm text-gray-500">
            This item will be listed as bullion with melt value pricing
          </p>
        </div>
      )}
    </div>
  );
}
