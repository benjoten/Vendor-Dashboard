import React from 'react';
import { LayoutGrid, Search, Phone, Database, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { AuthorizedUser } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'vendors' | 'contacts';
  onTabChange: (tab: 'dashboard' | 'vendors' | 'contacts') => void;
  user: AuthorizedUser;
  onLogout: () => void;
}

export function Sidebar({ activeTab, onTabChange, user, onLogout }: SidebarProps) {
  return (
    <aside className="w-full md:w-16 h-16 md:h-full bg-bg-sidebar border-t md:border-t-0 md:border-r border-app-border flex md:flex-col items-center justify-between md:justify-start px-4 md:px-0 py-0 md:py-8 gap-4 md:gap-8 shrink-0 fixed md:relative bottom-0 left-0 z-50">
      <div className="hidden md:flex w-10 h-10 bg-gold rounded-xl items-center justify-center text-bg-deep font-bold text-xl ring-2 ring-gold/20">V</div>
      
      <nav className="flex md:flex-col items-center gap-2 md:gap-6 text-app-text-muted flex-1 md:flex-none justify-around md:justify-start">
        <button 
          onClick={() => onTabChange('dashboard')}
          className={cn(
            "p-3 md:p-2 rounded-lg transition-all hover:bg-white/5",
            activeTab === 'dashboard' && "bg-white/10 text-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]"
          )}
          title="Dashboard"
        >
          <LayoutGrid className="size-6" />
        </button>
        
        <button 
          onClick={() => onTabChange('vendors')}
          className={cn(
            "p-3 md:p-2 rounded-lg transition-all hover:bg-white/5",
            activeTab === 'vendors' && "bg-white/10 text-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]"
          )}
          title="Vendor Directory"
        >
          <Search className="size-6" />
        </button>

        <button 
          onClick={() => onTabChange('contacts')}
          className={cn(
            "p-3 md:p-2 rounded-lg transition-all hover:bg-white/5",
            activeTab === 'contacts' && "bg-white/10 text-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]"
          )}
          title="Contact Intelligence"
        >
          <Phone className="size-6" />
        </button>
        
        <div className="hidden md:block w-8 h-px bg-app-border my-2" />
        
        <button className="hidden md:flex p-2 rounded-lg hover:bg-white/5 hover:text-app-white transition-all" title="Database Management">
          <Database size={20} />
        </button>
        
        <button className="hidden md:flex p-2 rounded-lg hover:bg-white/5 hover:text-app-white transition-all" title="Settings">
          <Settings size={20} />
        </button>
      </nav>

      <div className="md:mt-auto flex md:flex-col gap-4 items-center">
        <button 
          onClick={onLogout}
          className="p-3 md:p-2 rounded-lg text-app-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all"
          title="Sign Out"
        >
          <LogOut className="size-6 md:size-5" />
        </button>

        <div className="p-0.5 rounded-full border border-gold/30 ring-2 ring-gold/10 overflow-hidden">
          <img 
            src={`https://ui-avatars.com/api/?name=${user.name || user.userId}&background=C5A059&color=0A0A0B`} 
            alt="User" 
            className="w-8 h-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </aside>
  );
}
