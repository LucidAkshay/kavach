<div align="center">

# 🛡️ KAVACH
**Tactical Zero-Trust Firewall for Autonomous AI**

![Tauri](https://img.shields.io/badge/Tauri-v2-FFC107?logo=tauri&logoColor=white&style=for-the-badge) 
![Rust](https://img.shields.io/badge/Rust-Stable-000000?logo=rust&logoColor=white&style=for-the-badge) 
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge) 
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

<br>

<a href="https://www.producthunt.com/products/kavach?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-kavach" target="_blank" rel="noopener noreferrer"><img alt="Kavach - Tactical Zero-Trust OS Firewall for Local AI Agents | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1098249&amp;theme=light&amp;t=1773791260859"></a>

<br>
<br>

![Kavach Dashboard Demo](./kavach-demo.gif)

<br>

> **Kavach** (Sanskrit for "Armor") is a military-grade, zero-trust security layer designed exclusively to restrain, monitor, and deceive autonomous AI agents, local LLMs, and RPA scripts operating on your machine.

</div>

---

## 🛰️ The Threat & The Shield

Autonomous AI agents (like OpenClaw, AutoGPT, or custom LangChain scripts) are revolutionary, but they are inherently volatile. When they operate on your local file system, they move at superhuman speeds. A single hallucination or ill-prompted loop can delete production databases, overwrite source code, or exfiltrate private `.env` keys to third-party servers.

Passive monitoring is not enough. **Kavach is the emergency brake.**

Sitting silently between the AI and your OS kernel, Kavach does not just "detect" threats—it **intercepts** them. Through a high-fidelity, spatial UI, it grants you absolute tactical control over your machine's perimeter.

---

## ⚡ The Arsenal: Comprehensive Capabilities

Kavach `v1.0.0` is armed with an exhaustive array of active defense mechanisms, operating at both the kernel and application layers to outsmart and contain rogue agents.

### 🌌 Flagship Tactical Mechanics
* **Phantom Workspace (File-System Ghosting):** Intercepts destructive file operations and silently redirects them to a hidden `.kavach_phantom` directory. The agent believes it succeeded; your actual files remain untouched.
* **Temporal Rollback (The "Undo" Engine):** Automatic 50MB-capped cryptographic caching of all file modifications, enabling instant 1-click restoration of any mangled file.
* **The Turing Protocol (Anti-RPA Force):** Actively rejects synthetic mouse injections (`LLMHF_INJECTED`) and utilizes randomized 3-character Auth Codes to ensure only a human can override the firewall.
* **Network Ghost Mode:** Spoofs high-risk outbound requests (RU/CN/KP nodes) with mock `200 OK` success responses, neutralizing exfiltration without alerting the agent.
* **Honeypot Decoy Architecture:** Deploys a "sugar-trap" `system_auth_tokens.json` file. Any process attempting to read it triggers an immediate High-Risk Lockdown.

### 🦀 Core Security Engine (Rust Layer)
* **Zero-Trust OS Monitoring:** Real-time, low-level system call interception utilizing a multi-threaded `notify` watcher for extreme performance.
* **The Janitor Protocol:** Intelligent auto-whitelisting of standard Windows system maintenance paths (`%TEMP%`, `Prefetch`, `Logs`) to eliminate alert fatigue.
* **High-Velocity Loop Break:** Heuristic detection of repetitive command patterns (e.g., recursive `npm install` loops) to force automatic agent suspension.
* **Biometric Hardshake:** Simulated hardware-level authentication requirements (Windows Hello / TouchID) for any modification to critical OS directories.
* **Aggressive Kernel-Level Filtering:** Drops thousands of background OS noise events per second before they ever cross the IPC bridge, ensuring 0% UI lag.

### 🧠 Category 1: The Brain (Behavioral Analysis)
* **Gag Order (PII Sanitizer):** Real-time entropy and regex scanning for OpenAI/AWS keys, credit cards, and emails in outbound strings.
* **Chokehold (Resource Throttling):** Dynamic monitoring and CPU/RAM usage capping for target agent PIDs using `sysinfo`.
* **Semantic Intent Engine:** Heuristic danger scoring that analyzes the "why" behind a file deletion or modification to predict malicious intent.

### 🛡️ Category 2: The Shield (OS Hardening)
* **Faraday Clipboard Guard:** Active blocking of unauthorized clipboard read/write attempts by background automated processes.
* **Phantom Vault:** Virtualized `.env` injection system that serves mock credentials to untrustworthy agents while masking real values.
* **Child-Process Quarantine:** Hierarchical scanning that automatically restricts permissions for any process spawned by a monitored agent.

### 🚪 Category 3: The Gate (Network & DLP)
* **Micro-Watermarking:** Forensically injects zero-width Unicode characters into sensitive code exports for leak tracking.
* **Token Burn-Rate Limiter:** Implementation of a 50k token/hr hard cap for AI APIs with real-time HUD tracking.
* **Zero-Day Threat Matrix:** Real-time synchronization with C2 domain blocklists to identify known malware nodes.

### 🪤 Category 4: The Trap (Counter-Intelligence)
* **Mirror Maze:** Deploys a 5-level recursive directory trap with fake credentials to tarpit and confuse scraping agents.
* **Poison Context Injection:** Feeds mock `TERMINATE_SELF` and `REVOKED_AUTH` payloads into an agent's stdin buffer.
* **Simulated Shell:** Intercepts destructive commands (like `rm -rf /`) and returns fake "Success" exit codes to the agent.
* **Synthetic Delay (Tarpitting):** Programmable 5-60s execution delays to throttle and frustrate brute-force automated attacks.

### 📦 Category 5: The Black Box (Forensics)
* **Cryptographic Ledger:** A blockchain-style, FNV-1a hash chain that ensures audit logs are immutable and tamper-proof.
* **Supply Chain Auditor:** Real-time CVE scanning against the workspace's `package.json` for known-malware dependencies.
* **Predictive Blast Radius:** Recursive import scanner that visually maps exactly what will break in your project before you approve a file deletion.

### 🖥️ 2080 Command Center (UI/UX)
* **FUI Tactical Dashboard:** A hyper-dense HUD featuring emerald telemetry, radioactive amber alerts, and a micro-grid CSS overlay.
* **Geo-Spatial Threat Map:** 3D wireframe globe visualization of outbound exfiltration trajectories.
* **Character-Scramble Animation:** 800ms "Monospace Decryption" effects for high-priority threat logs in the Interception Matrix.
* **One-Click Forensic Export:** Generates comprehensive, localized CSV reports for professional security audits.

---

## ⚙️ Under the Hood (Architecture)

Kavach is built for absolute performance and zero latency, running entirely locally on your machine with **zero cloud dependencies**.

* **The Engine (Rust):** The core interception logic, OS-level hooks, and cryptographic file caching are written in Rust for memory safety, concurrency, and bare-metal speed.
* **The Command Center (React/TS):** The FUI dashboard operates in an isolated webview, ensuring the UI thread never blocks the security engine.
* **The Bridge (Tauri):** Secure, asynchronous Inter-Process Communication (IPC) bridges the frontend dashboard and the kernel-level watcher.
* **The Ledger (SQLite):** All telemetry, temporal rollback states, and audit logs are stored locally in an encrypted, high-speed SQLite database.

---

## 💻 Zero-Config Deployment

Kavach acts as an emergency brake for your operating system and requires deep system access, but installation is entirely frictionless. No complex dependencies or kernel compiling required.

1. **Download:** Grab the latest `.exe` (Windows) or `.dmg` (macOS) from the **[Releases Page](../../releases)**.
2. **Launch:** Run `AkshaysKavach.exe`. *(Note: Windows requires running as Administrator for process interception; macOS requires Full Disk Access/Accessibility permissions upon first launch).*
3. **Arm:** Select your workspace directory in the UI. Kavach immediately locks down the perimeter.

---

## 🚀 Roadmap: What's Next in v2.0

We are continuously expanding the perimeter. Planned features for the next major deployment:

* **Linux Native Support:** Extending the low-level Rust `notify` hooks to support `eBPF` for Ubuntu/Debian environments.
* **Multi-Agent Swarm Sandbox:** Network-isolated environments for coordinating multiple agents simultaneously without cross-contamination.
* **Decentralized Threat Intelligence:** Opt-in, privacy-preserving telemetry to share zero-day AI behavioral patterns across the Kavach user network.

---

## ⚠️ Troubleshooting & False Positives

Because Kavach is a low-level, compiled security executable that actively monitors other processes, your operating system's default antivirus may flag it as suspicious upon the first download. **This is a standard false positive for new, unsigned security tools.**

* **Windows SmartScreen:** If blocked, click `More info` -> `Run anyway`.
* **macOS Gatekeeper:** If you receive an "unidentified developer" warning, open `System Settings` -> `Privacy & Security`, scroll down, and click `Open Anyway` for Kavach.
* **Agent Alert Fatigue:** If Kavach is throwing too many Veto alerts for standard OS background tasks, ensure your **System Maintenance** trust scopes are toggled ON in the configuration panel.

---

## 📞 Direct Line & Feedback

Kavach features a "Direct Line" encrypted communication module for users to report anomalies, suggest features, or collaborate. 

* **Developer:** Akshay Sharma
* **Feedback:** Use the **[ COMM LINK ]** terminal button inside the application to format and send encrypted feedback directly to the developer's inbox.

---

## 📜 License

Kavach is proudly released as freeware under the **MIT License**. Permanent attribution to **Akshay Sharma** is required in all forks, distributions, and derivatives.
