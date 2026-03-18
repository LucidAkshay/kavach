import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { InterceptedAction } from "../types";

interface BlastRadiusModalProps {
    action: InterceptedAction | null;
    onResolved: () => void;
}

const BlastRadiusModal: React.FC<BlastRadiusModalProps> = ({ action, onResolved }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!action) return null;

    const isHighRisk = action.risk_level === "High";
    const RiskColor = isHighRisk ? "hud-crimson" : "hud-amber";

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await invoke("approve_action", { id: action.id });
        } catch (err) { console.error(err); }
        setIsProcessing(false);
        onResolved();
    };

    const handleDeny = async () => {
        setIsProcessing(true);
        try {
            await invoke("deny_action", { id: action.id });
        } catch (err) { console.error(err); }
        setIsProcessing(false);
        onResolved();
    };

    const handleChokehold = async () => {
        if (!action.pid) {
            alert("PID tracking unavailable for this process. Cannot apply OS chokehold.");
            return;
        }
        setIsProcessing(true);
        try {
            await invoke("apply_chokehold", { targetPid: action.pid });
            await invoke("deny_action", { id: action.id });
        } catch (err) {
            console.error(err);
            alert("Failed to apply chokehold: " + err);
        }
        setIsProcessing(false);
        onResolved();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95">
            <div className="fixed inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjZjQzZjVlIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 z-10" />

            <div className="relative w-full max-w-[800px] hud-panel flex flex-col z-20 shadow-[0_0_50px_rgba(244,63,94,0.15)] overflow-hidden">
                <style>{`.hud-panel::after{background-color:rgba(244,63,94,0.4);}`}</style>

                <div className={`px-6 py-4 flex items-center justify-between border-b border-${RiskColor}/40 bg-${RiskColor}/10`}>
                    <div className="flex flex-col">
                        <h2 className={`hud-title text-xl text-${RiskColor} tracking-[0.3em] ${isHighRisk ? 'animate-pulse' : ''}`}>
                            {isHighRisk ? "CRITICAL VETO REQUIRED" : "SECURITY INTERCEPTION"}
                        </h2>
                        <span className={`hud-data text-[10px] text-${RiskColor} opacity-70`}>ISOLATION_ACTIVE // THREAT_ID: 0x{action.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                </div>

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
                        {action.pid && (
                            <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
                                <span className="hud-label text-[9px]">PROCESS_ID (PID)</span>
                                <span className="hud-data text-[11px] text-hud-amber font-bold">{action.pid}</span>
                            </div>
                        )}

                        {!action.rollback_available && (action.action_type.includes("FileModify") || action.action_type.includes("FileDelete")) && (
                            <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
                                <span className="hud-data text-[10px] text-hud-crimson animate-pulse">[ TEMPORAL ROLLBACK UNAVAILABLE : FILE DELETED OR EXCEEDS 50MB ]</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex flex-col gap-2 opacity-50">
                            <div className="w-full py-4 bg-black border border-hud-crimson/30 text-hud-crimson/50 font-black tracking-[0.3em] flex items-center justify-center gap-4 cursor-not-allowed">
                                [ BIOMETRIC CLEARANCE LOCKED // v1.2 ROADMAP ]
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleDeny}
                                disabled={isProcessing}
                                className={`flex-1 py-4 bg-${RiskColor} text-black font-bold border border-transparent shadow-[0_0_20px_var(--color-${RiskColor})] hover:bg-white transition-all cursor-pointer flex items-center justify-center disabled:opacity-50`}
                            >
                                <span className="hud-data text-[14px] tracking-[0.2em]">[ TERMINATE PID ]</span>
                            </button>

                            <button
                                onClick={handleChokehold}
                                disabled={!action.pid || isProcessing}
                                className="flex-1 py-4 bg-hud-amber-dim/20 text-hud-amber font-bold border border-hud-amber shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:bg-hud-amber hover:text-black transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="hud-data text-[12px] tracking-[0.2em]">
                                    {action.pid ? "[ THROTTLE CPU ]" : "[ PID REQUIRED ]"}
                                </span>
                            </button>

                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex-1 py-4 bg-black text-white font-bold border border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                            >
                                <span className="hud-data text-[12px] tracking-[0.2em]">[ BYPASS ]</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`px-6 py-2 bg-black/60 border-t border-${RiskColor}/30 flex justify-between`}>
                    <span className="hud-data text-[8px] text-hud-text-muted">AWAITING TACTICAL COMMAND...</span>
                </div>
            </div>
        </div>
    );
};

export default BlastRadiusModal;