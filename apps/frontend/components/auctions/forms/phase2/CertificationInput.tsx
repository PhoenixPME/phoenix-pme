'use client';

import * as React from 'react';

export type CertificationType = {
  isGraded: boolean;
  service?: string;
  grade?: string;
  certNumber?: string;
};

interface CertificationInputProps {
  value: CertificationType;
  onChange: (cert: CertificationType) => void;
}

const GRADING_SERVICES = [
  { id: 'NGC', label: 'NGC', color: 'bg-blue-100 text-blue-800' },
  { id: 'PCGS', label: 'PCGS', color: 'bg-green-100 text-green-800' },
  { id: 'ANACS', label: 'ANACS', color: 'bg-purple-100 text-purple-800' },
  { id: 'ICG', label: 'ICG', color: 'bg-orange-100 text-orange-800' },
  { id: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
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
  
  return (
    <div className="space-y-6">
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
          <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${isGraded ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isGraded ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </button>
      </div>

      {isGraded && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grading Service
            </label>
            <div className="flex flex-wrap gap-2">
              {GRADING_SERVICES.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => onChange({ ...value, service: srv.id })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${service === srv.id ? `${srv.color} border-2 border-blue-500` : 'bg-white border border-gray-300 text-gray-700'}`}
                >
                  {srv.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <input
              type="text"
              value={grade || ''}
              onChange={(e) => onChange({ ...value, grade: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter grade (e.g., MS 65)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Number
            </label>
            <input
              type="text"
              value={certNumber || ''}
              onChange={(e) => onChange({ ...value, certNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 1234567-123"
            />
          </div>
        </div>
      )}

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
