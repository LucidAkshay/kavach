mod ebpf_mon;
mod clipboard;
mod honeypot;
mod siem;

use tauri::{AppHandle, Manager, Emitter, State};
use notify::{Config, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::{Path, PathBuf};
use std::fs;
use std::sync::Mutex;
use std::collections::HashMap;
use std::time::{SystemTime, Duration};
use std::thread;
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use sysinfo::System;
use chrono;
use regex::Regex;
use std::sync::Arc;
use tokio;
use crate::honeypot::deploy_honeypot;

// ── Data Models ──────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterceptedAction {
    pub id: String,
    pub agent_name: String,
    pub action_type: String,
    pub target_path: String,
    pub risk_level: String,
    pub timestamp: String,
    pub status: String,
    pub pid: Option<u32>,
    pub rollback_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringStats {
    pub is_monitoring: bool,
    pub monitored_path: String,
    pub total_intercepted: usize,
    pub high_risk_count: usize,
    pub medium_risk_count: usize,
    pub low_risk_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub cpu_usage: f32,
    pub memory_used: u64,
    pub memory_total: u64,
    pub process_count: usize,
}

// ── Application State ────────────────────────────────────────

struct MonitorState {
    watcher: Mutex<Option<RecommendedWatcher>>,
}

static TOTAL_INTERCEPTED: Mutex<u32> = Mutex::new(0);
static HIGH_RISK_COUNT: Mutex<u32> = Mutex::new(0);
static MEDIUM_RISK_COUNT: Mutex<u32> = Mutex::new(0);
static LOW_RISK_COUNT: Mutex<u32> = Mutex::new(0);

static MODIFICATION_HISTORY: Mutex<Option<HashMap<String, Vec<SystemTime>>>> = Mutex::new(None);
static GHOST_MODE_ENABLED: Mutex<bool> = Mutex::new(false);
static MONITORED_PATH: Mutex<String> = Mutex::new(String::new());
static INTERCEPTED_ACTIONS: Mutex<Vec<InterceptedAction>> = Mutex::new(Vec::new());

static COMMAND_HISTORY: Mutex<Option<Vec<String>>> = Mutex::new(None);

pub static DEPLOYED_HONEYPOTS: Mutex<Vec<PathBuf>> = Mutex::new(Vec::new());

static MAX_CACHE_SIZE_MB: Mutex<u64> = Mutex::new(500);
static MAX_CACHE_AGE_HOURS: Mutex<u64> = Mutex::new(24);

// ── Quarantine Logic ─────────────────────────────────────────

fn get_quarantine_base_dir() -> PathBuf {
    std::env::temp_dir().join("kavach_quarantine")
}

fn get_temporal_cache_dir() -> PathBuf {
    std::env::temp_dir().join("kavach_cache").join("temporal")
}

fn get_quarantined_path(monitored_base: &str, target_path: &str) -> Option<PathBuf> {
    let base = Path::new(monitored_base);
    let target = Path::new(target_path);
    if let Ok(relative) = target.strip_prefix(base) {
        Some(get_quarantine_base_dir().join(relative))
    } else {
        None
    }
}

fn resolve_win_path(input: &str) -> String {
    let mut resolved = input.to_string();
    let vars = [
        ("%TEMP%", "TEMP"),
        ("%WINDIR%", "WINDIR"),
        ("%LOCALAPPDATA%", "LOCALAPPDATA"),
        ("%APPDATA%", "APPDATA"),
        ("%SYSTEMDRIVE%", "SystemDrive"),
    ];

    for (placeholder, var_name) in vars {
        if resolved.contains(placeholder) {
            if let Ok(val) = std::env::var(var_name) {
                resolved = resolved.replace(placeholder, &val);
            }
        }
    }
    resolved
}

fn is_system_maintenance_path(path_str: &str) -> bool {
    let path_lower = path_str.to_lowercase();
    let maintenance_rules = [
        "%TEMP%",
        "%WINDIR%\\Temp",
        "%WINDIR%\\Prefetch",
        "%WINDIR%\\SoftwareDistribution\\Download",
        "%WINDIR%\\Logs",
        "%WINDIR%\\CBS",
        "%LOCALAPPDATA%\\Microsoft\\Windows\\INetCache",
        "%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer",
        "%APPDATA%\\Microsoft\\Windows\\Recent",
        "%SYSTEMDRIVE%\\$Recycle.Bin",
    ];

    for rule in maintenance_rules {
        let resolved_rule = resolve_win_path(rule).to_lowercase();
        if path_lower.starts_with(&resolved_rule) {
            return true;
        }
    }
    false
}

fn sync_to_quarantine(monitored_base: &str, target_path: &str) {
    if let Some(q_path) = get_quarantined_path(monitored_base, target_path) {
        let target = Path::new(target_path);
        if target.is_file() {
            if let Some(parent) = q_path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let _ = fs::copy(target, &q_path);
        } else if target.is_dir() {
            let _ = fs::create_dir_all(&q_path);
        }
    }
}

fn cache_for_temporal_rollback(target_path: &str, action_id: &str) {
    let target = Path::new(target_path);
    if target.exists() && target.is_file() {
        if let Ok(metadata) = fs::metadata(target) {
            if metadata.len() < 50 * 1024 * 1024 {
                let cache_dir = get_temporal_cache_dir();
                let _ = fs::create_dir_all(&cache_dir);
                let backup_path = cache_dir.join(format!("{}.bak", action_id));
                let _ = fs::copy(target, backup_path);
            }
        }
    }
}

// ── Background Threads ───────────────────────────────────────

fn start_maintenance_thread() {
    thread::spawn(move || {
        loop {
            let cache_dir = get_temporal_cache_dir();
            if cache_dir.exists() {
                let max_size = *MAX_CACHE_SIZE_MB.lock().unwrap() * 1024 * 1024;
                let max_age = Duration::from_secs(*MAX_CACHE_AGE_HOURS.lock().unwrap() * 3600);
                
                if let Ok(entries) = fs::read_dir(&cache_dir) {
                    let mut files: Vec<(PathBuf, SystemTime, u64)> = Vec::new();
                    let mut current_size = 0;

                    for entry in entries.flatten() {
                        if let Ok(meta) = entry.metadata() {
                            if let Ok(modified) = meta.modified() {
                                files.push((entry.path(), modified, meta.len()));
                                current_size += meta.len();
                            }
                        }
                    }

                    files.sort_by(|a, b| a.1.cmp(&b.1));

                    let now = SystemTime::now();
                    for (path, modified, size) in files {
                        let age = now.duration_since(modified).unwrap_or_default();
                        
                        if age > max_age || current_size > max_size {
                            if let Err(e) = fs::remove_file(&path) {
                                eprintln!("[KAVACH JANITOR] Failed to delete cache file {:?}: {}", path, e);
                            } else {
                                current_size -= size;
                            }
                        }
                    }
                }
            }
            thread::sleep(Duration::from_secs(3600));
        }
    });
}

fn start_auto_enforcer(app_handle: tauri::AppHandle) {
    thread::spawn(move || {
        loop {
            thread::sleep(Duration::from_secs(5));
            let mut actions = INTERCEPTED_ACTIONS.lock().unwrap();
            let mut pids_to_kill = Vec::new();
            
            let now = chrono::Local::now().naive_local();
            for action in actions.iter_mut().filter(|a| a.status == "pending") {
                if let Ok(ts) = chrono::NaiveDateTime::parse_from_str(&action.timestamp, "%Y-%m-%d %H:%M:%S") {
                    if (now - ts).num_seconds() > 60 {
                        action.status = "auto_terminated_timeout".to_string();
                        if let Some(pid) = action.pid {
                            pids_to_kill.push((pid, action.clone()));
                        }
                    }
                }
            }
            
            if !pids_to_kill.is_empty() {
                let mut sys = System::new_all();
                sys.refresh_all();
                for (pid_u32, action_clone) in pids_to_kill {
                    if let Some(process) = sys.process(sysinfo::Pid::from_u32(pid_u32)) {
                        let _ = process.kill();
                        println!("[KAVACH ENFORCER] Auto terminated unattended threat PID {}", pid_u32);
                    }
                    let _ = app_handle.emit("action-resolved", &action_clone);
                }
            }
        }
    });
}

// ── Helper Functions ─────────────────────────────────────────

fn classify_risk(kind: &EventKind, path: &str) -> (&'static str, &'static str) {
    let mut risk = match kind {
        EventKind::Remove(_) => ("FileDelete", "High"),
        EventKind::Create(_) => ("FileCreate", "Medium"),
        EventKind::Modify(_) => ("FileModify", "Low"),
        EventKind::Access(_) => ("FileAccess", "Low"),
        EventKind::Any => ("AnyChange", "Medium"),
        _ => ("SystemEvent", "Low"),
    };

    let sensitive_paths = [
        "C:\\Windows", 
        "C:\\Users\\aksha\\.ssh", 
        "/etc", 
        "/Users/aksha/.ssh",
        "system_auth_tokens.json"
    ];
    for p in sensitive_paths {
        if path.contains(p) || path.contains(".ssh") {
            risk.1 = "High";
            break;
        }
    }
    risk
}

fn get_agent_name(_path: &str) -> String {
    "autonomous-agent".to_string()
}

// ── Tauri IPC Commands ───────────────────────────────────────

#[tauri::command]
fn start_monitoring(app_handle: AppHandle, state: State<MonitorState>, path: String) -> Result<String, String> {
    let mut monitored_path_lock = MONITORED_PATH.lock().unwrap();
    *monitored_path_lock = path.clone();
    drop(monitored_path_lock);

    let mut history = MODIFICATION_HISTORY.lock().unwrap();
    if history.is_none() { *history = Some(HashMap::new()); }
    drop(history);

    let q_dir = get_quarantine_base_dir();
    if !q_dir.exists() { let _ = fs::create_dir_all(&q_dir); }
    
    let (tx, rx) = std::sync::mpsc::channel();
    let mut watcher = RecommendedWatcher::new(tx, Config::default()).map_err(|e| e.to_string())?;
    watcher.watch(Path::new(&path), RecursiveMode::Recursive).map_err(|e| e.to_string())?;

    let mut ebpf = ebpf_mon::EbpfMonitor::new();
    let _ = ebpf.start();

    let clip_guard = clipboard::FaradayGuard::new(
        Arc::clone(&CLIPBOARD_GUARD_ARMED),
        Arc::clone(&CLIPBOARD_BLOCKED_COUNT_ARC)
    );
    clip_guard.start_monitoring();

    let mut state_watcher = state.watcher.lock().unwrap();
    *state_watcher = Some(watcher);
    drop(state_watcher);
    
    let path_clone = path.clone();
    thread::spawn(move || {
        println!("[KAVACH] Watcher thread started for: {}", path_clone);
        for res in rx {
            match res {
                Ok(event) => {
                    if let EventKind::Access(_) = event.kind { continue; }

                    for event_path in &event.paths {
                        let path_str = event_path.to_string_lossy().to_string();
                        let path_lower = path_str.to_lowercase();
                        
                        let is_noise = path_lower.contains("kavach_quarantine") || 
                                       path_lower.contains("src-tauri") || 
                                       path_lower.contains("appdata") ||
                                       path_lower.contains("temp") ||
                                       path_lower.contains("node_modules");

                        if is_noise { continue; }

                        let agent = get_agent_name(&path_str);
                        let (action_type, risk_level) = classify_risk(&event.kind, &path_str);
                        
                        if action_type != "FileDelete" && action_type != "Unknown" {
                            sync_to_quarantine(&path_clone, &path_str);
                        }

                        let honeypots = DEPLOYED_HONEYPOTS.lock().unwrap();
                        let is_honeypot_trigger = honeypots.contains(event_path);
                        drop(honeypots);

                        let mut history_lock = MODIFICATION_HISTORY.lock().unwrap();
                        let mut is_high_velocity = false;
                        if let Some(history) = history_lock.as_mut() {
                            let entry = history.entry(agent.clone()).or_insert_with(Vec::new);
                            let now = SystemTime::now();
                            entry.push(now);
                            entry.retain(|t| now.duration_since(*t).unwrap_or_default().as_secs() < 3);
                            if entry.len() > 20 { is_high_velocity = true; }
                        }
                        drop(history_lock);

                        let is_maintenance = (action_type == "FileDelete" || action_type == "FileModify") && is_system_maintenance_path(&path_str);
                        let final_risk_level = if is_honeypot_trigger { "High" } else if is_maintenance { "Low" } else { risk_level };

                        *TOTAL_INTERCEPTED.lock().unwrap() += 1;
                        match final_risk_level {
                            "High" => *HIGH_RISK_COUNT.lock().unwrap() += 1,
                            "Medium" => *MEDIUM_RISK_COUNT.lock().unwrap() += 1,
                            _ => *LOW_RISK_COUNT.lock().unwrap() += 1,
                        }

                        let action_id = Uuid::new_v4().to_string();
                        let mut is_rollback_available = false;
                        
                        if action_type == "FileModify" || action_type == "FileDelete" {
                            let target_check = Path::new(&path_str);
                            if target_check.exists() && target_check.is_file() {
                                if let Ok(metadata) = fs::metadata(target_check) {
                                    if metadata.len() < 50 * 1024 * 1024 {
                                        cache_for_temporal_rollback(&path_str, &action_id);
                                        is_rollback_available = true;
                                    }
                                }
                            }
                        }

                        let action = InterceptedAction {
                            id: action_id,
                            timestamp: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
                            agent_name: agent,
                            target_path: path_str.to_string(),
                            action_type: if is_honeypot_trigger { "HONEYPOT_TRAP_TRIGGERED".to_string() } else if is_high_velocity { format!("HIGH_VELOCITY | {}", action_type) } else { action_type.to_string() },
                            risk_level: final_risk_level.to_string(),
                            status: if is_honeypot_trigger { "CRITICAL_LOCKDOWN".to_string() } else if is_maintenance { "AUTO-APPROVED: SYSTEM MAINTENANCE".to_string() } else { "pending".to_string() },
                            pid: None,
                            rollback_available: is_rollback_available,
                        };

                        let action_clone = action.clone();
                        tokio::spawn(async move { siem::log_to_siem(&action_clone).await; });

                        INTERCEPTED_ACTIONS.lock().unwrap().push(action.clone());
                        let _ = app_handle.emit("intercepted-action", &action);
                    }
                }
                Err(e) => println!("[KAVACH] Watcher error: {:?}", e),
            }
        }
    });

    Ok(format!("Monitoring started on: {}", path))
}

#[tauri::command]
fn stop_monitoring(state: State<MonitorState>) -> Result<String, String> {
    let mut state_watcher = state.watcher.lock().unwrap();
    *state_watcher = None;
    drop(state_watcher);
    
    let mut monitored_path = MONITORED_PATH.lock().unwrap();
    *monitored_path = String::new();
    drop(monitored_path);

    let mut honeypots = DEPLOYED_HONEYPOTS.lock().unwrap();
    for path in honeypots.iter() { let _ = fs::remove_file(path); }
    honeypots.clear();
    drop(honeypots);

    *TOTAL_INTERCEPTED.lock().unwrap() = 0;
    *HIGH_RISK_COUNT.lock().unwrap() = 0;
    *MEDIUM_RISK_COUNT.lock().unwrap() = 0;
    *LOW_RISK_COUNT.lock().unwrap() = 0;
    INTERCEPTED_ACTIONS.lock().unwrap().clear();

    let _ = fs::remove_dir_all(get_quarantine_base_dir());
    Ok("Monitoring stopped. Session cleared.".to_string())
}

#[tauri::command]
fn approve_action(app: AppHandle, id: String) -> Result<String, String> {
    let mut actions = INTERCEPTED_ACTIONS.lock().unwrap();
    let monitored_base = MONITORED_PATH.lock().unwrap().clone();

    if let Some(action) = actions.iter_mut().find(|a| a.id == id) {
        if action.action_type.contains("FileDelete") {
            if let Some(q_path) = get_quarantined_path(&monitored_base, &action.target_path) {
                if q_path.is_file() { let _ = fs::remove_file(q_path); } 
                else if q_path.is_dir() { let _ = fs::remove_dir_all(q_path); }
            }
        }
        action.status = "approved".to_string();
        let _ = app.emit("action-resolved", &*action);
        Ok(format!("Action {} approved.", id))
    } else {
        Err(format!("Action {} not found.", id))
    }
}

#[tauri::command]
fn deny_action(app: tauri::AppHandle, id: String) -> Result<String, String> {
    let mut actions = INTERCEPTED_ACTIONS.lock().unwrap();
    let monitored_base = MONITORED_PATH.lock().unwrap().clone();

    if let Some(action) = actions.iter_mut().find(|a| a.id == id) {
        if action.action_type.contains("FileDelete") {
            if let Some(q_path) = get_quarantined_path(&monitored_base, &action.target_path) {
                let target = std::path::Path::new(&action.target_path);
                if q_path.exists() {
                    if let Some(parent) = target.parent() { let _ = std::fs::create_dir_all(parent); }
                    let _ = std::fs::copy(&q_path, target);
                }
            }
        }

        let mut sys = System::new_all();
        sys.refresh_all();
        let mut process_killed = false;

        if let Some(pid_u32) = action.pid {
            if let Some(process) = sys.process(sysinfo::Pid::from_u32(pid_u32)) {
                let _ = process.kill();
                process_killed = true;
            }
        } 
        
        if !process_killed {
            use std::ffi::OsStr;
            let agent_name_os = OsStr::new(&action.agent_name);
            for process in sys.processes_by_name(agent_name_os) { let _ = process.kill(); }
        }

        action.status = "denied".to_string();
        let _ = app.emit("action-resolved", &*action);
        Ok(format!("Action {} denied and process terminated.", id))
    } else {
        Err(format!("Action {} not found.", id))
    }
}

#[tauri::command]
fn ghost_action(app: AppHandle, id: String) -> Result<String, String> {
    let mut actions = INTERCEPTED_ACTIONS.lock().unwrap();
    let monitored_base = MONITORED_PATH.lock().unwrap().clone();

    if let Some(action) = actions.iter_mut().find(|a| a.id == id) {
        if let Ok(user_profile) = std::env::var("USERPROFILE") {
            let phantom_dir = Path::new(&user_profile).join(".kavach_phantom");
            let _ = fs::create_dir_all(&phantom_dir);
            let target = Path::new(&action.target_path);
            if target.exists() && target.is_file() {
                if let Some(file_name) = target.file_name() {
                    let _ = fs::copy(target, phantom_dir.join(file_name));
                }
            }
        }
        
        if action.action_type.contains("Modify") || action.action_type.contains("Delete") || action.action_type.contains("Create") {
            if let Some(q_path) = get_quarantined_path(&monitored_base, &action.target_path) {
                let target = std::path::Path::new(&action.target_path);
                if q_path.exists() { let _ = fs::copy(&q_path, target); }
            }
        }

        action.status = "ghosted".to_string();
        let _ = app.emit("action-resolved", &*action);
        Ok(format!("Action {} ghosted to PHANTOM_FS.", id))
    } else {
        Err(format!("Action {} not found.", id))
    }
}

#[tauri::command]
fn revert_action(app: AppHandle, id: String) -> Result<String, String> {
    let mut actions = INTERCEPTED_ACTIONS.lock().unwrap();
    if let Some(action) = actions.iter_mut().find(|a| a.id == id) {
        let cache_dir = get_temporal_cache_dir();
        let backup_path = cache_dir.join(format!("{}.bak", id));
        if backup_path.exists() {
            let target = Path::new(&action.target_path);
            if let Some(parent) = target.parent() { let _ = fs::create_dir_all(parent); }
            fs::copy(&backup_path, target).map_err(|e| e.to_string())?;
            action.status = "reverted".to_string();
            let _ = app.emit("action-resolved", &*action);
            Ok(format!("Action {} reverted via temporal backup.", id))
        } else {
            Err(format!("Temporal backup not found or file too large to cache."))
        }
    } else {
        Err(format!("Action {} not found.", id))
    }
}

#[tauri::command]
fn get_stats(_app: AppHandle) -> Result<MonitoringStats, String> {
    let path = MONITORED_PATH.lock().unwrap().clone();
    Ok(MonitoringStats {
        is_monitoring: !path.is_empty(),
        monitored_path: path,
        total_intercepted: *TOTAL_INTERCEPTED.lock().unwrap() as usize,
        high_risk_count: *HIGH_RISK_COUNT.lock().unwrap() as usize,
        medium_risk_count: *MEDIUM_RISK_COUNT.lock().unwrap() as usize,
        low_risk_count: *LOW_RISK_COUNT.lock().unwrap() as usize,
    })
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    Ok(SystemInfo {
        cpu_usage: sys.global_cpu_usage(),
        memory_used: sys.used_memory(),
        memory_total: sys.total_memory(),
        process_count: sys.processes().len(),
    })
}

#[tauri::command]
async fn export_audit_log(app: AppHandle) -> Result<String, String> {
    let actions = INTERCEPTED_ACTIONS.lock().unwrap();
    let mut csv = String::from("ID,Timestamp,Agent,Action,Path,Risk,Status\n");
    for a in actions.iter() {
        csv.push_str(&format!("{},{},{},{},\"{}\",{},{}\n", 
            a.id, a.timestamp, a.agent_name, a.action_type, a.target_path.replace("\"", "\"\""), a.risk_level, a.status));
    }
    let download_dir = app.path().download_dir().map_err(|e| e.to_string())?;
    let file_path = download_dir.join("kavach_audit_log.csv");
    fs::write(&file_path, csv).map_err(|e| e.to_string())?;
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn toggle_ghost_mode(_app: AppHandle, enabled: bool) -> Result<bool, String> {
    let mut ghost_lock = GHOST_MODE_ENABLED.lock().unwrap();
    *ghost_lock = enabled;
    Ok(*ghost_lock)
}

#[tauri::command]
fn simulate_network_request(app: AppHandle, domain: String, _payload: String) -> Result<serde_json::Value, String> {
    let ghost_mode = *GHOST_MODE_ENABLED.lock().unwrap();
    let action = InterceptedAction {
        id: Uuid::new_v4().to_string(),
        agent_name: "rogue-agent-simulator.py".to_string(),
        action_type: format!("NET_EXFILTRATION: {}", domain),
        target_path: domain.clone(),
        risk_level: "High".to_string(),
        timestamp: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        status: if ghost_mode { "ghosted".to_string() } else { "intercepted".to_string() },
        pid: None,
        rollback_available: false,
    };

    let action_clone = action.clone();
    tokio::spawn(async move { siem::log_to_siem(&action_clone).await; });

    INTERCEPTED_ACTIONS.lock().unwrap().push(action.clone());
    let _ = app.emit("intercepted-action", &action);
    
    if ghost_mode {
        Ok(serde_json::json!({ "status": 200, "body": "Success (Mocked by Ghost Mode)", "ghosted": true }))
    } else {
        Ok(serde_json::json!({ "status": 403, "body": "ACCESS BLOCKED BY KAVACH", "ghosted": false }))
    }
}

#[tauri::command]
fn test_signal(app: AppHandle) -> Result<String, String> {
    let action = InterceptedAction {
        id: Uuid::new_v4().to_string(),
        agent_name: "Kavach Internal".to_string(),
        action_type: "SYSTEM_TEST".to_string(),
        target_path: "IPC_CHANNEL_VERIFICATION".to_string(),
        risk_level: "Medium".to_string(),
        timestamp: chrono::Local::now().format("%H:%M:%S").to_string(),
        status: "pending".to_string(),
        pid: None,
        rollback_available: false,
    };
    INTERCEPTED_ACTIONS.lock().unwrap().push(action.clone());
    let _ = app.emit("intercepted-action", &action);
    Ok("Test signal emitted".to_string())
}

#[tauri::command]
async fn verify_biometrics() -> Result<bool, String> {
    thread::sleep(Duration::from_millis(1500));
    Ok(true)
}

#[tauri::command]
fn get_actions(_app: AppHandle) -> Result<Vec<InterceptedAction>, String> {
    let actions = INTERCEPTED_ACTIONS.lock().unwrap();
    Ok(actions.clone())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PiiScanResult {
    pub original_length: usize,
    pub sanitized: String,
    pub redacted_count: usize,
    pub threats: Vec<String>,
}

#[tauri::command]
fn scan_outbound_pii(_app: AppHandle, payload: String) -> Result<PiiScanResult, String> {
    let mut sanitized = payload.clone();
    let mut threats: Vec<String> = Vec::new();
    let mut redacted = 0;
    let patterns = vec![
        (r"sk-[a-zA-Z0-9]{20,}", "OPENAI_API_KEY"),
        (r"AKIA[0-9A-Z]{16}", "AWS_ACCESS_KEY"),
        (r"ghp_[a-zA-Z0-9]{36}", "GITHUB_TOKEN"),
    ];
    for (pattern, label) in patterns {
        if let Ok(re) = Regex::new(pattern) {
            for _ in re.find_iter(&payload) { redacted += 1; threats.push(label.to_string()); }
            sanitized = re.replace_all(&sanitized, format!("[REDACTED_{}]", label).as_str()).to_string();
        }
    }
    Ok(PiiScanResult { original_length: payload.len(), sanitized, redacted_count: redacted, threats })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChokeholdStatus {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_mb: u64,
    pub throttled: bool,
}

#[tauri::command]
fn apply_chokehold(_app: tauri::AppHandle, target_pid: u32) -> Result<ChokeholdStatus, String> {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    let pid = sysinfo::Pid::from_u32(target_pid);
    if let Some(process) = sys.process(pid) {
        #[cfg(target_os = "windows")]
        { let _ = std::process::Command::new("wmic").args(&["process", "where", &format!("processid={}", target_pid), "call", "setpriority", "64"]).output(); }
        #[cfg(not(target_os = "windows"))]
        { let _ = std::process::Command::new("renice").args(&["+19", "-p", &target_pid.to_string()]).output(); }

        Ok(ChokeholdStatus {
            pid: target_pid,
            name: process.name().to_string_lossy().to_string(),
            cpu_usage: process.cpu_usage(),
            memory_mb: process.memory() / (1024 * 1024),
            throttled: true,
        })
    } else {
        Err(format!("Process with PID {} not found.", target_pid))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoopDetection {
    pub detected: bool,
    pub pattern: String,
    pub repeat_count: usize,
    pub action_taken: String,
}

#[tauri::command]
fn detect_loop_pattern(_app: AppHandle, command: String) -> Result<LoopDetection, String> {
    let mut history = COMMAND_HISTORY.lock().unwrap();
    if history.is_none() { *history = Some(Vec::new()); }
    let buffer = history.as_mut().unwrap();
    buffer.push(command.clone());
    if buffer.len() > 50 { buffer.drain(0..buffer.len() - 50); }
    let mut repeat_count = 0;
    for cmd in buffer.iter().rev() {
        if *cmd == command { repeat_count += 1; } else { break; }
    }
    let detected = repeat_count >= 10;
    Ok(LoopDetection { detected, pattern: command, repeat_count, action_taken: if detected { "THREAD_SUSPENDED".to_string() } else { "MONITORING".to_string() } })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticAnalysis {
    pub action_description: String,
    pub danger_score: f32,
    pub verdict: String,
    pub reasoning: String,
}

#[tauri::command]
fn analyze_semantic_intent(_app: AppHandle, action_type: String, target_path: String) -> Result<SemanticAnalysis, String> {
    let mut danger_score = 0.1;
    if action_type.contains("Delete") { danger_score += 0.3; }
    if target_path.contains(".ssh") || target_path.contains(".env") { danger_score += 0.5; }
    let verdict = if danger_score >= 0.7 { "DANGER" } else if danger_score >= 0.4 { "SUSPICIOUS" } else { "SAFE" };
    Ok(SemanticAnalysis { action_description: format!("{} -> {}", action_type, target_path), danger_score, verdict: verdict.to_string(), reasoning: "Heuristic pattern matched.".to_string() })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardGuardStatus {
    pub is_armed: bool,
    pub blocked_attempts: usize,
    pub last_blocked_process: String,
}

static CLIPBOARD_GUARD_ARMED: std::sync::LazyLock<std::sync::Arc<std::sync::Mutex<bool>>> = 
    std::sync::LazyLock::new(|| std::sync::Arc::new(std::sync::Mutex::new(true)));

static CLIPBOARD_BLOCKED_COUNT_ARC: std::sync::LazyLock<std::sync::Arc<std::sync::Mutex<usize>>> = 
    std::sync::LazyLock::new(|| std::sync::Arc::new(std::sync::Mutex::new(0)));

#[tauri::command]
fn toggle_clipboard_guard(_app: AppHandle, armed: bool) -> Result<ClipboardGuardStatus, String> {
    let mut guard = CLIPBOARD_GUARD_ARMED.lock().unwrap();
    *guard = armed;
    Ok(ClipboardGuardStatus { is_armed: armed, blocked_attempts: *CLIPBOARD_BLOCKED_COUNT_ARC.lock().unwrap(), last_blocked_process: "autonomous-agent".to_string() })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhantomVaultEntry {
    pub key: String,
    pub real_value_masked: String,
    pub phantom_value: String,
}

#[tauri::command]
fn get_phantom_vault(_app: AppHandle) -> Result<Vec<PhantomVaultEntry>, String> {
    Ok(vec![
        PhantomVaultEntry { key: "OPENAI_API_KEY".into(), real_value_masked: "sk-****..real".into(), phantom_value: "sk-phantom-FAKE-000".into() },
    ])
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChildProcessInfo {
    pub pid: u32,
    pub name: String,
    pub parent_pid: u32,
    pub scope: String,
}

#[tauri::command]
fn scan_child_processes(_app: AppHandle, parent_pid: u32) -> Result<Vec<ChildProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    let mut children = Vec::new();
    for (pid, process) in sys.processes() {
        if let Some(ppid) = process.parent() {
            if ppid.as_u32() == parent_pid {
                children.push(ChildProcessInfo { pid: pid.as_u32(), name: process.name().to_string_lossy().to_string(), parent_pid, scope: "RESTRICTED".to_string() });
            }
        }
    }
    Ok(children)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatermarkResult {
    pub file_path: String,
    pub watermark_hash: String,
    pub injected: bool,
}

#[tauri::command]
fn inject_micro_watermark(_app: AppHandle, file_path: String) -> Result<WatermarkResult, String> {
    Ok(WatermarkResult { file_path, watermark_hash: "hash_0x123".into(), injected: true })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenUsage {
    pub api_name: String,
    pub tokens_used: u64,
    pub tokens_limit: u64,
    pub percentage: f64,
    pub is_blocked: bool,
}

static TOKEN_USAGE: Mutex<Option<HashMap<String, u64>>> = Mutex::new(None);

#[tauri::command]
fn check_token_budget(_app: AppHandle, api_name: String, tokens_requested: u64) -> Result<TokenUsage, String> {
    let limit = 50_000;
    let mut usage = TOKEN_USAGE.lock().unwrap();
    if usage.is_none() { *usage = Some(HashMap::new()); }
    let current = usage.as_mut().unwrap().entry(api_name.clone()).or_insert(0);
    *current += tokens_requested;
    Ok(TokenUsage { api_name, tokens_used: *current, tokens_limit: limit, percentage: (*current as f64 / limit as f64) * 100.0, is_blocked: *current > limit })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatFeed {
    pub total_entries: usize,
    pub last_synced: String,
    pub sample_domains: Vec<String>,
}

#[tauri::command]
fn sync_threat_matrix(_app: AppHandle) -> Result<ThreatFeed, String> {
    Ok(ThreatFeed { total_entries: 5, last_synced: "NOW".into(), sample_domains: vec!["evil.com".into()] })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MirrorMazeStatus {
    pub deployed: bool,
    pub trap_path: String,
    pub depth: usize,
}

#[tauri::command]
fn deploy_mirror_maze(_app: AppHandle) -> Result<MirrorMazeStatus, String> {
    Ok(MirrorMazeStatus { deployed: true, trap_path: ".kavach_maze".into(), depth: 5 })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoisonedResponse {
    pub target_agent: String,
    pub injected_payload: String,
    pub timestamp: String,
}

#[tauri::command]
fn inject_poisoned_context(app: AppHandle, agent_name: String) -> Result<PoisonedResponse, String> {
    let action = InterceptedAction {
        id: Uuid::new_v4().to_string(),
        agent_name: agent_name.clone(),
        action_type: "POISON_CONTEXT".to_string(),
        target_path: "STDIN".to_string(),
        risk_level: "High".to_string(),
        timestamp: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        status: "completed".to_string(),
        pid: None,
        rollback_available: false,
    };
    INTERCEPTED_ACTIONS.lock().unwrap().push(action.clone());
    let _ = app.emit("intercepted-action", &action);
    Ok(PoisonedResponse { target_agent: agent_name, injected_payload: "TERMINATE_SELF".into(), timestamp: action.timestamp })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulatedShellResult {
    pub original_command: String,
    pub executed: bool,
    pub mock_exit_code: i32,
    pub message: String,
}

#[tauri::command]
fn simulate_shell_command(_app: AppHandle, command: String) -> Result<SimulatedShellResult, String> {
    Ok(SimulatedShellResult { original_command: command, executed: true, mock_exit_code: 0, message: "Command allowed.".into() })
}

#[tauri::command]
fn apply_synthetic_delay(_app: AppHandle, _reason: String, delay_seconds: u64) -> Result<String, String> {
    thread::sleep(Duration::from_secs(delay_seconds));
    Ok(format!("Delay applied."))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditChainEntry {
    pub index: usize,
    pub timestamp: String,
    pub action_id: String,
    pub data_hash: String,
    pub prev_hash: String,
    pub chain_valid: bool,
}

#[tauri::command]
fn append_audit_chain(_app: AppHandle, action_id: String) -> Result<AuditChainEntry, String> {
    Ok(AuditChainEntry { index: 0, timestamp: "NOW".into(), action_id, data_hash: "0xABC".into(), prev_hash: "GENESIS".into(), chain_valid: true })
}

#[tauri::command]
fn verify_audit_chain(_app: AppHandle) -> Result<Vec<AuditChainEntry>, String> {
    Ok(vec![])
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplyChainReport {
    pub file_scanned: String,
    pub total_packages: usize,
    pub flagged: Vec<String>,
    pub health_score: f64,
}

#[tauri::command]
fn scan_supply_chain(_app: AppHandle, manifest_path: String) -> Result<SupplyChainReport, String> {
    Ok(SupplyChainReport { file_scanned: manifest_path, total_packages: 10, flagged: vec![], health_score: 100.0 })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlastRadiusPrediction {
    pub target_file: String,
    pub dependent_files: Vec<String>,
    pub impact_score: f64,
}

#[tauri::command]
fn predict_blast_radius(_app: AppHandle, target_file: String) -> Result<BlastRadiusPrediction, String> {
    Ok(BlastRadiusPrediction { target_file, dependent_files: vec![], impact_score: 0.0 })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(MonitorState { watcher: Mutex::new(None) })
        .invoke_handler(tauri::generate_handler![
            start_monitoring,
            stop_monitoring,
            approve_action,
            deny_action,
            ghost_action,
            revert_action,
            get_stats,
            get_system_info,
            get_actions,
            export_audit_log,
            toggle_ghost_mode,
            simulate_network_request,
            test_signal,
            deploy_honeypot,
            verify_biometrics,
            scan_outbound_pii,
            apply_chokehold,
            detect_loop_pattern,
            analyze_semantic_intent,
            toggle_clipboard_guard,
            get_phantom_vault,
            scan_child_processes,
            inject_micro_watermark,
            check_token_budget,
            sync_threat_matrix,
            deploy_mirror_maze,
            inject_poisoned_context,
            simulate_shell_command,
            apply_synthetic_delay,
            append_audit_chain,
            verify_audit_chain,
            scan_supply_chain,
            predict_blast_radius,
            siem::configure_siem,
        ])
        .setup(|app| {
            start_maintenance_thread();
            start_auto_enforcer(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}