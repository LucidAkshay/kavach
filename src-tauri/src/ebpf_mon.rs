pub struct EbpfMonitor {}

impl EbpfMonitor {
    pub fn new() -> Self {
        Self {}
    }

    pub fn start(&mut self) -> Result<(), String> {
        println!("[KAVACH eBPF] Native eBPF hooks require manual Aya compilation.");
        println!("[KAVACH eBPF] Falling back to standard Userland FS notification.");
        Ok(())
    }
}

#[allow(dead_code)]
pub fn get_capabilities_doc() -> String {
    "Requires CAP_SYS_ADMIN or CAP_BPF. Deployment via setcap cap_sys_admin+ep kavach-app.".to_string()
}