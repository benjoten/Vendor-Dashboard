import React from 'react';
import { Vendor } from '../types';
import { formatDate, cn, isExpired } from '../lib/utils';
import { Mail, Phone, MapPin, Tag, Calendar, Database } from 'lucide-react';

interface VendorTableProps {
  vendors: Vendor[];
  theme?: 'dark' | 'light';
}

export function VendorTable({ vendors }: VendorTableProps) {
  if (vendors.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Database className="text-app-text-muted" size={32} />
        </div>
        <h3 className="text-xl font-serif text-app-white mb-2">No Records Found</h3>
        <p className="text-app-text-muted max-w-xs text-sm">
          Please upload an Excel file to synchronize the database protocol.
        </p>
      </div>
    );
  }

  return (
    <div className="relative group/table">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gold/20">
        <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-[1200px]">
        <thead className="bg-bg-deep border-b border-app-border text-[10px] uppercase tracking-widest text-app-text-muted font-bold sticky top-0 z-10">
          <tr className="h-10">
            <th className="px-4 w-32">Code</th>
            <th className="px-4 w-64">Name 1 / SearchTerm</th>
            <th className="px-4 w-48">Location</th>
            <th className="px-4 w-40">Industry & Class</th>
            <th className="px-4 w-32">Vendor Type</th>
            <th className="px-4 w-40">Validity</th>
            <th className="px-4 w-48">Contact Intelligence</th>
          </tr>
        </thead>
        <tbody className="text-xs divide-y divide-app-border">
          {vendors.map((vendor) => {
            const expired = isExpired(vendor.validityDate);
            return (
              <tr key={vendor.vendorCode} className="h-16 hover:bg-white/5 transition-colors group">
                <td className="px-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-gold font-bold">{vendor.vendorCode}</span>
                    <span className="text-[9px] text-app-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      {vendor.regType || 'NA'}
                    </span>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex flex-col">
                    <span className="text-app-white font-medium truncate">{vendor.name1}</span>
                    <span className="text-[10px] text-app-text-muted italic mt-0.5">{vendor.searchTerm}</span>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-app-text-muted">
                      <MapPin size={10} className="text-gold/50" />
                      <span>{vendor.city}, {vendor.cty}</span>
                    </div>
                    <span className="text-[9px] text-app-text-muted/60 truncate">{vendor.street}</span>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider",
                      vendor.industry?.toLowerCase().includes('micro') ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      vendor.industry?.toLowerCase().includes('small') ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-app-text-muted/10 text-app-text-muted border border-app-text-muted/20"
                    )}>
                      {vendor.industry || 'General'}
                    </span>
                    {vendor.minorityIndic && (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[9px] uppercase font-bold">
                        Minority
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Tag size={12} className="text-gold/40" />
                    <span className="text-app-text">{vendor.vendorType}</span>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex flex-col gap-1">
                    <div className={cn(
                      "flex items-center gap-1.5 font-medium",
                      expired ? "text-rose-500" : "text-emerald-500"
                    )}>
                      <Calendar size={12} />
                      <span>{formatDate(vendor.validityDate)}</span>
                    </div>
                    <span className="text-[9px] text-app-text-muted">Reg: {formatDate(vendor.regDate)}</span>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex flex-col gap-1 text-app-text-muted">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-gold/30" />
                      <span className="truncate">{vendor.email || 'no-email@vendor.com'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gold/30" />
                      <span>{vendor.phone1}</span>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

