
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PetHealthData {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  lastScan: string;
  healthScore: number;
  weight: number;
  activityLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface ScanResult {
  id: string;
  timestamp: string;
  type: 'health' | 'object' | 'service';
  summary: string;
  details: string;
  imageUrl?: string;
}
