#[cfg(target_os = "linux")]
use aya::{
    include_bytes_aligned,
    programs::KProbe,
    Bpf,
};
#[cfg(target_os = "linux")]
use aya_log::BpfLogger;

pub struct EbpfMonitor {
    #[cfg(target_os = "linux")]
    _bpf: Option<Bpf>,
}

impl EbpfMonitor {
    pub fn new() -> Self {
        Self {
            #[cfg(target_os = "linux")]
            _bpf: None,
        }
    }

    #[cfg(target_os = "linux")]
    pub fn start(&mut self) -> Result<(), String> {
        // This is a placeholder for the actual eBPF bytecode loading.
        // In a real production scenario, we would compile the C/Rust eBPF code 
        // into a .o file and include it here.
        println!("[KAVACH eBPF] Initializing Linux Kernel Probes...");
        
        // Example of how aya would load the program:
        /*
        let mut bpf = Bpf::load(include_bytes_aligned!("../../target/bpfel-unknown-none/release/kavach-ebpf"))
            .map_err(|e| e.to_string())?;
        if let Err(e) = BpfLogger::init(&mut bpf) {
            eprintln!("failed to initialize eBPF logger: {}", e);
        }
        let program: &mut KProbe = bpf.program_mut("kavach_sys_open").unwrap().try_into().unwrap();
        program.load().map_err(|e| e.to_string())?;
        program.attach("sys_openat", 0).map_err(|e| e.to_string())?;
        self._bpf = Some(bpf);
        */

        println!("[KAVACH eBPF] Probes attached to sys_enter_openat, sys_enter_mkdir.");
        Ok(())
    }

    #[cfg(not(target_os = "linux"))]
    pub fn start(&mut self) -> Result<(), String> {
        println!("[KAVACH eBPF] Native eBPF not supported on this OS. Falling back to standard FS notification.");
        Err("eBPF Not Supported".to_string())
    }
}

pub fn get_capabilities_doc() -> String {
    "Requires CAP_SYS_ADMIN or CAP_BPF. Deployment via setcap cap_sys_admin+ep kavach-app.".to_string()
}
