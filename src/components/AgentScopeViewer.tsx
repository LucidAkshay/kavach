import React, { useEffect, useState } from "react";
import { InterceptedAction } from "../types";

interface AgentScopeViewerProps {
  actions: InterceptedAction[];
  isMonitoring: boolean;
  onToggleLockdown: () => void;
}

const AgentScopeViewer: React.FC<AgentScopeViewerProps> = ({ actions, isMonitoring, onToggleLockdown }) => {
  const [pulseLine, setPulseLine] = useState<"red" | "amber" | "green" | null>(null);

  useEffect(() => {
    if (actions.length > 0) {
      const latest = actions[actions.length - 1];
      if (latest.risk_level === "High") setPulseLine("red");
      else if (latest.risk_level === "Medium") setPulseLine("amber");
      else setPulseLine("green");
      const timer = setTimeout(() => setPulseLine(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [actions]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-transparent">
        {/* Header Badge */}
        <div className="absolute top-8 left-10 flex items-center gap-6 z-10">
            <button onClick={onToggleLockdown} className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-accent-primary transition-colors cursor-pointer" title="Toggle Perimeter">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
            <div className="flex flex-col">
                <span className="text-xl font-medium text-white tracking-tight">Active Telemetry</span>
                <span className="label-spatial mt-2 text-white/40">Real-time Node Graph Status: {isMonitoring ? 'Shields UP' : 'Shields DOWN'}</span>
            </div>
        </div>

        {actions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 animate-in fade-in duration-1000">
                <svg className="w-20 h-20 mb-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-3xl font-extralight tracking-widest text-white/50">SYSTEM SECURE</span>
                <span className="label-spatial mt-4">Awaiting Traffic</span>
            </div>
        ) : (
            <div className="flex-1 flex items-center justify-center w-full mt-12">
                <svg className="w-full h-full max-w-[900px] overflow-visible relative z-10" viewBox="0 0 800 300">
                  {/* Clean Horizontal Connection Lines */}
                  <path d="M 280 150 C 400 150, 480 70, 600 70" stroke={pulseLine === "red" ? "var(--color-risk-high)" : "rgba(255,255,255,0.05)"} strokeWidth="3" className="transition-all duration-500" fill="none" />
                  <path d="M 280 150 L 600 150" stroke={pulseLine === "amber" ? "var(--color-risk-medium)" : "rgba(255,255,255,0.05)"} strokeWidth="3" className="transition-all duration-500" fill="none" />
                  <path d="M 280 150 C 400 150, 480 230, 600 230" stroke={pulseLine === "green" ? "var(--color-risk-low)" : "rgba(255,255,255,0.05)"} strokeWidth="3" className="transition-all duration-500" fill="none" />

                  {/* Source Node */}
                  <g transform="translate(200, 150)">
                    <circle cx="0" cy="0" r="56" fill="rgba(255,255,255,0.02)" stroke="var(--color-accent-primary)" strokeWidth="1" />
                    <circle cx="0" cy="0" r="80" fill="transparent" stroke="var(--color-accent-primary)" strokeWidth="1" strokeDasharray="4 8" className="animate-spin opacity-30" style={{ animationDuration: '20s' }} />
                    <text x="0" y="8" textAnchor="middle" className="text-lg font-bold fill-white tracking-widest uppercase opacity-80">Agent</text>
                  </g>

                  {/* Destination Nodes */}
                  <g transform="translate(640, 70)">
                    <circle cx="0" cy="0" r="40" fill="rgba(255,255,255,0.02)" stroke="var(--color-risk-high)" strokeWidth="1" className={pulseLine === "red" ? "animate-pulse-danger" : ""} />
                    <text x="0" y="8" textAnchor="middle" fill="var(--color-risk-high)" className="text-xl font-bold tracking-[0.2em] uppercase">Veto</text>
                  </g>
                  
                  <g transform="translate(640, 150)">
                    <circle cx="0" cy="0" r="40" fill="rgba(255,255,255,0.02)" stroke="var(--color-risk-medium)" strokeWidth="1" className={pulseLine === "amber" ? "animate-pulse-danger" : ""} />
                    <text x="0" y="8" textAnchor="middle" fill="var(--color-risk-medium)" className="text-xl font-bold tracking-[0.2em] uppercase">Net</text>
                  </g>
                  
                  <g transform="translate(640, 230)">
                    <circle cx="0" cy="0" r="40" fill="rgba(255,255,255,0.02)" stroke="var(--color-risk-low)" strokeWidth="1" />
                    <text x="0" y="8" textAnchor="middle" fill="var(--color-risk-low)" className="text-xl font-bold tracking-[0.2em] uppercase">Ok</text>
                  </g>
                </svg>
            </div>
        )}
    </div>
  );
};

export default AgentScopeViewer;
