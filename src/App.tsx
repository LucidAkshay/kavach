import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import BlastRadiusModal from "./components/BlastRadiusModal";
import TrustScopes from "./components/TrustScopes";
import CommLink from "./components/CommLink";
import TacticalConsole from "./components/TacticalConsole";
import { InterceptedAction, MonitoringStats } from "./types";
import "./index.css";

function App() {
  const [actions, setActions] = useState<InterceptedAction[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    total_intercepted: 0,
    high_risk_count: 0,
    medium_risk_count: 0,
    low_risk_count: 0,
    is_monitoring: false,
    monitored_path: "",
  });
  
  const [pendingAction, setPendingAction] = useState<InterceptedAction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTacticalOpen, setIsTacticalOpen] = useState(false);

  const refreshStats = async () => {
    try {
      const newStats = await invoke<MonitoringStats>("get_stats");
      setStats(newStats);
      const newActions = await invoke<InterceptedAction[]>("get_actions");
      setActions(newActions);
    } catch (err) {
      console.error("Failed to refresh:", err);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const criticalAction = actions.reverse().find(a => a.status === "pending" && a.risk_level === "High");
    if (criticalAction && pendingAction?.id !== criticalAction.id) {
        setPendingAction(criticalAction);
    }
  }, [actions]);

  const handleModalResolved = () => {
    setPendingAction(null);
    refreshStats();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden p-2 gap-2">
      <Header stats={stats} onOpenSettings={() => setIsSettingsOpen(true)} onOpenTactical={() => setIsTacticalOpen(true)} />
      
      <main className="flex-1 flex overflow-hidden gap-2">
        <Dashboard stats={stats} actions={actions} onRefreshStats={refreshStats} />
      </main>

      <BlastRadiusModal action={pendingAction} onResolved={handleModalResolved} />
      <TrustScopes isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TacticalConsole isOpen={isTacticalOpen} onClose={() => setIsTacticalOpen(false)} />
      <CommLink />
      
      {/* Global CSS Decorations */}
      <div className="fui-crosshair top-left z-0" style={{top: '10px', left: '10px'}} />
      <div className="fui-crosshair top-right z-0" style={{top: '10px', right: '10px'}} />
      <div className="fui-crosshair bottom-left z-0" style={{bottom: '10px', left: '10px'}} />
      <div className="fui-crosshair bottom-right z-0" style={{bottom: '10px', right: '10px'}} />
    </div>
  );
}

export default App;
