<div align="center">

# 🛡️ KAVACH
**Tactical Zero-Trust Firewall for Autonomous AI**

![Tauri](https://img.shields.io/badge/Tauri-v2-FFC107?logo=tauri&logoColor=white&style=for-the-badge) 
![Rust](https://img.shields.io/badge/Rust-Stable-000000?logo=rust&logoColor=white&style=for-the-badge) 
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge) 
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

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

## ⚡ The Arsenal: Core Features

Kavach `v1.0.0` is armed with an array of active defense mechanisms designed to outsmart and contain rogue agents.

### 🖥️ 2080 Sci-Fi Command Center (FUI)
Experience a high-density, "Spatial Computing" interface. Designed with a deep-void aesthetic, emerald telemetry streams, and radioactive amber alerts, Kavach provides professional-grade visibility without terminal clutter.

### 👻 Phantom Workspace (File-System Ghosting)
Activate a virtualized sandbox for destructive processes. When a restricted agent attempts to overwrite or delete sensitive code, Kavach intercepts the system call and redirects the action to a hidden phantom directory. **The agent believes it succeeded; your actual files remain completely untouched.**

### ⏳ Temporal Rollback (The "Undo" Engine)
Accidental AI deletions are no longer fatal. Kavach maintains a low-level, cryptographic micro-cache of file modifications. Did an AI mangle your configuration? A one-click **Rollback** restores the file to its exact state from milliseconds ago.

### 🕸️ Network Ghost Mode
Stop data exfiltration without crashing the agent's workflow. Kavach intercepts outbound network payloads to unauthorized domains, drops the data, and returns a spoofed `200 OK` success response to blind the malicious agent.

### 🧠 The Turing Protocol
Absolute hardware-level protection against RPA and synthetic interactions. Kavach actively rejects synthetic mouse injections (e.g., `LLMHF_INJECTED`) and utilizes adversarial UI noise to blind AI vision models. **Only a living human can click "Approve" on the firewall.**

### 🪤 Counter-Intelligence Traps
* **The Mirror Maze:** Deploy recursive directory traps with fake credentials to tarpit scraping agents.
* **Poison Context:** Inject mock "self-destruct" payloads into an agent's prompt stream to force a safe, programmatic shutdown.

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

* **The Faraday Clipboard:** Intercept and block background agents from reading your OS clipboard history without explicit user consent.
* **Biometric "Nuclear" Authorization:** Hook into native OS hardware (TouchID / Windows Hello) to require physical fingerprint verification before an agent can touch `CRITICAL_LOCKED` directories.
* **Blast Radius Predictor:** AST parsing to visually simulate what will break in your project *before* you approve an agent's file deletion.

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
