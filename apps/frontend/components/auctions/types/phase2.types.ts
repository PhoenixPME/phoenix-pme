export type FormType = 'coin' | 'round' | 'bar' | 'jewelry' | 'other';
export type GradingService = 'PCGS' | 'NGC' | 'ANACS' | 'ICG' | 'Other' | 'None';
export type PurityPreset = {
  value: number;
  label: string;
  description: string;
};

export interface FormTypeData {
  id: FormType;
  label: string;
  icon: string;
  description: string;
}

export interface GradingServiceData {
  id: GradingService;
  label: string;
  color: string;
}

export interface ImageData {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
}
