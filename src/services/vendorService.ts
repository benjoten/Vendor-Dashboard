import { Vendor, DashboardStats } from '../types';
import { isExpired, isMSE } from '../lib/utils';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  writeBatch, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const VENDORS_COLLECTION = 'vendors';

export const vendorService = {
  subscribeToVendors: (onUpdate: (vendors: Vendor[]) => void) => {
    const q = query(collection(db, VENDORS_COLLECTION), orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const vendors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[];
      onUpdate(vendors);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, VENDORS_COLLECTION);
    });
  },

  processExcelData: async (newData: Partial<Vendor>[]): Promise<{ added: number; updated: number; skipped: number }> => {
    try {
      // Get existing vendors for deduplication
      const snapshot = await getDocs(collection(db, VENDORS_COLLECTION));
      const existingMap = new Map<string, Vendor>();
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Vendor;
        existingMap.set(data.vendorCode, { ...data, id: doc.id });
      });

      let added = 0;
      let updated = 0;
      let skipped = 0;

      // Firestore batches are limited to 500 operations
      const batchLimit = 450;
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      for (const newItem of newData) {
        if (!newItem.vendorCode) continue;

        const existing = existingMap.get(newItem.vendorCode);
        const docRef = existing?.id ? doc(db, VENDORS_COLLECTION, existing.id) : doc(collection(db, VENDORS_COLLECTION));

        if (existing) {
          const isDifferent = Object.keys(newItem).some(key => {
            if (key === 'updatedAt' || key === 'id') return false;
            return String((newItem as any)[key]) !== String((existing as any)[key]);
          });

          if (isDifferent) {
            currentBatch.set(docRef, {
              ...existing,
              ...newItem,
              updatedAt: Date.now() // Using numeric timestamp for consistency with prior types, though serverTimestamp is better
            }, { merge: true });
            updated++;
            operationCount++;
          } else {
            skipped++;
          }
        } else {
          currentBatch.set(docRef, {
            ...newItem,
            updatedAt: Date.now()
          });
          added++;
          operationCount++;
        }

        if (operationCount >= batchLimit) {
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await currentBatch.commit();
      }

      return { added, updated, skipped };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, VENDORS_COLLECTION);
      return { added: 0, updated: 0, skipped: 0 };
    }
  },

  getStats: (vendors: Vendor[]): DashboardStats => {
    const totalVendors = vendors.length;
    let validVendors = 0;
    let expiredVendors = 0;
    let manufacturers = 0;
    let traders = 0;
    let mseManufacturers = 0;
    let womenMSE = 0;
    let scstMSE = 0;

    vendors.forEach(v => {
      if (isExpired(v.validityDate)) {
        expiredVendors++;
      } else {
        validVendors++;
      }

      const type = (v.vendorType || '').toLowerCase();
      if (type.includes('manufacturer')) manufacturers++;
      if (type.includes('trader')) traders++;

      if (isMSE(v)) {
        mseManufacturers++;
        
        // Sex 2 = Woman
        if (v.sex === '2') {
          womenMSE++;
        }

        // SC & ST check in Minority Indicator
        const minority = (v.minorityIndic || '').toUpperCase();
        if (minority.includes('SC') || minority.includes('ST')) {
          scstMSE++;
        }
      }
    });

    return {
      totalVendors,
      validVendors,
      expiredVendors,
      manufacturers,
      traders,
      mseManufacturers,
      womenMSE,
      scstMSE
    };
  },

  searchVendors: (vendors: Vendor[], queryText: string): Vendor[] => {
    if (!queryText.trim()) return vendors;
    const q = queryText.toLowerCase().trim();
    
    const filtered = vendors.filter(v => 
      (v.vendorCode || '').toLowerCase().includes(q) ||
      (v.name1 || '').toLowerCase().includes(q) ||
      (v.name2 || '').toLowerCase().includes(q) ||
      (v.searchTerm || '').toLowerCase().includes(q)
    );

    return filtered.sort((a, b) => {
      const aStarts = (a.name1 || '').toLowerCase().startsWith(q) || 
                      (a.searchTerm || '').toLowerCase().startsWith(q) ||
                      (a.vendorCode || '').toLowerCase().startsWith(q);
                      
      const bStarts = (b.name1 || '').toLowerCase().startsWith(q) || 
                      (b.searchTerm || '').toLowerCase().startsWith(q) ||
                      (b.vendorCode || '').toLowerCase().startsWith(q);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return (a.name1 || '').localeCompare(b.name1 || '');
    });
  }
};
