import { TreeItem } from "./TreeItem";
import { FileEntry } from "../types";
import { LogOut, Cloud, HardDrive } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
    rootEntries: FileEntry[];
    currentPath: string;
    onToggle: (e: FileEntry) => void;
    onExit: () => void;
    storageType: "local" | "cloud";
}

export function Sidebar({ rootEntries, currentPath, onToggle, onExit, storageType }: SidebarProps) {
    return (
        <aside className="w-56 border-r border-white/[0.08] bg-black flex flex-col shrink-0 select-none">
            <header className={cn(
                "h-12 px-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black transition-all cursor-default",
                storageType === "cloud" ? "text-blue-400" : "text-white/40"
            )}>
                {storageType === "cloud" ? <Cloud className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
                {storageType === "cloud" ? "NUBE R2" : "EXPLORADOR"}
            </header>

            <div className="flex-1 overflow-x-hidden overflow-y-auto py-2 border-t border-white/[0.02]">
                <div className="space-y-[1px]">
                    {rootEntries.map(entry => (
                        <TreeItem
                            key={entry.path}
                            entry={entry}
                            depth={0}
                            onToggle={onToggle}
                            activePath={currentPath}
                            storageType={storageType}
                        />
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-white/[0.04]">
                <button
                    onClick={onExit}
                    className="w-full h-10 flex items-center gap-3 px-4 text-[10px] font-bold tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all rounded-lg uppercase group"
                >
                    <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    VOLVER AL INICIO
                </button>
            </div>
        </aside>
    );
}
