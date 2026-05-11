import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { VendorTable } from './components/VendorTable';
import { UploadModal } from './components/UploadModal';
import { LoginForm } from './components/LoginForm';
import { vendorService } from './services/vendorService';
import { Vendor, DashboardStats, AuthorizedUser } from './types';
import { Search, Plus, Filter, Download, Briefcase, Users, FileCheck, FileWarning, ShoppingBag, Factory, ChevronLeft, ChevronRight, Database, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isExpired, cn, isMSE } from './lib/utils';
import { StatCard } from './components/StatCard';
import { ContactList } from './components/ContactList';

export default function App() {
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vendors' | 'contacts'>('dashboard');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [vendorTypeFilter, setVendorTypeFilter] = useState<'all' | 'Manufacturer' | 'Trader'>('all');
  const [validityFilter, setValidityFilter] = useState<'all' | 'valid' | 'expired'>('all');
  const [specialFilter, setSpecialFilter] = useState<'none' | 'women' | 'scst' | 'mse'>('none');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('vendor_intel_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setVendors([]);
      return;
    }
    const unsubscribe = vendorService.subscribeToVendors((docs) => {
      setVendors(docs);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = (authenticatedUser: AuthorizedUser) => {
    setUser(authenticatedUser);
    localStorage.setItem('vendor_intel_session', JSON.stringify(authenticatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vendor_intel_session');
  };

  const stats = useMemo(() => vendorService.getStats(vendors), [vendors]);

  const filteredVendors = useMemo(() => {
    let result = vendorService.searchVendors(vendors, searchQuery);
    
    if (vendorTypeFilter !== 'all') {
      result = result.filter(v => v.vendorType === vendorTypeFilter);
    }
    
    if (validityFilter !== 'all') {
      result = result.filter(v => {
        const expired = isExpired(v.validityDate);
        return validityFilter === 'expired' ? expired : !expired;
      });
    }

    if (specialFilter === 'women') {
      result = result.filter(v => isMSE(v) && v.sex === '2');
    } else if (specialFilter === 'scst') {
      result = result.filter(v => {
        if (!isMSE(v)) return false;
        const minority = (v.minorityIndic || '').toUpperCase();
        return minority.includes('SC') || minority.includes('ST');
      });
    } else if (specialFilter === 'mse') {
      result = result.filter(v => isMSE(v));
    }

    return result;
  }, [vendors, searchQuery, vendorTypeFilter, validityFilter, specialFilter]);

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-bg-deep flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 animate-pulse">
            <span className="text-gold font-bold text-2xl">V</span>
          </div>
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">Authenticating Protocol...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-bg-deep overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />
...
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <header className="p-8 pb-4 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-gold font-semibold">Vendor Management Protocol</p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-app-white tracking-tight">
              {activeTab === 'dashboard' ? 'Intelligence Dashboard' : 
               activeTab === 'vendors' ? 'Vendor Repository' : 'Contact Intelligence'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 md:p-2.5 rounded-xl border border-app-border bg-bg-card text-gold hover:bg-white/5 transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={() => setIsUploadOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-gold text-bg-deep rounded-lg font-bold text-xs md:text-sm hover:brightness-110 transition-all shadow-[0_4px_15px_rgba(197,160,89,0.2)] active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={2.5} />
              SYNC DATABASE
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 pt-2 md:pt-4 overflow-y-auto overflow-x-hidden space-y-4 md:space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Vendors" 
                  value={stats.totalVendors} 
                  icon={<Users size={16} />}
                  subtitle="Active Protocol"
                  onClick={() => { setActiveTab('vendors'); setValidityFilter('all'); }}
                />
                <StatCard 
                  title="Valid" 
                  value={stats.validVendors} 
                  color="text-emerald-500" 
                  icon={<FileCheck size={16} />}
                  subtitle="Under Compliance"
                  onClick={() => { setActiveTab('vendors'); setValidityFilter('valid'); }}
                />
                <StatCard 
                  title="Expired" 
                  value={stats.expiredVendors} 
                  color="text-rose-500" 
                  icon={<FileWarning size={16} />}
                  subtitle="Renewal Required"
                  onClick={() => { setActiveTab('vendors'); setValidityFilter('expired'); }}
                />
                <StatCard 
                  title="Manufacturer" 
                  value={stats.manufacturers} 
                  icon={<Factory size={16} />}
                  subtitle="Direct Suppliers"
                />
                <StatCard 
                  title="Trader" 
                  value={stats.traders} 
                  icon={<Briefcase size={16} />}
                  subtitle="External Partners"
                />
                <StatCard 
                  title="MSEs (Mfg)" 
                  value={stats.mseManufacturers} 
                  isSpecial
                  icon={<ShoppingBag size={16} />}
                  subtitle="Small & Micro"
                  onClick={() => { setActiveTab('vendors'); setSpecialFilter('mse'); setValidityFilter('all'); setVendorTypeFilter('all'); }}
                />
                <StatCard 
                  title="Women MSE" 
                  value={stats.womenMSE} 
                  color="text-fuchsia-500"
                  icon={<Users size={16} />}
                  subtitle="Owned by Women"
                  onClick={() => { setActiveTab('vendors'); setSpecialFilter('women'); setValidityFilter('all'); setVendorTypeFilter('all'); }}
                />
                <StatCard 
                  title="SC & ST MSE" 
                  value={stats.scstMSE} 
                  color="text-amber-500"
                  icon={<Factory size={16} />}
                  subtitle="Minority Support"
                  onClick={() => { setActiveTab('vendors'); setSpecialFilter('scst'); setValidityFilter('all'); setVendorTypeFilter('all'); }}
                />
              </section>

              {/* Secondary Dashboard Content */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
                <section className="xl:col-span-2 bg-bg-card border border-app-border rounded-2xl p-4 md:p-6 min-h-[300px]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base md:text-lg font-serif text-app-white">Recent Synchronization Activity</h2>
                    <button className="text-[10px] md:text-xs text-gold hover:underline uppercase tracking-wider font-bold">View Protocol Logs</button>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {vendors.length > 0 ? (
                      vendors.slice(0, 5).map(v => (
                        <div key={v.vendorCode} className="flex items-center justify-between p-2.5 md:p-3 bg-white/2 rounded-xl border border-app-border hover:border-gold/20 transition-all group/item">
                          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <div className="hidden sm:flex w-10 h-10 bg-white/5 rounded-lg items-center justify-center text-gold font-mono text-sm shrink-0">
                              {v.vendorCode.slice(-2)}
                            </div>
                            <div className="truncate">
                              <p className="text-xs md:text-sm font-medium text-app-white truncate">{v.name1}</p>
                              <p className="text-[9px] md:text-[10px] text-app-text-muted uppercase tracking-wider truncate">{v.vendorType} • {v.city}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] md:text-xs text-app-text-muted">Validated</p>
                            <p className="text-[9px] text-app-text-muted/60">{new Date(v.updatedAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-48 flex items-center justify-center text-app-text-muted text-sm italic">
                        No recent activity recorded
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-gold/10 border border-gold/20 rounded-2xl p-5 md:p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 md:opacity-10 group-hover:scale-110 transition-transform">
                    <Database size={100} md:size={120} className="text-gold" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col">
                    <h3 className="text-lg md:text-xl font-serif text-gold mb-3">Database Integrity</h3>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
                      Our deduplication engine ensures your vendor records remain pristine by comparing SearchTerm, Code, and Validity signatures.
                    </p>
                    <div className="mt-auto space-y-2 md:space-y-3">
                      {[
                        { label: 'Deduplication: Active', color: 'bg-gold' },
                        { label: 'Auto-Update: Enabled', color: 'bg-gold' },
                        { label: 'Status: Synchronized', color: 'bg-emerald-500' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.color)} />
                          <span className="text-[10px] md:text-xs font-medium text-white">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <section className="bg-bg-card border border-app-border rounded-2xl flex flex-col overflow-hidden h-full min-h-[400px] md:min-h-[500px]">
              {/* Toolbar */}
              <div className="p-3 md:p-4 border-b border-app-border flex flex-col lg:flex-row gap-3 md:gap-4 bg-white/2">
                <div className="flex-1 flex items-center gap-3 bg-bg-deep border border-app-border rounded-xl px-4 py-2 focus-within:border-gold/50 transition-all">
                  <Search className="text-app-text-muted" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-app-text placeholder-app-text-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {specialFilter !== 'none' && (
                    <button 
                      onClick={() => setSpecialFilter('none')}
                      className="px-3 py-2 bg-gold/10 border border-gold/30 rounded-xl text-[10px] font-bold text-gold hover:bg-gold/20 transition-all flex items-center gap-2"
                    >
                      CLEAR {specialFilter.toUpperCase()} FILTER
                      <Users size={12} />
                    </button>
                  )}
                  <div className="relative flex-1 min-w-[140px]">
                    <select 
                      className="w-full appearance-none bg-bg-deep border border-app-border rounded-xl px-4 py-2 pl-10 text-xs font-semibold text-gold outline-none focus:border-gold/50 hover:bg-white/5 transition-all cursor-pointer"
                      value={validityFilter}
                      onChange={(e) => setValidityFilter(e.target.value as any)}
                    >
                      <option value="all">Validity</option>
                      <option value="valid">Valid</option>
                      <option value="expired">Expired</option>
                    </select>
                    <FileCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-muted" size={14} />
                  </div>

                  <div className="relative flex-1 min-w-[140px]">
                    <select 
                      className="w-full appearance-none bg-bg-deep border border-app-border rounded-xl px-4 py-2 pl-10 text-xs font-semibold text-gold outline-none focus:border-gold/50 hover:bg-white/5 transition-all cursor-pointer"
                      value={vendorTypeFilter}
                      onChange={(e) => setVendorTypeFilter(e.target.value as any)}
                    >
                      <option value="all">All Types</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Trader">Trader</option>
                    </select>
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-muted" size={14} />
                  </div>
                  
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-app-border rounded-xl text-xs font-semibold text-app-text hover:bg-white/10 transition-all ml-auto min-w-[100px]">
                    <Download size={14} />
                    EXPORT
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <VendorTable vendors={filteredVendors} theme={theme} />
              </div>

              <footer className="p-3 md:p-4 border-t border-app-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/2 shrink-0">
                <p className="text-[9px] md:text-[10px] text-app-text-muted uppercase tracking-widest font-bold text-center sm:text-left">
                  Showing {filteredVendors.length} of {vendors.length} Protocol Entities
                </p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400">
                    <ChevronLeft size={16} />
                  </button>
                  {[1].map(n => (
                    <button key={n} className="w-8 h-8 rounded-lg border border-gold/30 bg-gold/10 text-gold flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(197,160,89,0.2)]">
                      {n}
                    </button>
                  ))}
                  <button className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </footer>
            </section>
          )}

          {activeTab === 'contacts' && <ContactList vendors={vendors} />}
        </div>
      </main>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal 
            onClose={() => setIsUploadOpen(false)} 
            onSuccess={() => {
              setIsUploadOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

