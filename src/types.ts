// Type definitions matching the Rust backend structs

export interface InterceptedAction {
  id: string;
  agent_name: string;
  action_type: string; // Loosened to allow "CRITICAL_VELOCITY | ..." etc.
  target_path: string;
  risk_level: "High" | "Medium" | "Low";
  timestamp: string;
  status: string; // Loosened for flexibility
}

export interface MonitoringStats {
  is_monitoring: boolean;
  monitored_path: string;
  total_intercepted: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

export interface SystemInfo {
  cpu_usage: number;
  memory_used: number;
  memory_total: number;
  process_count: number;
}
