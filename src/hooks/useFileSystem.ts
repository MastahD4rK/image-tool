import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import { FileEntry } from "../types";

export function useFileSystem() {
    const [rootEntries, setRootEntries] = useState<FileEntry[]>([]);
    const [currentPath, setCurrentPath] = useState<string>("");
    const [filesInView, setFilesInView] = useState<FileEntry[]>([]);

    const loadContents = useCallback(async (path: string, onlyDirectories: boolean = false) => {
        try {
            if (path === "root") {
                const sysPaths = await invoke<{ name: string, path: string, type: string }[]>("get_system_paths");
                return sysPaths.map(sp => ({
                    name: sp.name,
                    path: sp.path,
                    isDirectory: true,
                    status: 'idle' as const,
                }));
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
    }, []);

    const toggleFolder = useCallback(async (entry: FileEntry) => {
        const updateTreeContents = async (nodes: FileEntry[]): Promise<FileEntry[]> => {
            return Promise.all(nodes.map(async node => {
                if (node.path === entry.path) {
                    const isOpen = !node.isOpen;
                    let children = node.children;
                    if (isOpen && (!children || children.length === 0)) {
                        children = await loadContents(node.path, true); // Only folders for the tree
                    }
                    return { ...node, isOpen, children };
                }
                if (node.children) {
                    return { ...node, children: await updateTreeContents(node.children) };
                }
                return node;
            }));
        };

        const newTree = await updateTreeContents(rootEntries);
        setRootEntries(newTree);

        if (entry.path !== "root") {
            setCurrentPath(entry.path);
            // Load fresh contents (files + folders) for the view
            const viewEntries = await loadContents(entry.path, false);
            setFilesInView(viewEntries.filter(e => !e.isDirectory));
        }
    }, [rootEntries, loadContents]);

    const initRoot = useCallback(() => {
        setRootEntries([{
            name: "Este equipo",
            path: "root",
            isDirectory: true,
            status: 'idle',
            isOpen: false,
            children: []
        }]);
        setCurrentPath("");
        setFilesInView([]);
    }, []);

    return {
        rootEntries,
        currentPath,
        filesInView,
        setFilesInView,
        toggleFolder,
        initRoot
    };
}
