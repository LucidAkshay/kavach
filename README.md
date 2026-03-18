<div align="center">

# 🛡️ KAVACH
**Tactical AI Workspace Monitor & EDR**

![Tauri](https://img.shields.io/badge/Tauri-v2-FFC107?logo=tauri&logoColor=white&style=for-the-badge) 
![Rust](https://img.shields.io/badge/Rust-Stable-000000?logo=rust&logoColor=white&style=for-the-badge) 
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge) 
![License](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)

<br>

<a href="https://www.producthunt.com/products/kavach?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-kavach" target="_blank" rel="noopener noreferrer"><img alt="Kavach | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1098249&theme=light&t=1773791260859"></a>

<br>
<br>

![Kavach Dashboard Demo](./kavach-demo.gif)

<br>

> **Kavach** (Sanskrit for "Armor") is an open source Endpoint Detection and Response (EDR) layer designed exclusively to restrain, monitor, and remediate autonomous AI agents and local LLMs operating on your machine.

</div>

***

## 🛰️ The Threat & The Observer

Autonomous AI agents are revolutionary, but they are inherently volatile. When they operate on your local file system, they move at superhuman speeds. A single hallucination can delete production databases, overwrite source code, or exfiltrate private API keys.

**Architecture Transparency:** Kavach v1.0 operates as a high performance asynchronous file system observer using Userland APIs. It monitors designated workspaces, quarantines malicious actions, and provides immediate remediation tools. It is an EDR monitor, not a strict synchronous sandbox. True system call blocking requires kernel drivers, which are slated for our v1.2 roadmap.

***

## ⚡ The Arsenal : Active Defense Mechanisms

Kavach is armed with an exhaustive array of active defense mechanisms operating at the application layer to outsmart and contain rogue agents.

### 🌌 Flagship Tactical Mechanics
* **Phantom Workspace:** Intercepts destructive file operations (Modify, Delete, Create) and silently routes them to a hidden `.kavach_phantom` directory to trap malicious payloads.
* **The Auto Enforcer:** A ruthless background Rust thread. If an intercepted action sits pending in the UI for more than 60 seconds, Kavach automatically issues a hard OS termination signal to the rogue agent PID.
* **Temporal Rollback:** Automatic cryptographic caching of file modifications. If a file is under 50MB, Kavach enables instant 1 click restoration. Large files are dynamically flagged in the UI as ineligible for rollback.
* **Honeypot Tripwire Architecture:** Safely deploys a "sugar trap" `system_auth_tokens.json` file. Any process attempting to read or modify the decoy instantly triggers a High Risk lockdown and a distinct TRAP TRIGGERED alarm. Decoys are automatically scrubbed when the session ends.

### 🦀 Core Security Engine (Rust Layer)
* **High Velocity Loop Break:** Heuristic detection of repetitive command patterns (e.g. recursive `npm install` loops) to force automatic agent suspension.
* **The Janitor Protocol:** Intelligent auto whitelisting of standard Windows system maintenance paths (`%TEMP%`, `Prefetch`, `Logs`) to eliminate alert fatigue.
* **PID Chokehold:** Dynamic monitoring and CPU usage throttling. Instantly drops a rogue agent's OS priority to IDLE using Windows WMIC or POSIX renice commands.

### 🧠 The Brain & The Shield
* **Gag Order (PII Sanitizer):** Real time entropy and regex scanning for OpenAI AWS keys, credit cards, and emails in outbound strings.
* **Faraday Clipboard Guard:** Actively calculates Shannon Entropy on your OS clipboard. If it detects a stolen secret, it instantly overwrites your clipboard with a decoy string to prevent pasting and exfiltration.
* **Child Process Quarantine:** Hierarchical scanning that tracks and restricts permissions for any process spawned by a monitored parent agent.

### 📦 The Black Box (Forensics)
* **Cryptographic Ledger:** A blockchain style FNV hash chain that ensures audit logs are immutable and tamper proof.
* **Supply Chain Auditor:** Real time CVE scanning against the workspace `package.json` for known malware dependencies.
* **Predictive Blast Radius:** Recursive import scanner that visually maps exactly what will break in your project before you approve a file deletion.

***

## 🚀 v1.2 Roadmap : True Sandboxing & Autonomous Defense

Moving from a passive EDR tool to a true Zero Trust Sandbox requires native hardware drivers and autonomous intelligence. These are currently under active development:

* **Autonomous Reasoning Loop (Local LLM):** A lightweight, internally hosted reasoning agent that will automatically triage events, correlate velocity spikes with honeypot triggers, and dynamically rotate decoys without human intervention.
* **Linux eBPF Probes:** Kernel level hooks to intercept `sys_enter_openat` and `sys_enter_mkdir`.
* **Windows Minifilters:** Native file system drivers for absolute Windows execution blocking.
* **macOS Endpoint Security Framework (ESF):** Strict entitlements for Apple silicon.
* **Network Ghost Mode:** Local root certificate authority for intercepting and spoofing TLS traffic without payload execution.

***

## ⚙️ Under the Hood

Kavach is built for absolute performance and zero latency, running entirely locally on your machine with **zero cloud dependencies**.

* **The Engine (Rust):** The core interception logic, OS execution hooks, and cryptographic file caching are written in Rust for memory safety and bare metal speed.
* **The Command Center (React TypeScript):** The FUI dashboard operates in an isolated webview, ensuring the UI thread never blocks the security engine.
* **The Bridge (Tauri):** Secure asynchronous Inter Process Communication (IPC) bridges the frontend dashboard and the Rust watcher.

***

## 💻 Zero Config Deployment

1. **Download:** Grab the latest `.exe` (Windows) or `.dmg` (macOS) from the **[Releases Page](../../releases)**.
2. **Launch:** Run `AkshaysKavach.exe`. *(Note: Windows requires running as Administrator for process termination; macOS requires Full Disk Access).*
3. **Arm:** Select your workspace directory in the UI. Kavach immediately locks down the perimeter.

***

## 📞 Direct Line & Feedback

Kavach features a "Direct Line" communication module for users to report anomalies, suggest features, or collaborate. 

* **Developer:** Akshay Sharma
* **Feedback:** Use the **[ COMM LINK ]** terminal button inside the application to route encrypted feedback directly to the developer inbox via your OS default mail client.

***

## 📜 License

Kavach is proudly released under the **GNU General Public License v3.0 (GPL-3.0)**. Permanent attribution to **Akshay Sharma** is required in all forks, distributions, and derivatives, and any modifications must remain open source under the same license terms.
