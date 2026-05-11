import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { userService } from '../services/userService';
import { Vendor, AuthorizedUser } from '../types';
import { cn, formatExcelDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (rows.length < 1) {
            throw new Error("The Excel file appears to be empty.");
          }

          const dataRows = rows.slice(1);
          
          const vendors: Partial<Vendor>[] = dataRows.map(row => ({
            pOrg: String(row[0] || ''),
            d: String(row[1] || ''),
            vendorCode: String(row[2] || ''),
            searchTerm: String(row[3] || ''),
            name1: String(row[4] || ''),
            name2: String(row[5] || ''),
            street: String(row[6] || ''),
            postalCode: String(row[7] || ''),
            city: String(row[8] || ''),
            cty: String(row[9] || ''),
            rg: String(row[10] || ''),
            bankKey: String(row[11] || ''),
            bankAccount: String(row[12] || ''),
            taxNumber3: String(row[13] || ''),
            pan: String(row[14] || ''),
            industry: String(row[15] || ''),
            minorityIndic: String(row[16] || ''),
            sex: String(row[17] || ''),
            vendorType: String(row[18] || ''),
            regDate: formatExcelDate(row[19]),
            validityDate: formatExcelDate(row[20]),
            regType: String(row[21] || ''),
            phone1: String(row[22] || ''),
            phone2: String(row[23] || ''),
            email: String(row[24] || ''),
            constitution: String(row[25] || ''),
            addressNotes: String(row[26] || ''),
            i1_1: String(row[27] || ''),
            i1_2: String(row[28] || '')
          })).filter(v => v.vendorCode);

          const stats = await vendorService.processExcelData(vendors);
          setResult(stats);

          setIsProcessing(false);
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to parse Excel file");
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError("Failed to read file");
      setIsProcessing(false);
    }
  }, [onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-bg-deep/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-bg-card border border-app-border w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center bg-white/2">
          <h2 className="text-xl font-serif text-app-white">Database Synchronization</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-app-text-muted" />
          </button>
        </div>

        <div className="p-8">
          {!isProcessing && !result && !error && (
            <label className="group flex flex-col items-center justify-center border-2 border-dashed border-app-border rounded-xl p-12 hover:border-gold/30 hover:bg-gold/5 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white/5 group-hover:bg-gold/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                <Upload className="text-gold" size={32} />
              </div>
              <span className="text-app-white font-medium mb-1">
                Upload Vendor Dataset
              </span>
              <span className="text-app-text-muted text-xs text-center px-4">
                Sync SAP vendor records (XLSX, XLS). Existing records will be updated automatically.
              </span>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="text-gold animate-spin mb-4" size={48} />
              <p className="text-app-white font-medium">Processing Database Protocol...</p>
              <p className="text-app-text-muted text-xs mt-1">Comparing signatures and deduplicating entries</p>
            </div>
          )}

          {result && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-app-white font-semibold mb-6">Synchronization Complete</h3>
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="bg-bg-deep rounded-lg p-3 text-center border border-app-border">
                  <div className="text-emerald-400 text-lg font-bold">{result.added}</div>
                  <div className="text-[10px] text-app-text-muted uppercase tracking-wider">Added</div>
                </div>
                <div className="bg-bg-deep rounded-lg p-3 text-center border border-app-border">
                  <div className="text-blue-400 text-lg font-bold">{result.updated}</div>
                  <div className="text-[10px] text-app-text-muted uppercase tracking-wider">Updated</div>
                </div>
                <div className="bg-bg-deep rounded-lg p-3 text-center border border-app-border">
                  <div className="text-app-text-muted text-lg font-bold">{result.skipped}</div>
                  <div className="text-[10px] text-app-text-muted uppercase tracking-wider">Skipped</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-rose-400" size={32} />
              </div>
              <h3 className="text-app-white font-semibold mb-2">Protocol Error</h3>
              <p className="text-rose-400/80 text-sm mb-6 px-4">{error}</p>
              <button 
                onClick={() => { setError(null); setResult(null); }}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-app-white rounded-lg text-sm font-medium transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
