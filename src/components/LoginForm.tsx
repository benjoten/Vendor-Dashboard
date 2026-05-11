import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Key, User, Loader2, AlertCircle } from 'lucide-react';
import { userService } from '../services/userService';
import { AuthorizedUser } from '../types';

interface LoginFormProps {
  onLogin: (user: AuthorizedUser) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.login(userId, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid Intelligence Credentials. Access Denied.');
      }
    } catch (err) {
      setError('System authentication failure. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-bg-deep flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-bg-card border border-app-border p-6 sm:p-10 rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
        
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gold rounded-2xl flex items-center justify-center text-bg-deep font-bold text-3xl sm:text-4xl mx-auto mb-4 sm:mb-6 shadow-[0_0_30px_rgba(197,160,89,0.3)]">
            V
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-app-white mb-2 leading-tight">Vendor Management<br/>Protocol</h1>
          <p className="text-app-text-muted text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mt-4">Security Screening Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-app-text-muted uppercase tracking-widest ml-1">Protocol Identifier</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within:text-gold transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User ID"
                  className="w-full bg-bg-deep border border-app-border rounded-xl py-3.5 pl-12 pr-4 text-app-text placeholder-app-text-muted outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-app-text-muted uppercase tracking-widest ml-1">Access Signature</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within:text-gold transition-colors">
                  <Key size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-bg-deep border border-app-border rounded-xl py-3.5 pl-12 pr-4 text-app-text placeholder-app-text-muted outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-3 text-rose-400 text-xs"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold text-bg-deep py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(197,160,89,0.2)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LogIn size={20} />
            )}
            UNAUTHORIZED ACCESS BLOCKED
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-app-border text-center space-y-4">
          <p className="text-[10px] text-app-text-muted uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-3">
            <span className="w-1 h-1 bg-gold rounded-full opacity-50" />
            End-to-End Encryption
            <span className="w-1 h-1 bg-gold rounded-full opacity-50" />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
