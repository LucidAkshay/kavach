🛡️ Kavach: Tactical Zero-Trust AI Firewall
![Kavach Dashboard Demo](./kavach-demo.gif)

Kavach (Sanskrit for "Armor") is a military-grade, zero-trust security layer designed exclusively to restrain, monitor, and deceive autonomous AI agents, local LLM developers, and RPA scripts.

When autonomous agents (like OpenClaw or AutoGPT) operate on your system, they move at superhuman speeds. Kavach is the ultimate "emergency brake." It sits silently between the AI and your kernel, intercepting every file modification, network request, and process spawn before they cause catastrophic system damage.

🛰️ The Pitch: Why Kavach?
Autonomous AI is revolutionary, but it is inherently volatile. An ill-prompted agent can delete production databases, exfiltrate private .env keys, or spawn a recursive loop of child processes that crashes your OS in seconds.

Kavach does not just "detect" threats—it intercepts them. Through a real-time, high-fidelity HUD, it gives you absolute tactical control over your machine's perimeter.

⚡ Elite Tactical Features
🖥️ 2080 Sci-Fi Command Center (FUI): Experience a high-density, "Spatial Computing" interface. Designed with a deep-void aesthetic, emerald telemetry, and radioactive amber alerts, Kavach provides professional-grade visibility without the clutter.

👻 Phantom Workspace (File-System Ghosting): Activate a virtualized sandbox. When a restricted agent attempts to overwrite sensitive code, Kavach intercepts the system call and redirects the action to a hidden phantom directory. The agent believes it succeeded; your actual files remain untouched.

⏳ Temporal Rollback (The "Undo" Engine): Kavach maintains a low-level, cryptographic cache of file modifications. Did an AI mangle your configuration? A one-click Rollback restores the file to its exact state from milliseconds ago.

🕸️ Network Ghost Mode: Stop data exfiltration without crashing the agent's workflow. Kavach intercepts outbound network requests to unauthorized domains, drops the payload, and returns a mock 200 OK success response.

🧠 The Turing Protocol: Absolute protection against RPA and synthetic interactions. Kavach rejects synthetic mouse injections (e.g., LLMHF_INJECTED) and utilizes adversarial UI noise to blind AI vision models, ensuring only a human can click "Approve."

🪤 Counter-Intelligence Traps: * Mirror Maze: Deploy recursive directory traps with fake credentials to tarpit malicious agents.

Poison Context: Inject mock "self-destruct" payloads into the agent's prompt stream to force a safe shutdown.

🛠️ Zero-Config Installation
Kavach is designed as a portable, zero-friction executable. No complex dependencies or kernel compiling required.

Download: Grab the latest .exe (Windows) or .dmg (macOS) from the Releases Page.

Launch: Run AkshaysKavach.exe (Administrator privileges recommended for deep OS hooks).

Monitor: Select your workspace directory in the UI. Kavach immediately arms the perimeter.

📞 Direct Line & Feedback
Kavach features a "Direct Line" encrypted communication module for users to report anomalies, suggest features, or collaborate.

Developer: Akshay Sharma

Feedback: Use the [ COMM LINK ] terminal button inside the application to format and send encrypted feedback directly to the developer's inbox.

## ⚙️ Under the Hood (Architecture)

Kavach is built for absolute performance and zero latency, running entirely locally on your machine with **zero cloud dependencies**.

* **The Engine (Rust):** The core interception logic, OS-level hooks, and cryptographic file caching are written in Rust for memory safety, concurrency, and bare-metal speed.
* **The Command Center (React/TypeScript):** The FUI dashboard operates in an isolated webview, ensuring the UI thread never blocks the security engine.
* **The Bridge (Tauri):** Secure, asynchronous Inter-Process Communication (IPC) bridges the frontend dashboard and the kernel-level watcher.
* **The Ledger (SQLite):** All telemetry, temporal rollback states, and audit logs are stored locally in an encrypted, high-speed SQLite database.

---

## 💻 System Compatibility & Requirements

Kavach acts as an emergency brake for your operating system and requires deep system access to intercept autonomous processes.

* **Windows:** Windows 10 / 11 (64-bit). *Note: Must be run as Administrator to enable process interception.*
* **macOS:** macOS 13 Ventura or newer (Apple Silicon M1/M2/M3 & Intel supported). *Note: Requires Full Disk Access and Accessibility permissions upon first launch.*
* **Linux:** Coming in a future update (currently testing `.AppImage` deployment).
* **System Footprint:** < 50MB RAM at idle, ~15MB disk space.

---

## 🚀 Roadmap: What's Next in v2.0

We are continuously expanding the perimeter. Planned features for the next major deployment:

* **The Faraday Clipboard:** Intercept and block background agents from reading your OS clipboard history without explicit user consent.
* **Biometric "Nuclear" Authorization:** Hook into native OS hardware (TouchID / Windows Hello) to require physical fingerprint verification before an agent can touch `CRITICAL_LOCKED` directories.
* **Blast Radius Predictor:** AST (Abstract Syntax Tree) parsing to visually simulate what will break in your project *before* you approve an agent's file deletion.

---

## ⚠️ Troubleshooting & False Positives (Important)

Because Kavach is a low-level, compiled security executable that actively monitors other processes, your operating system's default antivirus may flag it as suspicious upon the first download. **This is a standard false positive for new, unsigned security tools.**

* **Windows SmartScreen:** If blocked, click `More info` -> `Run anyway`.
* **macOS Gatekeeper:** If you receive an "unidentified developer" warning, open `System Settings` -> `Privacy & Security`, scroll down, and click `Open Anyway` for Kavach.
* **Agent Alert Fatigue:** If Kavach is throwing too many Veto alerts for standard OS background tasks, ensure your `System Maintenance` trust scopes are toggled ON in the configuration panel.

📜 License
Kavach is proudly released as freeware under the MIT License. Permanent attribution to Akshay Sharma is required in all forks, distributions, and derivatives.
