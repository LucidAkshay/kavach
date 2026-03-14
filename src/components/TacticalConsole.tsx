import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

// ── Types for IPC results ──
interface PiiScanResult { original_length: number; sanitized: string; redacted_count: number; threats: string[]; }
interface LoopDetection { detected: boolean; pattern: string; repeat_count: number; action_taken: string; }
interface SemanticAnalysis { action_description: string; danger_score: number; verdict: string; reasoning: string; }
interface ClipboardGuardStatus { is_armed: boolean; blocked_attempts: number; last_blocked_process: string; }
interface PhantomVaultEntry { key: string; real_value_masked: string; phantom_value: string; }
interface ChildProcessInfo { pid: number; name: string; parent_pid: number; scope: string; }
interface TokenUsage { api_name: string; tokens_used: number; tokens_limit: number; percentage: number; is_blocked: boolean; }
interface ThreatFeed { total_entries: number; last_synced: string; sample_domains: string[]; }
interface MirrorMazeStatus { deployed: boolean; trap_path: string; depth: number; }
interface SimulatedShellResult { original_command: string; executed: boolean; mock_exit_code: number; message: string; }
interface AuditChainEntry { index: number; timestamp: string; action_id: string; data_hash: string; prev_hash: string; chain_valid: boolean; }
interface SupplyChainReport { file_scanned: string; total_packages: number; flagged: string[]; health_score: number; }

const TABS = [
  { id: "brain", label: "🧠 BRAIN", color: "hud-cyan" },
  { id: "shield", label: "🛡 SHIELD", color: "hud-emerald" },
  { id: "gate", label: "🚪 GATE", color: "hud-amber" },
  { id: "trap", label: "🪤 TRAP", color: "hud-crimson" },
  { id: "blackbox", label: "📦 BLACK BOX", color: "hud-cyan" },
];

