use serde_json;
use std::fs;
use std::sync::Mutex;
use tauri::AppHandle;
use crate::InterceptedAction;
use reqwest;

pub static SIEM_WEBHOOK_URL: Mutex<Option<String>> = Mutex::new(None);
pub static SIEM_LOG_PATH: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
pub fn configure_siem(webhook_url: Option<String>, log_path: Option<String>) -> Result<(), String> {
    if let Some(url) = webhook_url {
        *SIEM_WEBHOOK_URL.lock().unwrap() = Some(url);
    }
    if let Some(path) = log_path {
        *SIEM_LOG_PATH.lock().unwrap() = Some(path);
    }
    Ok(())
}

pub async fn log_to_siem(action: &InterceptedAction) {
    let payload = serde_json::to_string(action).unwrap_or_default();

    let log_path = {
        let lock = SIEM_LOG_PATH.lock().unwrap();
        lock.clone()
    };

    if let Some(path) = log_path {
        let mut file_content = std::fs::read_to_string(&path).unwrap_or_default();
        file_content.push_str(&payload);
        file_content.push('\n');
        let _ = std::fs::write(&path, file_content);
    }

    let webhook_url = {
        let lock = SIEM_WEBHOOK_URL.lock().unwrap();
        lock.clone()
    };

    if let Some(url) = webhook_url {
        let client = reqwest::Client::new();
        let _ = client.post(url)
            .json(action)
            .send()
            .await;
    }
}