use std::fs;
use std::path::Path;
use std::time::SystemTime;
use tauri::AppHandle;
use crate::DEPLOYED_HONEYPOTS;

#[tauri::command]
pub fn deploy_honeypot(_app: AppHandle, monitored_path: String) -> Result<String, String> {
    if monitored_path.is_empty() {
        return Err("Cannot deploy honeypot while monitoring is paused.".to_string());
    }
    
    let decoys = [
        ("system_auth_tokens.json", "{\"mock_token\": \"ak_9922_xc\", \"access_level\": \"admin\"}"),
        (".env.production", "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET_ACCESS_KEY=wJalrXUtTnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"),
        ("db_credentials.yaml", "database:\n  user: db_admin\n  pass: KvcH_7721_!x\n  host: prod_db.internal.node"),
    ];
    
    let (filename, content) = decoys[SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs() as usize % decoys.len()];
    let path = Path::new(&monitored_path).join(filename);
    
    if path.exists() {
        return Err(format!("Honeypot deployment aborted: A real file already exists at {:?}", path));
    }
    
    fs::write(&path, content).map_err(|e| e.to_string())?;

    let mut honeypots = DEPLOYED_HONEYPOTS.lock().unwrap();
    honeypots.push(path.clone());

    let gitignore = Path::new(&monitored_path).join(".gitignore");
    if let Ok(mut current) = fs::read_to_string(&gitignore) {
        if !current.contains(filename) {
            current.push_str(&format!("\n# Kavach Honeypot\n{}\n", filename));
            let _ = fs::write(&gitignore, current);
        }
    } else {
        let _ = fs::write(&gitignore, format!("# Kavach Honeypot\n{}\n", filename));
    }

    println!("[KAVACH] Dynamic honeypot deployed to: {:?}", path);
    Ok(format!("Honeypot deployed to {:?}", path))
}