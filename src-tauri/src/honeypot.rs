use std::fs;
use std::path::Path;
use std::time::SystemTime;
use tauri::AppHandle;

#[tauri::command]
pub fn deploy_honeypot(_app: AppHandle, monitored_path: String) -> Result<String, String> {
    if monitored_path.is_empty() {
        return Err("Cannot deploy honeypot while monitoring is paused.".to_string());
    }
    
    // Choose a random decoy type
    let decoys = [
        ("system_auth_tokens.json", "{\"mock_token\": \"abc-123\", \"access_level\": \"admin\"}"),
        (".env.production", "AWS_ACCESS_KEY_ID=AKIA_MOCK_TRAP_01\nAWS_SECRET_ACCESS_KEY=wJalrXUtTnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"),
        ("db_credentials.yaml", "database:\n  user: root_admin\n  pass: P@ssw0rd123!\n  host: prod-db.internal.kavach.io"),
    ];
    
    let (filename, content) = decoys[SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs() as usize % decoys.len()];
    let path = Path::new(&monitored_path).join(filename);
    
    fs::write(&path, content).map_err(|e| e.to_string())?;

    // v1.4: Inject to gitignore to prevent accidental human commits
    let gitignore = Path::new(&monitored_path).join(".gitignore");
    if let Ok(mut current) = fs::read_to_string(&gitignore) {
        if !current.contains(filename) {
            current.push_str(&format!("\n# Kavach Honeypot\n{}\n", filename));
            let _ = fs::write(&gitignore, current);
        }
    } else {
        // Fallback: Create the file if it does not exist
        let _ = fs::write(&gitignore, format!("# Kavach Honeypot\n{}\n", filename));
    }

    println!("[KAVACH] Dynamic honeypot deployed to: {:?}", path);
    Ok(format!("Honeypot deployed to {:?}", path))
}