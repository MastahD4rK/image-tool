import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import { FileEntry } from "../types";

export function useFileSystem() {
    const [rootEntries, setRootEntries] = useState<FileEntry[]>([]);
    const [currentPath, setCurrentPath] = useState<string>("");
    const [filesInView, setFilesInView] = useState<FileEntry[]>([]);
    const [storageType, setStorageType] = useState<"local" | "cloud">("local");

    const loadContents = useCallback(async (path: string, onlyDirectories: boolean = false, typeOverride?: "local" | "cloud") => {
        const type = typeOverride || storageType;
        try {
            if (path === "root") {
                if (type === "cloud") {
                    const cloudPaths = await invoke<FileEntry[]>("list_cloud_objects");
                    return cloudPaths.map(cp => ({ ...cp, status: 'idle' as const }));
                }
                const sysPaths = await invoke<{ name: string, path: string, type: string }[]>("get_system_paths");
                return sysPaths.map(sp => ({
                    name: sp.name,
                    path: sp.path,
                    isDirectory: true,
                    status: 'idle' as const,
                }));
            }

            if (type === "cloud") {
                // In cloud mode, we don't have nested directories yet in the simple implementation
                // If we did, we would filter the flat list by prefix here
                // For now, cloud is mostly flat or category-based
                return [];
            }

            const entries = await readDir(path);
            const imageRegex = /\.(png|jpg|jpeg|webp|gif|bmp|tiff|jfif|pjpeg|pjp)$/i;

            return entries
                .filter(e => e.isDirectory || (!onlyDirectories && imageRegex.test(e.name)))
                .map(e => {
                    const sep = path.includes('/') ? '/' : '\\';
                    const fullPath = path.endsWith(sep) ? `${path}${e.name}` : `${path}${sep}${e.name}`;
                    return {
                        name: e.name,
                        path: fullPath,
                        isDirectory: e.isDirectory,
                        status: 'idle' as const,
                    };
                });
        } catch (err) {
            console.error("Error loading path:", path, err);
            return [];
        }
    }, [storageType]);

    const toggleFolder = useCallback(async (entry: FileEntry) => {
        const updateTreeContents = async (nodes: FileEntry[]): Promise<FileEntry[]> => {
            return Promise.all(nodes.map(async node => {
                if (node.path === entry.path) {
                    const isOpen = !node.isOpen;
                    let children = node.children;
                    if (isOpen && (!children || children.length === 0)) {
                        children = await loadContents(node.path, true);
                    }
                    return { ...node, isOpen, children };
                }
                if (node.children) {
                    return { ...node, children: await updateTreeContents(node.children) };
                }
                return node;
            }));
        };

        if (storageType === "cloud" && entry.path !== "root") {
            // Specific cloud behavior if needed
        } else {
            const newTree = await updateTreeContents(rootEntries);
            setRootEntries(newTree);
        }

        if (entry.path !== "root") {
            setCurrentPath(entry.path);
            const viewEntries = await loadContents(entry.path, false);
            setFilesInView(viewEntries.filter(e => !e.isDirectory));
        }
    }, [rootEntries, loadContents, storageType]);

    const initRoot = useCallback(async (type: "local" | "cloud") => {
        setStorageType(type);
        const initialChildren = await loadContents("root", true, type);
        setRootEntries([{
            name: type === "local" ? "Este equipo" : "Nube R2",
            path: "root",
            isDirectory: true,
            status: 'idle',
            isOpen: true,
            children: initialChildren
        }]);
        setCurrentPath("");
        setFilesInView([]);
    }, [loadContents]);

    return {
        rootEntries,
        currentPath,
        filesInView,
        setFilesInView,
        toggleFolder,
        initRoot,
        storageType
    };
}
