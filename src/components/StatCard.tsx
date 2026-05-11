import React from 'react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  isSpecial?: boolean;
  onClick?: () => void;
}

export function StatCard({ title, value, color = "text-app-white", icon, subtitle, isSpecial, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-bg-card border border-app-border p-4 md:p-5 rounded-2xl relative overflow-hidden transition-all group",
        onClick && "cursor-pointer hover:border-gold/30 hover:shadow-xl",
        isSpecial && "ring-1 ring-gold/30 bg-gold/[0.03]"
      )}
    >
      <div className="flex items-start justify-between mb-2 md:mb-3 relative z-10">
        <p className={cn("text-[9px] md:text-[10px] uppercase tracking-wider font-bold mb-1", isSpecial ? "text-gold" : "text-app-text-muted")}>
          {title}
        </p>
        <div className={cn(
          "w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity",
          isSpecial ? "bg-gold/10 text-gold" : "bg-white/5 text-app-text-muted"
        )}>
          {icon}
        </div>
      </div>
      <div className={cn("text-2xl md:text-3xl font-serif tracking-tight relative z-10", color)}>
        {value.toLocaleString()}
      </div>
      {subtitle && (
        <p className="text-[8px] md:text-[9px] text-app-text-muted/60 mt-1 uppercase tracking-widest relative z-10">{subtitle}</p>
      )}
      
      {/* Background Decor */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.02] transform rotate-12 transition-transform group-hover:scale-125">
        {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement, { size: 64 })}
      </div>
    </div>
  );
}
