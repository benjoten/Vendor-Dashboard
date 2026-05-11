import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return String(date);
  }
}

export function isExpired(validityDate: string | number): boolean {
  if (!validityDate) return false;
  
  try {
    let dateObj: Date;
    
    // Check if it's a numeric Excel serial date
    if (typeof validityDate === 'number' || (typeof validityDate === 'string' && !isNaN(Number(validityDate)) && validityDate.length <= 6)) {
      const serial = Number(validityDate);
      // Excel serial date 1 is Jan 1, 1900. Unix 0 is Jan 1, 1970 (Excel 25569)
      const excelEpoch = new Date(1899, 11, 30);
      dateObj = new Date(excelEpoch.getTime() + (serial * 86400000));
    } else {
      dateObj = new Date(validityDate);
    }
    
    if (isNaN(dateObj.getTime())) return false;
    
    const now = new Date();
    const validityMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return validityMidnight < nowMidnight;
  } catch (e) {
    return false;
  }
}

/**
 * Standardizes variety of date formats into ISO strings for consistent storage
 */
export function formatExcelDate(value: any): string {
  if (!value) return '';
  
  try {
    let dateObj: Date;
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && value.length <= 6)) {
      const serial = Number(value);
      const excelEpoch = new Date(1899, 11, 30);
      dateObj = new Date(excelEpoch.getTime() + (serial * 86400000));
    } else {
      dateObj = new Date(value);
    }
    
    if (isNaN(dateObj.getTime())) return String(value);
    return dateObj.toISOString();
  } catch (e) {
    return String(value);
  }
}

export function isMSE(vendor: { industry: string; vendorType: string }): boolean {
  const indus = (vendor.industry || '').toUpperCase();
  const type = (vendor.vendorType || '').toUpperCase();
  // Check for Manufacturer in Vendor Type and MICO or SMLL in Industry
  const isManufacturer = type.includes('MANUFACTURER');
  const isMSEIndicator = indus.includes('MICO') || indus.includes('SMLL');
  return isManufacturer && isMSEIndicator;
}
