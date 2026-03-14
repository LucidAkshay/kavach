import React from "react";
import { invoke } from "@tauri-apps/api/core";

interface TrustScopesProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrustScopes: React.FC<TrustScopesProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90">
      
      {/* ── Scanline Effect ── */}
      <div className="fixed inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjMjJkM2VlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 z-10"></div>

      {/* ── Main Canvas ── */}
      <div className="relative w-full max-w-[1200px] h-full max-h-[85vh] hud-panel flex flex-col z-20 overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)]">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-hud-cyan-border bg-black/40">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-hud-cyan-dim border border-hud-cyan flex items-center justify-center">
                 <svg className="w-5 h-5 text-hud-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             </div>
             <div className="flex flex-col">
                <h1 className="hud-title text-xl text-hud-cyan tracking-[0.3em]">TACTICAL GRID</h1>
                <span className="hud-data text-[10px] text-hud-cyan-border tracking-widest">SEC_LVL_MAX // AGENT OVERSIGHT</span>
             </div>
          </div>
          <button onClick={onClose} className="text-hud-cyan-border hover:text-hud-cyan transition-colors hud-bracketed px-2 py-1">
             <span className="hud-data font-bold tracking-[0.2em]">[ DISENGAGE ]</span>
          </button>
        </div>

        {/* Dense Control Board Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4">
            
            {/* COLUMN 1 */}
            <div className="flex flex-col gap-4">
                <div className="hud-label border-b border-hud-cyan-border/50 pb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-hud-cyan" /> FILE_SYS_MATRIX
                </div>
                
                <ControlRow
                    label="/Users/aksha/.ssh/"
                    desc="SECURE KEYSTORE"
                    status="[ VETO_REQD ]"
                    color="hud-crimson"
                    initialState={false}
                />
                <ControlRow
                    label="/Kavach/test-zone"
                    desc="SANDBOX PERIMETER"
                    status="[ MONITORED ]"
                    color="hud-emerald"
                    initialState={true}
                />
                
                <div className="hud-label border-b border-hud-cyan-border/50 pb-2 mt-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-hud-amber animate-pulse" /> WEAPON_SYS_HONEYPOT
                </div>
                
                <HoneypotArmingPanel />
            </div>

            {/* COLUMN 2 */}
            <div className="flex flex-col gap-4 pl-4 border-l border-hud-cyan-border/30 border-dashed">
                <div className="hud-label border-b border-hud-cyan-border/50 pb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-hud-emerald" /> NET_UPLINK_MATRIX
                </div>
                
                <ControlRow
                    label="api.openai.com"
                    desc="AUTHORIZED AI INFRA"
                    status="[ TRUSTED ]"
                    color="hud-emerald"
                    initialState={true}
                />
                <ControlRow
                    label="*.exfil.net"
                    desc="KNOWN THREAT VECTOR"
                    status="[ BLOCKED ]"
                    color="hud-text-muted"
                    initialState={false}
                />

                <div className="hud-label border-b border-hud-cyan-border/50 pb-2 mt-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-hud-text-muted" /> GHOST_PROTOCOLS
                </div>
                
                <GhostModeBoard />
            </div>
            
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-black/60 border-t border-hud-cyan-border flex items-center justify-between mt-auto">
            <span className="hud-data text-[10px] text-hud-text-muted opacity-80">SESSION LOG: <span className="text-hud-cyan">0xKVCH_99FCA</span></span>
            <div className="flex items-center gap-4">
                <div className="fui-barcode w-24 h-4 opacity-30" />
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-hud-cyan text-black hud-data font-bold tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
                >
                    [ COMMIT CHANGES ]
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

// ── HIGH DENSITY CONTROLS ──

const ControlRow = ({ label, desc, status, color, initialState }: { label: string; desc: string; status: string; color: string; initialState: boolean; }) => {
    const [active, setActive] = React.useState(initialState);
    return (
        <div className={`flex items-center justify-between p-3 hud-card ${active ? '' : 'opacity-60 saturate-50'}`}>
            <div className="flex flex-col gap-0.5 max-w-[65%]">
                <span className="hud-data text-[12px] font-bold tracking-tight text-white truncate">{label}</span>
                <span className="hud-label text-[9px] text-hud-text-muted truncate">{desc}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className={`hud-data text-[10px] font-bold text-${color}`}>{status}</span>
                <button 
                    onClick={() => setActive(!active)}
                    className="flex w-12 h-3 bg-black/80 border border-hud-cyan-border relative cursor-pointer"
                >
                    <div className={`absolute top-0 bottom-0 w-1/2 transition-all duration-300 ${active ? `right-0 bg-${color}` : 'left-0 bg-hud-text-muted/50'}`} />
                </button>
            </div>
        </div>
    );
};

