import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { InterceptedAction } from "../types";

interface BlastRadiusModalProps {
  action: InterceptedAction | null;
  onResolved: () => void;
}

const BlastRadiusModal: React.FC<BlastRadiusModalProps> = ({ action, onResolved }) => {
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(false);
  const [authInput, setAuthInput] = React.useState("");
  const [authCode] = React.useState(() => 
    Math.random().toString(36).substring(2, 5).toUpperCase()
  );

  if (!action) return null;

  const isCritical = action.risk_level === "High" || action.target_path.includes(".ssh");

  const handleApprove = async () => {
    if (isCritical && (!isVerified || authInput !== authCode)) return;
    try {
      await invoke("approve_action", { id: action.id });
    } catch (err) { }
    onResolved();
  };

  const handleDeny = async () => {
    try {
      await invoke("deny_action", { id: action.id });
    } catch (err) { }
    onResolved();
  };

  const triggerBiometrics = async () => {
    setIsVerifying(true);
    try {
      const success = await invoke("verify_biometrics");
      if (success) setIsVerified(true);
    } catch (err) {}
    setIsVerifying(false);
  };

  const isHighRisk = action.risk_level === "High";
  const RiskColor = isHighRisk ? "hud-crimson" : "hud-amber";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95">
      
      {/* ── Scanline Effect ── */}
      <div className="fixed inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjZjQzZjVlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 z-10" />

      {/* Spatial Modal Container */}
      <div className="relative w-full max-w-[800px] hud-panel flex flex-col z-20 shadow-[0_0_50px_rgba(244,63,94,0.15)] overflow-hidden">
        <style>{`.hud-panel::after{background-color:rgba(244,63,94,0.4);}`}</style>
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b border-${RiskColor}/40 bg-${RiskColor}/10`}>
            <div className="flex flex-col">
               <h2 className={`hud-title text-xl text-${RiskColor} tracking-[0.3em] ${isHighRisk ? 'animate-pulse' : ''}`}>
                  {isHighRisk ? "CRITICAL VETO REQUIRED" : "SECURITY INTERCEPTION"}
               </h2>
               <span className={`hud-data text-[10px] text-${RiskColor} opacity-70`}>ISOLATION_ACTIVE // THREAT_ID: 0x{action.id.slice(0,8).toUpperCase()}</span>
            </div>
            <div className="fui-crosshair top-right opacity-50" />
        </div>

        {/* Details Grid */}
        <div className="p-6 flex flex-col gap-6">
            <div className={`hud-card p-4 border-l-2 border-l-${RiskColor} flex flex-col gap-4 bg-${RiskColor}-dim/20`}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="hud-label text-[9px]">TARGET_PROCESS</span>
                        <span className="hud-data text-[14px] text-white tracking-widest">{action.agent_name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="hud-label text-[9px]">VIOLATION_TYPE</span>
                        <span className={`hud-data text-[14px] font-bold text-${RiskColor} tracking-widest`}>
                            {action.action_type.replace("CRITICAL_VELOCITY | ", "")}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
                    <span className="hud-label text-[9px]">ATTEMPTED_ACCESS_PATH</span>
                    <span className="hud-data text-[11px] text-hud-text-primary bg-black/50 p-2 border border-white/10 truncate">{action.target_path}</span>
                </div>
            </div>

            {/* Master Veto Actions */}
            <div className="flex flex-col gap-4 mt-4 relative">
                {/* Adversarial Noise Filter Definition */}
                <svg className="absolute w-0 h-0">
                    <filter id="adversarial-noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
                        <feComposite operator="in" in="SourceGraphic" in2="noise" />
                    </filter>
                </svg>

                {isCritical && !isVerified && (
                    <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={triggerBiometrics}
                            disabled={isVerifying}
                            className="w-full py-6 bg-hud-crimson-dim border-2 border-hud-crimson text-hud-crimson font-black tracking-[0.3em] hover:bg-hud-crimson hover:text-black transition-all flex items-center justify-center gap-4 group"
                        >
                            {isVerifying ? (
                                <span className="animate-pulse">HANDSHAKING WITH HARDWARE...</span>
                            ) : (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-hud-crimson group-hover:border-black animate-ping" />
                                    [ BIOMETRIC CLEARANCE REQUIRED ]
                                </>
                            )}
                        </button>
                        <span className="hud-data text-[8px] text-center text-hud-text-muted">NUCLEAR_AUTH_PROTOCOL : v4.81 // HARDWARE_KEY_REQUIRED</span>
                    </div>
                )}

                {(isVerified || !isCritical) && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom duration-500">
                         {isCritical && (
                            <div className="flex items-center gap-3 bg-white/5 p-3 border border-white/10">
                                <span className="hud-label text-[10px] text-hud-amber whitespace-nowrap">AUTH_CODE : [{authCode}]</span>
                                <input 
                                    autoFocus
                                    className="flex-1 bg-black border border-hud-cyan/30 text-hud-cyan px-2 py-1 font-mono text-sm outline-none focus:border-hud-cyan text-center tracking-[0.5em]"
                                    placeholder="TYPE CODE"
                                    maxLength={3}
                                    value={authInput}
                                    onChange={(e) => setAuthInput(e.target.value.toUpperCase())}
                                />
                            </div>
                         )}

                         <div className="flex gap-4">
                            <button
                            onClick={handleDeny}
                            className={`flex-1 py-4 bg-${RiskColor} text-black font-bold border border-transparent shadow-[0_0_20px_var(--color-${RiskColor})] hover:bg-white hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden`}
                            >
                            <div className="absolute top-0 bottom-0 w-8 bg-white/30 skew-x-12 translate-x-[-150px] animate-[slideRight_1.5s_infinite]" />
                            <span className="hud-data text-[14px] tracking-[0.2em] relative z-10">[ TERMINATE ]</span>
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                    await invoke("ghost_action", { id: action.id });
                                    } catch (err) {}
                                    onResolved();
                                }}
                                className={`flex-1 py-4 bg-fuchsia-900/30 text-fuchsia-400 font-bold border border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.3)] hover:bg-fuchsia-400 hover:text-black transition-all cursor-pointer flex items-center justify-center relative overflow-hidden`}
                            >
                                <span className="hud-data text-[12px] tracking-[0.2em] relative z-10">[ GHOST ]</span>
                            </button>

                            <button
                                onClick={handleApprove}
                                disabled={isCritical && authInput !== authCode}
                                className={`flex-1 py-4 bg-black text-white font-bold border border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center ${isCritical && authInput !== authCode ? 'opacity-20 grayscale pointer-events-none' : ''} relative`}
                            >
                                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ filter: 'url(#adversarial-noise)' }} />
                                <span className="hud-data text-[12px] tracking-[0.2em] opacity-80 z-10">[ BYPASS ]</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-2 bg-black/60 border-t border-${RiskColor}/30 flex justify-between`}>
           <span className="hud-data text-[8px] text-hud-text-muted">{isCritical ? 'SECURE_CHANNEL_ESTABLISHED' : 'AWAITING COMM_LINK...'}</span>
           <div className="fui-barcode w-16 h-2 opacity-30" style={{ backgroundImage: `repeating-linear-gradient(90deg, var(--color-${RiskColor}) 0px, var(--color-${RiskColor}) 2px, transparent 2px, transparent 4px, var(--color-${RiskColor}) 4px, var(--color-${RiskColor}) 5px, transparent 5px, transparent 8px)` }} />
        </div>
        
        <style>{`
           @keyframes slideRight { 0% { transform: translateX(-150px) skewX(12deg); } 100% { transform: translateX(800px) skewX(12deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default BlastRadiusModal;
