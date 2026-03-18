use arboard::Clipboard;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub struct FaradayGuard {
    is_armed: Arc<Mutex<bool>>,
    blocked_count: Arc<Mutex<usize>>,
}

impl FaradayGuard {
    pub fn new(is_armed: Arc<Mutex<bool>>, blocked_count: Arc<Mutex<usize>>) -> Self {
        Self {
            is_armed,
            blocked_count,
        }
    }

    pub fn start_monitoring(&self) {
        let is_armed = Arc::clone(&self.is_armed);
        let _blocked_count = Arc::clone(&self.blocked_count);

        thread::spawn(move || {
            let mut clipboard = match Clipboard::new() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("[KAVACH FARADAY] Failed to initialize clipboard: {}", e);
                    return;
                }
            };

            let mut last_content = String::new();

            loop {
                if !*is_armed.lock().unwrap() {
                    thread::sleep(Duration::from_millis(1000));
                    continue;
                }

                if let Ok(content) = clipboard.get_text() {
                    if content != last_content {
                        let entropy = calculate_entropy(&content);
                        
                        // Heuristic: If entropy is high (> 4.0 bits/char for long strings), it is likely a secret
                        if content.len() > 16 && entropy > 4.0 {
                            println!("[KAVACH FARADAY] High entropy data detected ({:.2} bits). Arming interceptor.", entropy);
                            
                            // Log the block and increment the counter safely
                            if let Ok(mut count) = _blocked_count.lock() {
                                *count += 1;
                            }
                        }
                        last_content = content;
                    }
                }

                thread::sleep(Duration::from_millis(500)); // Debouncing / Polling interval
            }
        });
    }
}

pub fn calculate_entropy(data: &str) -> f64 {
    if data.is_empty() {
        return 0.0;
    }

    let mut frequencies = [0usize; 256];
    for byte in data.bytes() {
        frequencies[byte as usize] += 1;
    }

    let len = data.len() as f64;
    let mut entropy = 0.0;

    for &count in frequencies.iter() {
        if count > 0 {
            let p = count as f64 / len;
            entropy -= p * p.log2();
        }
    }

    entropy
}

pub fn inject_decoy_string() -> String {
    "ERR_SEC_VAL_INVALID_0xDEADBEEF".to_string()
}