const GhostModeBoard = () => {
    const [enabled, setEnabled] = React.useState(false);
    return (
        <div className="hud-card p-4 border border-hud-cyan-border flex flex-col gap-3 group relative overflow-hidden">
            <div className={`absolute inset-0 bg-hud-amber/5 transition-opacity duration-700 pointer-events-none ${enabled ? 'opacity-100' : 'opacity-0'}`} />
            <div className="flex items-center justify-between z-10">
                <span className="hud-data text-[12px] font-bold text-hud-text-primary">GHOST_MODE (SHADOW BAN)</span>
                <span className={`hud-data text-[10px] font-bold ${enabled ? 'text-hud-amber animate-pulse' : 'text-hud-text-muted'}`}>
                    {enabled ? '[ ACTIVE ]' : '[ OFFLINE ]'}
                </span>
            </div>
            
            <span className="hud-label text-[9px] text-hud-text-muted max-w-[80%] z-10">
               Silently spoofs blocked network requests for analysis without payload execution.
            </span>
            
            <button 
               onClick={() => {
                   invoke("toggle_ghost_mode", { enabled: !enabled }).catch(e=>console.log(e));
                   setEnabled(!enabled);
               }}
               className={`mt-2 py-2 hud-data tracking-[0.2em] font-bold border transition-colors z-10 cursor-pointer ${enabled ? 'border-hud-amber text-hud-amber bg-hud-amber/10' : 'border-hud-cyan-border text-hud-cyan-border hover:bg-white/5'}`}
            >
               {enabled ? '> DISENGAGE GHOST <' : '> INITIALIZE GHOST <'}
            </button>
        </div>
    );
};

const HoneypotArmingPanel = () => {
    const [deploying, setDeploying] = React.useState(false);
    
    const handleDeploy = async () => {
        if(deploying) return;
        setDeploying(true);
        try { await invoke("deploy_honeypot"); } catch(e){}
    };
    
    return (
        <div className="hud-card border-none bg-black relative overflow-hidden flex flex-col p-4 mt-2">
            {/* Caution Stripes Border */}
            <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMjBMIjIwIDBoMTBMMCAzMHoiIGZpbGw9IiNmYmJmMjQiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50 z-0" />
            <div className={`absolute inset-0 border-2 pointer-events-none transition-colors duration-300 z-10 ${deploying ? 'border-hud-amber' : 'border-hud-text-muted/30'}`} />
            
            <div className="flex items-center justify-between z-20">
                <div className="flex flex-col gap-1">
                    <span className="hud-data text-[13px] font-bold text-hud-text-primary">DECOY_DEPLOYMENT (HONEYPOT)</span>
                    <span className="hud-label text-[9px] text-hud-amber">CAUTION: FALSE TARGET GENERATION</span>
                </div>
                <div className={`w-3 h-3 rounded-none ${deploying ? 'bg-hud-amber shadow-[0_0_10px_var(--color-hud-amber)] animate-pulse' : 'bg-hud-text-muted border border-white/20'}`} />
            </div>

            {/* Radar Scanning Bar */}
            <div className="w-full h-1 mt-4 mb-4 bg-black border border-hud-amber/30 relative overflow-hidden z-20">
                {deploying && <div className="absolute top-0 bottom-0 w-1/4 bg-hud-amber animate-[moveLeftRight_2s_ease-in-out_infinite_alternate] shadow-[0_0_15px_var(--color-hud-amber)]" />}
            </div>

            <button 
               onClick={handleDeploy}
               className={`py-3 mt-1 cursor-pointer w-full hud-data font-bold tracking-[0.2em] border z-20 transition-all ${deploying ? 'bg-hud-amber text-black border-transparent shadow-[0_0_15px_var(--color-hud-amber)]' : 'bg-black text-hud-amber border-hud-amber hover:bg-hud-amber hover:text-black'}`}
            >
               {deploying ? '>>> RADAR SCANNING BOOT...' : '[ ARM HONEYPOT DECOY ]'}
            </button>
            
            <style>{`
                @keyframes moveLeftRight { 0% { left: 0%; } 100% { left: 75%; } }
            `}</style>
        </div>
    );
};

export default TrustScopes;