const TacticalConsole: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("brain");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[95vw] h-[90vh] bg-[#050914] border border-hud-cyan-border/30 flex flex-col overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.1)]">

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-hud-cyan-border/30 bg-black/60">
          <div className="flex items-center gap-4">
            <span className="hud-title text-sm text-hud-cyan tracking-[0.3em]">AKSHAY'S TACTICAL CONSOLE</span>
            <span className="text-[9px] hud-data text-hud-text-muted uppercase">v1.0.0 // 20 MODULES ONLINE // DESIGNED BY AKSHAY SHARMA</span>
          </div>
          <button onClick={onClose} className="hud-data text-hud-crimson border border-hud-crimson/30 px-3 py-1 hover:bg-hud-crimson hover:text-black transition-all cursor-pointer text-xs tracking-widest">
            [ CLOSE ]
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-hud-cyan-border/20 bg-black/40">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-center hud-data text-xs tracking-[0.2em] transition-all cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? `border-${tab.color} text-${tab.color} bg-white/5`
                  : "border-transparent text-hud-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "brain" && <BrainPanel />}
          {activeTab === "shield" && <ShieldPanel />}
          {activeTab === "gate" && <GatePanel />}
          {activeTab === "trap" && <TrapPanel />}
          {activeTab === "blackbox" && <BlackBoxPanel />}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PANEL 1: THE BRAIN
// ═══════════════════════════════════════════════════════════════
const BrainPanel = () => {
  const [piiInput, setPiiInput] = useState("");
  const [piiResult, setPiiResult] = useState<PiiScanResult | null>(null);
  const [semanticResult, setSemanticResult] = useState<SemanticAnalysis | null>(null);
  const [loopResult, setLoopResult] = useState<LoopDetection | null>(null);

  const runScan = async () => {
    const res = await invoke<PiiScanResult>("scan_outbound_pii", { payload: piiInput });
    setPiiResult(res);
  };

  const runSemantic = async () => {
    const res = await invoke<SemanticAnalysis>("analyze_semantic_intent", { actionType: "FileDelete", targetPath: "C:\\Windows\\System32\\ntoskrnl.exe" });
    setSemanticResult(res);
  };

  const runLoop = async () => {
    for (let i = 0; i < 12; i++) {
      const res = await invoke<LoopDetection>("detect_loop_pattern", { command: "npm install" });
      setLoopResult(res);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Gag Order */}
      <div className="hud-card p-4 flex flex-col gap-3 col-span-2">
        <div className="flex items-center gap-2 border-b border-hud-cyan-border/20 pb-2">
          <span className="w-2 h-2 bg-hud-cyan animate-pulse" />
          <span className="hud-title text-xs text-hud-cyan tracking-widest">GAG ORDER // PII SANITIZER</span>
        </div>
        <textarea
          value={piiInput}
          onChange={(e) => setPiiInput(e.target.value)}
          className="bg-black/60 border border-hud-cyan-border/20 text-hud-text-primary p-3 text-xs font-mono h-20 resize-none outline-none focus:border-hud-cyan"
        />
        <button onClick={runScan} className="self-start px-4 py-2 bg-hud-cyan/10 border border-hud-cyan text-hud-cyan hud-data text-xs hover:bg-hud-cyan hover:text-black transition-all cursor-pointer">
          [ SCAN PAYLOAD ]
        </button>
        {piiResult && (
          <div className="bg-black/40 border border-white/10 p-3 flex flex-col gap-2">
            <div className="flex gap-6">
              <span className="hud-label text-[10px]">REDACTED: <span className="text-hud-crimson font-bold">{piiResult.redacted_count}</span></span>
              <span className="hud-label text-[10px]">ORIGINAL: {piiResult.original_length}B</span>
            </div>
            {piiResult.threats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {piiResult.threats.map((t, i) => (
                  <span key={i} className="text-[9px] bg-hud-crimson/20 text-hud-crimson px-2 py-0.5 border border-hud-crimson/30">{t}</span>
                ))}
              </div>
            )}
            <pre className="text-[10px] text-hud-emerald font-mono overflow-x-auto whitespace-pre-wrap">{piiResult.sanitized}</pre>
          </div>
        )}
      </div>

      {/* Semantic Intent */}
      <div className="hud-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-hud-cyan-border/20 pb-2">
          <span className="w-2 h-2 bg-fuchsia-400 animate-pulse" />
          <span className="hud-title text-xs text-fuchsia-400 tracking-widest">SEMANTIC INTENT</span>
        </div>
        <button onClick={runSemantic} className="self-start px-4 py-2 bg-fuchsia-400/10 border border-fuchsia-400 text-fuchsia-400 hud-data text-xs hover:bg-fuchsia-400 hover:text-black transition-all cursor-pointer">
          [ ANALYZE: DELETE .ssh/id_rsa ]
        </button>
        {semanticResult && (
          <div className="bg-black/40 border border-white/10 p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className={`hud-data text-lg font-bold ${semanticResult.verdict === "DANGER" ? "text-hud-crimson" : semanticResult.verdict === "SUSPICIOUS" ? "text-hud-amber" : "text-hud-emerald"}`}>
                {semanticResult.verdict}
              </span>
              <span className="hud-data text-2xl font-thin text-white">{(semanticResult.danger_score * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/10 h-2">
              <div className={`h-full transition-all ${semanticResult.danger_score >= 0.7 ? "bg-hud-crimson" : semanticResult.danger_score >= 0.4 ? "bg-hud-amber" : "bg-hud-emerald"}`} style={{ width: `${semanticResult.danger_score * 100}%` }} />
            </div>
            <p className="hud-label text-[10px] text-hud-text-muted">{semanticResult.reasoning}</p>
          </div>
        )}
      </div>

      {/* Loop Break */}
      <div className="hud-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-hud-cyan-border/20 pb-2">
          <span className="w-2 h-2 bg-hud-amber animate-pulse" />
          <span className="hud-title text-xs text-hud-amber tracking-widest">LOOP BREAK</span>
        </div>
        <button onClick={runLoop} className="self-start px-4 py-2 bg-hud-amber/10 border border-hud-amber text-hud-amber hud-data text-xs hover:bg-hud-amber hover:text-black transition-all cursor-pointer">
          [ SIMULATE 12x "npm install" ]
        </button>
        {loopResult && (
          <div className={`bg-black/40 border p-3 flex flex-col gap-1 ${loopResult.detected ? "border-hud-crimson" : "border-white/10"}`}>
            <span className={`hud-data text-sm font-bold ${loopResult.detected ? "text-hud-crimson animate-pulse" : "text-hud-emerald"}`}>
              {loopResult.detected ? "⚠ LOOP DETECTED" : "MONITORING"}
            </span>
            <span className="hud-label text-[10px]">PATTERN: "{loopResult.pattern}" x{loopResult.repeat_count}</span>
            <span className="hud-label text-[10px]">ACTION: {loopResult.action_taken}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PANEL 2: THE SHIELD
// ═══════════════════════════════════════════════════════════════
const ShieldPanel = () => {
  const [clipGuard, setClipGuard] = useState<ClipboardGuardStatus | null>(null);
  const [vault, setVault] = useState<PhantomVaultEntry[]>([]);
  const [children, setChildren] = useState<ChildProcessInfo[]>([]);

  useEffect(() => {
    invoke<ClipboardGuardStatus>("toggle_clipboard_guard", { armed: true }).then(setClipGuard);
    invoke<PhantomVaultEntry[]>("get_phantom_vault").then(setVault);
  }, []);

  const scanChildren = async () => {
    const pid = parseInt(prompt("Enter parent PID:") || "0");
    if (pid > 0) {
      const res = await invoke<ChildProcessInfo[]>("scan_child_processes", { parentPid: pid });
      setChildren(res);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Faraday Clipboard */}
      <div className="hud-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-hud-emerald/30 pb-2">
          <span className="w-2 h-2 bg-hud-emerald animate-pulse" />
          <span className="hud-title text-xs text-hud-emerald tracking-widest">FARADAY CLIPBOARD</span>
        </div>
        {clipGuard && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className={`hud-data text-lg font-bold ${clipGuard.is_armed ? "text-hud-emerald" : "text-hud-crimson"}`}>
                {clipGuard.is_armed ? "ARMED" : "DISARMED"}
              </span>
              <button
                onClick={async () => {
                  const res = await invoke<ClipboardGuardStatus>("toggle_clipboard_guard", { armed: !clipGuard.is_armed });
                  setClipGuard(res);
                }}
                className="px-3 py-1 border border-hud-emerald text-hud-emerald text-[10px] hud-data hover:bg-hud-emerald hover:text-black transition-all cursor-pointer"
              >
                [ TOGGLE ]
              </button>
            </div>
            <span className="hud-label text-[10px]">BLOCKED: {clipGuard.blocked_attempts} attempts</span>
          </div>
        )}
      </div>

      {/* Phantom Vault */}
      <div className="hud-card p-4 flex flex-col gap-3 col-span-2">
        <div className="flex items-center gap-2 border-b border-hud-emerald/30 pb-2">
          <span className="w-2 h-2 bg-hud-amber animate-pulse" />
          <span className="hud-title text-xs text-hud-amber tracking-widest">PHANTOM VAULT // .ENV VIRTUALIZATION</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] hud-label border-b border-white/10 pb-1">
          <span>ENV_KEY</span><span>REAL (MASKED)</span><span className="text-hud-crimson">PHANTOM VALUE</span>
        </div>
        {vault.map((v, i) => (
          <div key={i} className="grid grid-cols-3 gap-1 text-[10px] hud-data py-1 border-b border-white/5">
            <span className="text-hud-cyan">{v.key}</span>
            <span className="text-hud-text-muted">{v.real_value_masked}</span>
            <span className="text-hud-crimson font-mono">{v.phantom_value}</span>
          </div>
        ))}
      </div>

      {/* Child Process Quarantine */}
      <div className="hud-card p-4 flex flex-col gap-3 col-span-2">
        <div className="flex items-center gap-2 border-b border-hud-emerald/30 pb-2">
          <span className="w-2 h-2 bg-hud-cyan animate-pulse" />
          <span className="hud-title text-xs text-hud-cyan tracking-widest">CHILD-PROCESS QUARANTINE</span>
        </div>
        <button onClick={scanChildren} className="self-start px-4 py-2 bg-hud-cyan/10 border border-hud-cyan text-hud-cyan hud-data text-xs hover:bg-hud-cyan hover:text-black transition-all cursor-pointer">
          [ SCAN CHILD PROCESSES ]
        </button>
        {children.length > 0 && (
          <div className="flex flex-col gap-1">
            {children.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-black/40 border border-white/10 px-3 py-2">
                <span className="hud-data text-xs text-white">{c.name}</span>
                <span className="hud-label text-[10px]">PID: {c.pid}</span>
                <span className="text-[9px] bg-hud-amber/20 text-hud-amber px-2 py-0.5 border border-hud-amber/30">{c.scope}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PANEL 3: THE GATE
// ═══════════════════════════════════════════════════════════════
const GatePanel = () => {
  const [tokenResult, setTokenResult] = useState<TokenUsage | null>(null);
  const [threatFeed, setThreatFeed] = useState<ThreatFeed | null>(null);

  const checkTokens = async () => {
    const res = await invoke<TokenUsage>("check_token_budget", { apiName: "openai-gpt4", tokensRequested: 5000 });
    setTokenResult(res);
  };

  const syncThreats = async () => {
    const res = await invoke<ThreatFeed>("sync_threat_matrix");
    setThreatFeed(res);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Token Burn-Rate */}
      <div className="hud-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-hud-amber/30 pb-2">
          <span className="w-2 h-2 bg-hud-amber animate-pulse" />
          <span className="hud-title text-xs text-hud-amber tracking-widest">TOKEN BURN-RATE</span>
        </div>
        <button onClick={checkTokens} className="self-start px-4 py-2 bg-hud-amber/10 border border-hud-amber text-hud-amber hud-data text-xs hover:bg-hud-amber hover:text-black transition-all cursor-pointer">
          [ BURN 5,000 TOKENS ]
        </button>
        {tokenResult && (
          <div className="bg-black/40 border border-white/10 p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="hud-data text-white">{tokenResult.api_name}</span>
              <span className={`hud-data text-sm font-bold ${tokenResult.is_blocked ? "text-hud-crimson" : "text-hud-emerald"}`}>
                {tokenResult.is_blocked ? "BLOCKED" : "ACTIVE"}
              </span>
            </div>
            <div className="w-full bg-white/10 h-3 relative">
              <div className={`h-full transition-all ${tokenResult.percentage > 100 ? "bg-hud-crimson" : tokenResult.percentage > 75 ? "bg-hud-amber" : "bg-hud-emerald"}`} style={{ width: `${Math.min(tokenResult.percentage, 100)}%` }} />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] hud-data text-white">{tokenResult.tokens_used.toLocaleString()} / {tokenResult.tokens_limit.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Threat Matrix */}
      <div className="hud-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-hud-crimson/30 pb-2">
          <span className="w-2 h-2 bg-hud-crimson animate-pulse" />
          <span className="hud-title text-xs text-hud-crimson tracking-widest">ZERO-DAY THREAT MATRIX</span>
        </div>
        <button onClick={syncThreats} className="self-start px-4 py-2 bg-hud-crimson/10 border border-hud-crimson text-hud-crimson hud-data text-xs hover:bg-hud-crimson hover:text-black transition-all cursor-pointer">
          [ SYNC C2 BLOCKLIST ]
        </button>
        {threatFeed && (
          <div className="bg-black/40 border border-white/10 p-3 flex flex-col gap-2">
            <span className="hud-label text-[10px]">SYNCED: {threatFeed.last_synced} // {threatFeed.total_entries} ENTRIES</span>
            {threatFeed.sample_domains.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hud-crimson" />
                <span className="hud-data text-[11px] text-hud-crimson font-mono">{d}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PANEL 4: THE TRAP
// ═══════════════════════════════════════════════════════════════
const TrapPanel = () => {
  const [mazeStatus, setMazeStatus] = useState<MirrorMazeStatus | null>(null);
  const [shellResult, setShellResult] = useState<SimulatedShellResult | null>(null);
  const [shellInput, setShellInput] = useState("rm -rf /important_data");

  const deployMaze = async () => {
    const res = await invoke<MirrorMazeStatus>("deploy_mirror_maze");
    setMazeStatus(res);
  };

  const runShell = async () => {
    const res = await invoke<SimulatedShellResult>("simulate_shell_command", { command: shellInput });
    setShellResult(res);
  };

  const poisonAgent = async () => {
    await invoke("inject_poisoned_context", { agentName: "rogue-agent-v3" });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Mirror Maze */}
      <div className="hud-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-hud-crimson/30 pb-2">
          <span className="w-2 h-2 bg-hud-crimson animate-pulse" />
          <span className="hud-title text-xs text-hud-crimson tracking-widest">MIRROR MAZE</span>
        </div>
        <button onClick={deployMaze} className="self-start px-4 py-2 bg-hud-crimson/10 border border-hud-crimson text-hud-crimson hud-data text-xs hover:bg-hud-crimson hover:text-black transition-all cursor-pointer">
          [ DEPLOY RECURSIVE TRAP ]
        </button>
        {mazeStatus && (
          <div className="bg-black/40 border border-hud-crimson/30 p-3 flex flex-col gap-1">
            <span className="hud-data text-hud-crimson font-bold">DEPLOYED: {mazeStatus.depth} LEVELS</span>
            <span className="hud-label text-[10px] text-hud-text-muted truncate">{mazeStatus.trap_path}</span>
          </div>
        )}
      </div>

      {/* Poisoned Context */}
      <div className="hud-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-fuchsia-400/30 pb-2">
          <span className="w-2 h-2 bg-fuchsia-400 animate-pulse" />
          <span className="hud-title text-xs text-fuchsia-400 tracking-widest">POISON CONTEXT</span>
        </div>
        <button onClick={poisonAgent} className="self-start px-4 py-2 bg-fuchsia-400/10 border border-fuchsia-400 text-fuchsia-400 hud-data text-xs hover:bg-fuchsia-400 hover:text-black transition-all cursor-pointer">
          [ INJECT SELF-DESTRUCT TO "rogue-agent-v3" ]
        </button>
        <span className="hud-label text-[9px] text-hud-text-muted">Feeds mock "CRITICAL_TERMINATE_SELF" override payload to the agent's stdin.</span>
      </div>

      {/* Simulated Shell */}
      <div className="hud-card p-4 flex flex-col gap-3 col-span-2">
        <div className="flex items-center gap-2 border-b border-hud-amber/30 pb-2">
          <span className="w-2 h-2 bg-hud-amber animate-pulse" />
          <span className="hud-title text-xs text-hud-amber tracking-widest">SIMULATED SHELL</span>
        </div>
        <div className="flex gap-2">
          <input
            value={shellInput}
            onChange={(e) => setShellInput(e.target.value)}
            className="flex-1 bg-black/60 border border-hud-cyan-border/20 text-hud-text-primary px-3 py-2 text-xs font-mono outline-none focus:border-hud-amber"
          />
          <button onClick={runShell} className="px-4 py-2 bg-hud-amber/10 border border-hud-amber text-hud-amber hud-data text-xs hover:bg-hud-amber hover:text-black transition-all cursor-pointer whitespace-nowrap">
            [ EXECUTE ]
          </button>
        </div>
        {shellResult && (
          <div className={`bg-black/40 border p-3 flex flex-col gap-1 ${shellResult.executed ? "border-hud-emerald/30" : "border-hud-crimson/30"}`}>
            <div className="flex items-center gap-3">
              <span className={`hud-data text-xs font-bold ${shellResult.executed ? "text-hud-emerald" : "text-hud-crimson"}`}>
                {shellResult.executed ? "ALLOWED" : "TRAPPED"}
              </span>
              <span className="hud-label text-[10px]">EXIT: {shellResult.mock_exit_code}</span>
            </div>
            <span className="hud-data text-[10px] text-hud-text-muted">{shellResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PANEL 5: THE BLACK BOX
// ═══════════════════════════════════════════════════════════════
const BlackBoxPanel = () => {
  const [chain, setChain] = useState<AuditChainEntry[]>([]);
  const [supplyReport, setSupplyReport] = useState<SupplyChainReport | null>(null);

  const appendEntry = async () => {
    const id = `action_${Date.now()}`;
    await invoke<AuditChainEntry>("append_audit_chain", { actionId: id });
    const entries = await invoke<AuditChainEntry[]>("verify_audit_chain");
    setChain(entries);
  };

  const scanSupply = async () => {
    try {
      const res = await invoke<SupplyChainReport>("scan_supply_chain", { manifestPath: "./package.json" });
      setSupplyReport(res);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Cryptographic Ledger */}
      <div className="hud-card p-4 flex flex-col gap-3 col-span-2">
        <div className="flex items-center gap-2 border-b border-hud-cyan/30 pb-2">
          <span className="w-2 h-2 bg-hud-cyan animate-pulse" />
          <span className="hud-title text-xs text-hud-cyan tracking-widest">CRYPTOGRAPHIC LEDGER</span>
        </div>
        <button onClick={appendEntry} className="self-start px-4 py-2 bg-hud-cyan/10 border border-hud-cyan text-hud-cyan hud-data text-xs hover:bg-hud-cyan hover:text-black transition-all cursor-pointer">
          [ APPEND CHAIN ENTRY ]
        </button>
        {chain.length > 0 && (
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
            {chain.map((e) => (
              <div key={e.index} className="flex items-center gap-3 bg-black/40 border border-white/5 px-3 py-2">
                <span className="hud-data text-xs text-hud-cyan font-bold w-8">#{e.index}</span>
                <span className="hud-data text-[10px] text-hud-text-muted flex-1 font-mono truncate">{e.data_hash}</span>
                <span className="hud-label text-[9px]">{e.timestamp}</span>
                <span className={`w-2 h-2 rounded-full ${e.chain_valid ? "bg-hud-emerald" : "bg-hud-crimson"}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supply Chain Scanner */}
      <div className="hud-card p-4 flex flex-col gap-3 col-span-2">
        <div className="flex items-center gap-2 border-b border-hud-emerald/30 pb-2">
          <span className="w-2 h-2 bg-hud-emerald animate-pulse" />
          <span className="hud-title text-xs text-hud-emerald tracking-widest">SUPPLY CHAIN SCANNER</span>
        </div>
        <button onClick={scanSupply} className="self-start px-4 py-2 bg-hud-emerald/10 border border-hud-emerald text-hud-emerald hud-data text-xs hover:bg-hud-emerald hover:text-black transition-all cursor-pointer">
          [ SCAN package.json ]
        </button>
        {supplyReport && (
          <div className="bg-black/40 border border-white/10 p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="hud-data text-white">{supplyReport.total_packages} packages</span>
              <span className={`hud-data text-lg font-bold ${supplyReport.health_score >= 90 ? "text-hud-emerald" : supplyReport.health_score >= 60 ? "text-hud-amber" : "text-hud-crimson"}`}>
                {supplyReport.health_score.toFixed(0)}% HEALTH
              </span>
            </div>
            {supplyReport.flagged.length > 0 && (
              <div className="flex flex-col gap-1">
                {supplyReport.flagged.map((f, i) => (
                  <span key={i} className="text-[10px] text-hud-crimson bg-hud-crimson/10 px-2 py-1 border border-hud-crimson/20">{f}</span>
                ))}
              </div>
            )}
            {supplyReport.flagged.length === 0 && (
              <span className="hud-data text-[10px] text-hud-emerald">NO KNOWN VULNERABILITIES DETECTED</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalConsole;
