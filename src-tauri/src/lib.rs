use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use image::GenericImageView;
use webp::Encoder;
use aws_sdk_s3::Client;
use aws_sdk_s3::primitives::ByteStream;
use aws_credential_types::Credentials;
use dotenv::dotenv;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessOptions {
    pub target_format: String, // "webp", "png", "jpg"
    pub max_width: u32,
    pub quality: f32,
    pub storage_type: String, // "local" or "cloud"
    pub category: String,
    pub file_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessResult {
    pub success: bool,
    pub message: String,
    pub url: Option<String>,
}

#[tauri::command]
async fn process_and_upload_image(
    path: String,
    options: ProcessOptions,
) -> Result<ProcessResult, String> {
    dotenv().ok();

    // 1. Read and process image
    let img = image::open(&path).map_err(|e| format!("Failed to open image {}: {}", path, e))?;
    let (width, height) = img.dimensions();

    let mut final_img = img;
    if width > options.max_width {
        final_img = final_img.resize(
            options.max_width,
            (height as f32 * (options.max_width as f32 / width as f32)) as u32,
            image::imageops::FilterType::Lanczos3
        );
    }

    // 2. Convert to target format
    let (buffer, extension) = match options.target_format.as_str() {
        "webp" => {
            let encoder = Encoder::from_image(&final_img).map_err(|e| format!("Failed to create WebP encoder: {}", e))?;
            let webp_memory = encoder.encode(options.quality);
            (webp_memory.to_vec(), "webp")
        },
        "jpg" | "jpeg" => {
            let mut buf = Vec::new();
            final_img.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageFormat::Jpeg).map_err(|e| format!("Failed to encode JPG: {}", e))?;
            (buf, "jpg")
        },
        "png" => {
            let mut buf = Vec::new();
            final_img.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageFormat::Png).map_err(|e| format!("Failed to encode PNG: {}", e))?;
            (buf, "png")
        },
        _ => return Err("Unsupported format".to_string()),
    };

    let new_file_name = format!("{}.{}", options.file_name, extension);

    // 3. Storage
    if options.storage_type == "cloud" {
        upload_to_r2(&buffer, &options.category, &new_file_name).await
            .map(|url| ProcessResult { success: true, message: "Uploaded to R2".to_string(), url: Some(url) })
            .map_err(|e| format!("R2 Upload failed: {}", e))
    } else {
        // Local saving - use a predictable location (e.g. current executable dir or Documents)
        let exe_path = std::env::current_exe().unwrap_or_default();
        let base_dir = exe_path.parent().unwrap_or(Path::new("."));
        let output_dir = base_dir.join("output").join(&options.category);
        
        fs::create_dir_all(&output_dir).map_err(|e| format!("Failed to create local directory: {}", e))?;
        
        let local_file_path = output_dir.join(&new_file_name);
        fs::write(&local_file_path, &buffer).map_err(|e| format!("Failed to write local file: {}", e))?;
        
        Ok(ProcessResult { 
            success: true, 
            message: format!("Saved to local: {:?}", local_file_path), 
            url: Some(local_file_path.to_string_lossy().into_owned()) 
        })
    }
}

async fn upload_to_r2(buffer: &[u8], category: &str, file_name: &str) -> Result<String, String> {
    let account_id = std::env::var("R2_ACCOUNT_ID").map_err(|_| "R2_ACCOUNT_ID not found")?;
    let access_key = std::env::var("R2_ACCESS_KEY_ID").map_err(|_| "R2_ACCESS_KEY_ID not found")?;
    let secret_key = std::env::var("R2_SECRET_ACCESS_KEY").map_err(|_| "R2_SECRET_ACCESS_KEY not found")?;
    let bucket_name = std::env::var("R2_BUCKET_NAME").map_err(|_| "R2_BUCKET_NAME not found")?;
    let public_url = std::env::var("R2_PUBLIC_URL").unwrap_or_default();

    let config = aws_config::defaults(aws_config::BehaviorVersion::latest())
        .credentials_provider(Credentials::new(
            access_key,
            secret_key,
            None,
            None,
            "custom",
        ))
        .region(aws_config::Region::new("auto"))
        .endpoint_url(format!("https://{}.r2.cloudflarestorage.com", account_id))
        .load()
        .await;

    let client = Client::new(&config);
    let key = format!("images/{}/{}", category, file_name);

    client.put_object()
        .bucket(&bucket_name)
        .key(&key)
        .body(ByteStream::from(buffer.to_vec()))
        .content_type(match Path::new(file_name).extension().and_then(|s| s.to_str()) {
            Some("webp") => "image/webp",
            Some("png") => "image/png",
            Some("jpg") | Some("jpeg") => "image/jpeg",
            _ => "application/octet-stream",
        })
        .send()
        .await
        .map_err(|e| format!("S3 upload error: {}", e))?;

    Ok(format!("{}/{}", public_url, key))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tauri::command]
fn get_system_paths() -> Vec<serde_json::Value> {
    let mut paths = Vec::new();

    // Add standard drives (simplistic Windows approach)
    for drive in b'A'..=b'Z' {
        let drive_path = format!("{}:\\", drive as char);
        if std::path::Path::new(&drive_path).exists() {
            paths.push(serde_json::json!({
                "name": format!("Disco Local ({}:)", drive as char),
                "path": drive_path,
                "type": "drive"
            }));
        }
    }

    // Add common user folders
    if let Ok(home) = std::env::var("USERPROFILE") {
        let home_path = std::path::Path::new(&home);
        let common = vec![
            ("Descargas", "Downloads"),
            ("Documentos", "Documents"),
            ("Imágenes", "Pictures"),
            ("Escritorio", "Desktop"),
        ];

        for (name, folder) in common {
            let path = home_path.join(folder);
            if path.exists() {
                paths.push(serde_json::json!({
                    "name": name,
                    "path": path.to_string_lossy().to_string(),
                    "type": "folder"
                }));
            }
        }
    }

    paths
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            process_and_upload_image,
            get_system_paths
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
