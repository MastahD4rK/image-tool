import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FileEntry, ProcessOptions, ProcessResult } from "../types";

export function useImageProcessor() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [options, setOptions] = useState<Omit<ProcessOptions, 'file_name' | 'category'>>({
        target_format: "webp",
        max_width: 1920,
        quality: 0.8,
        storage_type: "local",
    });

    const processFile = useCallback(async (
        file: FileEntry,
        onUpdate: (updatedFile: FileEntry) => void
    ) => {
        onUpdate({ ...file, status: 'processing' });

        try {
            const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const result = await invoke<ProcessResult>("process_and_upload_image", {
                path: file.path,
                options: {
                    ...options,
                    file_name: fileNameWithoutExt,
                    category: "general"
                }
            });

            if (result.success) {
                onUpdate({
                    ...file,
                    status: 'success',
                    message: result.message,
                    url: result.url
                });
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            onUpdate({
                ...file,
                status: 'error',
                message: err instanceof Error ? err.message : String(err)
            });
        }
    }, [options]);

    const processBatch = useCallback(async (
        files: FileEntry[],
        onUpdate: (updatedFile: FileEntry) => void
    ) => {
        setIsProcessing(true);
        for (const file of files) {
            if (file.status === 'idle') {
                await processFile(file, onUpdate);
            }
        }
        setIsProcessing(false);
    }, [processFile]);

    return {
        options,
        setOptions,
        isProcessing,
        processFile,
        processBatch
    };
}
