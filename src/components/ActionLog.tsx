import React, { useRef, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { InterceptedAction } from "../types";

interface ActionLogProps {
  actions: InterceptedAction[];
}

const ActionLog: React.FC<ActionLogProps> = ({ actions }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions]);

  if (actions.length === 0) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30">
              <div className="w-16 h-16 border border-hud-cyan-border rounded-none flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-2 border border-hud-cyan-border/50 animate-spin-slow"></div>
              </div>
              <span className="hud-data text-hud-text-muted">WAITING FOR SIGNAL...</span>
          </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
         {actions.map((action) => (
           <TerminalEntry key={action.id} action={action} />
         ))}
      </div>
    </div>
  );
};

const TerminalEntry = ({ action }: { action: InterceptedAction }) => {
  const [decrypting, setDecrypting] = useState(true);

  useEffect(() => {
     const timer = setTimeout(() => setDecrypting(false), 800);
     return () => clearTimeout(timer);
  }, []);

  const isHigh = action.risk_level === "High";
  const RiskColor = isHigh ? "text-hud-crimson" : action.risk_level === "Medium" ? "text-hud-amber" : "text-hud-emerald";
  const intent = action.action_type.replace("File", "").replace("CRITICAL_VELOCITY | ", "").toUpperCase();
  const timestamp = action.timestamp.split(" ")[1] || action.timestamp;
  const target = action.target_path.split(/[\\/]/).pop() || action.target_path;

  return (
      <div className={`hud-card p-2 flex flex-col gap-1 border-l-2 ${isHigh ? 'border-l-hud-crimson bg-hud-crimson-dim/30' : action.risk_level === 'Medium' ? 'border-l-hud-amber bg-hud-amber-dim/20' : 'border-l-hud-emerald'}`}>
          <div className="flex items-center justify-between pointer-events-none">
              <span className="hud-data text-[10px] text-hud-text-muted">[{timestamp}] :: {action.id.slice(0,8)}</span>
              <span className={`hud-data text-[10px] font-bold ${RiskColor}`}>[{action.risk_level}]</span>
          </div>

          <div className={`hud-data flex items-center gap-2 ${decrypting ? 'animate-decrypt' : ''}`}>
             <span className="opacity-50 text-hud-cyan">{'>'}</span>
             <span className={decrypting ? "font-mono" : "hud-data"}>
                 {decrypting ? Array.from(intent).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94))).join('') : intent}
             </span>
             {action.action_type.includes("CRITICAL_VELOCITY") && !decrypting && (
                 <span className="text-[9px] bg-hud-crimson text-black px-1 font-bold">VELOCITY_THREAT</span>
             )}
          </div>

          <div className="hud-label text-hud-text-primary truncate mt-1 pl-4 opacity-80 border-l border-hud-cyan-border/30 ml-1">
             <span className="opacity-40">TARGET: </span>
             <span>{target}</span>
          </div>
          
          <div className="flex justify-end mt-1 gap-2">
              {action.status === "approved" && (
                  <button 
                      onClick={() => invoke('revert_action', { id: action.id })}
                      className="hud-label font-bold text-hud-cyan border border-hud-cyan bg-hud-cyan/10 px-2 py-0.5 hover:bg-hud-cyan hover:text-black transition-colors cursor-pointer"
                  >
                      [ ⟲ REVERT ]
                  </button>
              )}
              <span className={`hud-label font-bold bg-black/50 px-2 py-0.5 border ${
                  action.status === "approved" ? "text-hud-emerald border-hud-emerald" :
                  action.status === "denied" ? "text-hud-crimson border-hud-crimson" :
                  action.status === "ghosted" ? "text-fuchsia-400 border-fuchsia-400" :
                  action.status === "reverted" ? "text-hud-cyan border-hud-cyan" :
                  "text-hud-text-muted border-hud-text-muted animate-pulse"
              }`}>
                  {action.status === "pending" ? "AWAITING SIG..." : 
                   action.status === "ghosted" ? "GHOSTED TO PHANTOM_FS" : 
                   action.status === "reverted" ? "TEMPORAL RESTORE SUCCESSFUL" : 
                   action.status.toUpperCase()}
              </span>
          </div>
      </div>
  );
};

export default ActionLog;
