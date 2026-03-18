import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { MonitoringStats, InterceptedAction, SystemInfo } from "../types";
import ActionLog from "./ActionLog";

interface DashboardProps {
  stats: MonitoringStats;
  actions: InterceptedAction[];
  onRefreshStats: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, actions, onRefreshStats }) => {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  // REAL OS TELEMETRY POLLING
  useEffect(() => {
    const fetchSysInfo = async () => {
      try {
        const info = await invoke<SystemInfo>("get_system_info");
        setSysInfo(info);
      } catch (err) {
        console.error("Telemetry failed:", err);
      }
    };

    fetchSysInfo();
    const interval = setInterval(fetchSysInfo, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLockdown = async () => {
    try {
      if (stats.is_monitoring) {
        await invoke<string>("stop_monitoring");
      } else {
        await invoke<string>("start_monitoring", { path: "C:\\" });
      }
      onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const isExfiltration = actions.some(a => a.action_type.includes("NET_EXFILTRATION"));
  const isCritical = stats.high_risk_count > 0 || isExfiltration;
  const isSafe = stats.total_intercepted === 0;

  return (
    <div className="flex-1 flex w-full h-full gap-2">

      {/* LEFT PANE : REAL TELEMETRY STREAM */}
      <div className="w-[320px] hud-panel flex flex-col shrink-0 gap-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-hud-cyan-border pb-2">
          <span className="hud-title text-sm text-hud-cyan">SYS_TELEMETRY</span>
          <span className="hud-label text-[9px]">{sysInfo ? "UPLINK: SECURE" : "UPLINK: CONNECTING"}</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end border-b border-hud-cyan-border/30 pb-1">
            <span className="hud-label text-hud-text-primary">SYS_MEM</span>
            <span className="hud-data text-hud-amber">
              {sysInfo ? (sysInfo.memory_used / 1024 / 1024 / 1024).toFixed(2) : "0.00"} GB
            </span>
          </div>
          <div className="flex justify-between items-end border-b border-hud-cyan-border/30 pb-1">
            <span className="hud-label text-hud-text-primary">ACTIVE_PROCS</span>
            <span className="hud-data text-hud-cyan">{sysInfo?.process_count || 0}</span>
          </div>
          <div className="flex justify-between items-end border-b border-hud-cyan-border/30 pb-1">
            <span className="hud-label text-hud-text-primary">CPU_LOAD</span>
            <div className="w-24 h-2 bg-black/50 border border-hud-cyan-border relative">
              <div className="absolute top-0 left-0 bottom-0 bg-hud-cyan transition-all duration-500" style={{ width: `${sysInfo?.cpu_usage.toFixed(0) || 0}%` }} />
            </div>
          </div>
        </div>

        {/* REAL EVENT STREAM INSTEAD OF FAKE HEX */}
        <div className="flex-1 overflow-y-auto mt-2 pointer-events-none flex flex-col gap-1">
          {actions.slice(-15).reverse().map((action, i) => (
            <div key={i} className="hud-data text-[9px] text-hud-text-muted flex flex-col border-b border-white/5 pb-1">
              <div className="flex justify-between">
                <span className="text-hud-cyan">0x{action.id.slice(0, 6)}</span>
                <span>{action.risk_level.toUpperCase()}</span>
              </div>
              <span className="truncate opacity-50">{action.target_path}</span>
            </div>
          ))}
          {actions.length === 0 && (
            <span className="hud-data text-[10px] text-hud-text-muted">AWAITING SYSTEM EVENTS...</span>
          )}
        </div>

        <button onClick={handleToggleLockdown} className={`mt-auto w-full py-3 border hud-label hud-bracketed cursor-pointer ${stats.is_monitoring ? "bg-hud-crimson-dim border-hud-crimson text-hud-crimson hover:bg-hud-crimson/20" : "bg-hud-cyan-dim border-hud-cyan text-hud-cyan hover:bg-hud-cyan/20"}`}>
          {stats.is_monitoring ? "[ HALT MONITORING ]" : "[ INITIALIZE PERIMETER ]"}
        </button>
      </div>

      {/* CENTER STAGE : CORE VISUALIZER */}
      <div className="flex-1 hud-panel flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute top-4 left-4 text-[10px] font-mono text-hud-cyan-border tracking-widest bg-black/50 px-2 py-0.5">OVERWATCH : ACTIVE</div>
        <div className="absolute bottom-4 right-4"><div className="fui-barcode" /></div>

        <div className="relative w-80 h-80 flex items-center justify-center mb-12">
          {isExfiltration ? (
            <GlobeVisualizer />
          ) : (
            <>
              <div className={`absolute inset-0 rounded-full border-2 border-dashed ${isCritical ? 'border-hud-crimson' : 'border-hud-cyan'} opacity-30 animate-spin-slow`} />
              <div className={`absolute inset-4 rounded-full border ${isCritical ? 'border-hud-crimson' : 'border-hud-cyan'} opacity-20 animate-spin-reverse`} />
              <div className={`absolute inset-12 rounded-full border-4 border-dotted ${isCritical ? 'border-hud-crimson' : 'border-hud-cyan'} opacity-40 animate-spin-slow`} style={{ animationDuration: '20s' }} />
            </>
          )}

          <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${isCritical ? 'border-hud-crimson bg-hud-crimson-dim animate-pulse-danger' : 'border-hud-cyan bg-hud-cyan-dim'} z-10 shadow-[0_0_30px_rgba(34,211,238,0.2)]`}>
            <span className="hud-data font-bold tracking-widest mb-1 text-white">STATUS</span>
            <span className={`hud-title text-xl ${isCritical ? 'text-hud-crimson' : 'text-hud-cyan'}`}>
              {isExfiltration ? 'EXFIL' : isCritical ? 'THREAT' : isSafe ? 'STABLE' : 'ACTIVE'}
            </span>
          </div>

          <div className={`absolute inset-0 border-t ${isCritical ? 'border-hud-crimson' : 'border-hud-cyan'} opacity-10 top-1/2 -translate-y-1/2`} />
          <div className={`absolute inset-0 border-l ${isCritical ? 'border-hud-crimson' : 'border-hud-cyan'} opacity-10 left-1/2 -translate-x-1/2`} />
        </div>

        {isExfiltration && (
          <div className="absolute top-16 right-8 hud-card p-3 border-l-2 border-hud-crimson bg-hud-crimson-dim/30 animate-in fade-in slide-in-from-right duration-500">
            <div className="hud-label text-[10px] text-hud-crimson mb-1">TARGET_NODE_RESOLVED</div>
            <div className="hud-data text-xs text-white">
              {actions.find(a => a.action_type.includes("NET_EXFILTRATION"))?.action_type.split("// NODE: ")[1] || "EXTERNAL_IP"}
            </div>
            <div className="fui-barcode mt-2 opacity-50" />
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 w-full max-w-2xl">
          <MetricBlock value={stats.total_intercepted} label="PROCESSED" color="hud-text-primary" />
          <MetricBlock value={stats.high_risk_count} label="CRITICAL" color={stats.high_risk_count > 0 ? "hud-crimson" : "hud-text-muted"} />
          <MetricBlock value={stats.medium_risk_count} label="ANOMALIES" color={stats.medium_risk_count > 0 ? "hud-amber" : "hud-text-muted"} />
          <MetricBlock value={stats.low_risk_count} label="ROUTINE" color="hud-emerald" />
        </div>
      </div>

      {/* RIGHT PANE : INTERCEPTION MATRIX */}
      <div className="w-[450px] hud-panel flex flex-col shrink-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-hud-cyan-border pb-2 mb-4">
          <span className="hud-title text-sm text-hud-cyan flex items-center gap-2">
            <span className="w-2 h-2 bg-hud-cyan animate-pulse" />
            INTERCEPTION MATRIX
          </span>
          <span className="hud-data text-[10px] text-hud-text-muted">COUNT: {actions.length.toString().padStart(4, '0')}</span>
        </div>
        <ActionLog actions={actions} />
      </div>

    </div>
  );
};

const GlobeVisualizer = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-80 h-80 rounded-full border border-hud-cyan/20 overflow-hidden bg-black/40">
        <div className="absolute inset-x-0 top-1/4 h-[1px] bg-hud-cyan/10" />
        <div className="absolute inset-x-0 top-2/4 h-[1px] bg-hud-cyan/20" />
        <div className="absolute inset-x-0 top-3/4 h-[1px] bg-hud-cyan/10" />

        <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '15s' }}>
          <div className="absolute inset-y-0 left-1/4 w-[1px] bg-hud-cyan/10" />
          <div className="absolute inset-y-0 left-2/4 w-[1px] bg-hud-cyan/20" />
          <div className="absolute inset-y-0 left-3/4 w-[1px] bg-hud-cyan/10" />
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <path
            d="M 160 160 Q 240 40 320 180"
            fill="none"
            stroke="var(--color-hud-crimson)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          <circle cx="320" cy="180" r="4" fill="var(--color-hud-crimson)" className="animate-ping" />
          <text x="330" y="190" className="hud-data text-[8px] fill-hud-crimson">EXTERNAL_TARGET_NODE</text>
        </svg>

        <div className="absolute inset-0 bg-hud-crimson/5 animate-pulse" />
      </div>

      <div className="absolute inset-[-20px] rounded-full border border-hud-crimson/30 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
    </div>
  );
};

const MetricBlock = ({ value, label, color }: { value: number, label: string, color: string }) => (
  <div className={`hud-card flex flex-col p-3 border-t-2 ${color.includes('crimson') ? 'border-hud-crimson' : color.includes('amber') ? 'border-hud-amber' : color.includes('emerald') ? 'border-hud-emerald' : 'border-hud-cyan-border'}`}>
    <span className="hud-label mb-1">{label}</span>
    <span className={`hud-data text-2xl font-bold tracking-tighter text-${color}`}>
      {value.toString().padStart(3, '0')}
    </span>
  </div>
);

export default Dashboard;