import React from 'react';
import { MonitoringStats } from '../types';

interface HeaderProps {
  stats: MonitoringStats;
  onOpenSettings: () => void;
  onOpenTactical: () => void;
}

const Header: React.FC<HeaderProps> = ({ stats, onOpenSettings, onOpenTactical }) => {
  return (
    <header className="flex items-center justify-between hud-panel mb-2 overflow-hidden h-14">
      {/* ── Left: System ID ── */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-hud-cyan-dim border border-hud-cyan flex items-center justify-center text-hud-cyan shadow-[0_0_15px_var(--color-hud-cyan-dim)]">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
           </svg>
        </div>
        <div className="flex flex-col">
            <h1 className="hud-title text-hud-cyan tracking-[0.2em]">AKSHAY'S KAVACH <span className="text-hud-text-muted">v1.0.0</span></h1>
            <span className="hud-label tracking-widest text-[8px] text-hud-text-muted uppercase">ZERO-TRUST TACTICAL FIREWALL // PROUDLY BUILT BY AKSHAY SHARMA</span>
        </div>
      </div>

      {/* ── Center: Decorational Barcode ── */}
      <div className="hidden md:flex flex-1 items-center justify-center pointer-events-none">
          <div className="flex items-center gap-4 opacity-50">
             <div className="fui-barcode w-32 h-2" />
             <span className="hud-data text-[10px] text-hud-cyan-border">SYS.CHK.PASS</span>
             <div className="fui-barcode w-32 h-2" />
          </div>
      </div>

      {/* ── Right: Status & Actions ── */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 border border-hud-cyan-border rounded-sm">
          <span className="relative flex h-2 w-2">
            {stats.is_monitoring && <span className="animate-ping absolute inline-flex h-full w-full bg-hud-cyan opacity-75"></span>}
            <span className={`relative inline-flex h-2 w-2 ${stats.is_monitoring ? "bg-hud-cyan" : "bg-hud-text-muted"}`}></span>
          </span>
          <span className="hud-label">
            {stats.is_monitoring ? "UPLINK: ACTIVE" : "SYS: STANDBY"}
          </span>
        </div>
        
        <button 
          onClick={onOpenTactical}
          className="hud-bracketed px-2 py-1 text-hud-amber hover:text-hud-cyan transition-colors cursor-pointer"
        >
           <span className="hud-data tracking-[0.2em] font-bold text-[10px]">[ TACTICAL ]</span>
        </button>

        <button 
          onClick={onOpenSettings}
          className="hud-bracketed px-2 py-1 text-hud-cyan-border hover:text-hud-cyan transition-colors cursor-pointer"
        >
           <span className="hud-data tracking-[0.2em] font-bold text-[10px]">[ CONFIG ]</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
