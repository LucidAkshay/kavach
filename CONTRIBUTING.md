# Contributing to Kavach 🛡️

First of all, thank you for wanting to help build the ultimate emergency brake for AI! We are thrilled to have you here.

By contributing to Kavach, you agree to abide by our **Code of Conduct** and license your contributions under the **GPLv3 License**.

## 🚀 Getting Started

To begin contributing, please follow these steps:

1. Fork the repository and create your branch from `main`.
2. Ensure you have the latest **Rust** toolchain and **Node.js** installed.
3. Run `cargo build` and `npm install` to set up your local development environment.
4. If you are fixing a bug or adding a feature, please open an Issue first to discuss it with the maintainers.

## 🛠️ Code Standards

Kavach is built on a foundation of performance and security. We hold all contributions to the following technical standards:

### Rust Backend
• **Safety First:** Avoid using `unsafe` blocks unless absolutely necessary for OS level system hooks. Any `unsafe` code must be heavily documented with a "Safety" comment.
• **Performance:** Ensure that system call interception does not introduce noticeable UI lag. Use asynchronous Rust where appropriate.
• **Formatting:** Run `cargo fmt` before every commit. We follow the standard Rust style guidelines.

### Frontend (Tauri + React)
• **Type Safety:** We use TypeScript for everything. Avoid using the `any` type at all costs.
• **State Management:** Keep the frontend lean. Heavy logic should reside in the Rust backend, not the UI.

## 🧪 Testing Requirements

We will not merge any Pull Request that breaks the build or lowers our security posture.

• All new features must include unit tests.
• If you are modifying the **Phantom Workspace** logic, you must include an integration test showing that the file redirection still works as intended.
• Ensure that `cargo test` passes locally before submitting your PR.

## 📨 Submitting a Pull Request

When you are ready to submit your changes:

1. Provide a clear and descriptive title for your PR.
2. Explain the **"Why"** behind the change, not just the "What."
3. Link the PR to the relevant Issue.
4. Once submitted, a maintainer will review your code. Please be prepared to iterate on feedback gracefully!

## 🛡️ Security Vulnerabilities

If you discover a security vulnerability within Kavach, please **do not** open a public issue. Instead, send a detailed report to **kavach.security@amrutyaessence.com**. This allows us to fix the issue before it is exploited.
