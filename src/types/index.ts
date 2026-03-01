export interface ProcessOptions {
    target_format: string;
    max_width: number;
    quality: number;
    storage_type: "local" | "cloud";
    cloud_provider?: "cloudflare" | "amazon" | "cloudinary";
    category: string;
    file_name: string;
}

export interface ProcessResult {
    success: boolean;
    message: string;
    url?: string;
}

export interface FileEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    status: 'idle' | 'processing' | 'success' | 'error';
    message?: string;
    url?: string;
    children?: FileEntry[];
    isOpen?: boolean;
}

export type WorkEnv = 'selection' | 'local' | 'cloud';
