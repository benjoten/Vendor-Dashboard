import React, { useState, useMemo } from 'react';
import { Vendor } from '../types';
import { Search, Mail, Phone, MapPin, Database, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContactListProps {
  vendors: Vendor[];
}

export function ContactList({ vendors }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    // 1. First, sort all vendors alphabetically by name1 for a consistent base list
    const sortedBase = [...vendors].sort((a, b) => 
      (a.name1 || '').localeCompare(b.name1 || '')
    );

    if (!searchQuery.trim()) return sortedBase;
    
    const q = searchQuery.toLowerCase().trim();
    
    // 2. Filter vendors based on multiple criteria
    const filtered = sortedBase.filter(v => {
      const name1 = (v.name1 || '').toLowerCase();
      const name2 = (v.name2 || '').toLowerCase();
      const searchTerm = (v.searchTerm || '').toLowerCase();
      const code = (v.vendorCode || '').toLowerCase();
      const city = (v.city || '').toLowerCase();
      const email = (v.email || '').toLowerCase();

      // Check if any field contains the query
      return name1.includes(q) || 
             name2.includes(q) || 
             searchTerm.includes(q) || 
             code.includes(q) || 
             city.includes(q) || 
             email.includes(q);
    });

    // 3. Sort filtered results to prioritize prefix matches in any name field
    // This makes "A" show contacts starting with "A" at the top
    return filtered.sort((a, b) => {
      const qLower = q.toLowerCase();
      
      const aStarts = (a.name1 || '').toLowerCase().startsWith(qLower) || 
                      (a.searchTerm || '').toLowerCase().startsWith(qLower) ||
                      (a.vendorCode || '').toLowerCase().startsWith(qLower);
                      
      const bStarts = (b.name1 || '').toLowerCase().startsWith(qLower) || 
                      (b.searchTerm || '').toLowerCase().startsWith(qLower) ||
                      (b.vendorCode || '').toLowerCase().startsWith(qLower);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // If both start with it or neither do, maintain alphabetical order by name1
      return (a.name1 || '').localeCompare(b.name1 || '');
    });
  }, [vendors, searchQuery]);

  if (vendors.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Database className="text-app-text-muted" size={32} />
        </div>
        <h3 className="text-xl font-serif text-app-white mb-2">No Contact Data</h3>
        <p className="text-app-text-muted max-w-xs text-sm">
          Please upload the vendor database to access communication protocols.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-bg-card border border-app-border rounded-2xl flex flex-col overflow-hidden h-full min-h-[500px]">
      <div className="p-4 border-b border-app-border bg-white/2">
        <div className="flex items-center gap-3 bg-bg-deep border border-app-border rounded-xl px-4 py-2.5 focus-within:border-gold/50 transition-all max-w-md">
          <Search className="text-app-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search contacts by Name, Code, City..." 
            className="bg-transparent border-none outline-none text-sm w-full text-app-text placeholder-app-text-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContacts.map((vendor) => (
            <div 
              key={vendor.vendorCode} 
              className="bg-bg-deep border border-app-border rounded-xl p-5 hover:border-gold/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <User size={64} className="text-gold" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold font-bold text-sm">
                  {vendor.name1.charAt(0)}
                </div>
                <div>
                  <h4 className="text-app-white font-medium text-sm truncate max-w-[150px]">{vendor.name1}</h4>
                  <p className="text-gold font-mono text-[10px] tracking-wider uppercase">{vendor.vendorCode}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-app-text-muted mt-0.5" />
                  <p className="text-xs text-app-text-muted">{vendor.city}, {vendor.cty}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-white/2 rounded-lg border border-app-border group-hover:border-gold/20 transition-all">
                    <Phone size={14} className="text-gold" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-app-text-muted uppercase tracking-tighter">Telephones</span>
                      <span className="text-xs text-app-white font-medium">{vendor.phone1 || 'N/A'}</span>
                      {vendor.phone2 && <span className="text-xs text-app-white font-medium">{vendor.phone2}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-white/2 rounded-lg border border-app-border group-hover:border-gold/20 transition-all">
                    <Mail size={14} className="text-gold" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-app-text-muted uppercase tracking-tighter">Email Logic</span>
                      <span className="text-xs text-app-white font-medium truncate">{vendor.email || 'no-email@vmp.sys'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
