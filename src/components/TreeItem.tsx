import { ChevronRight, Folder, Image as ImageIcon, Monitor, HardDrive, Cloud } from "lucide-react";
import { cn } from "../lib/utils";
import { FileEntry } from "../types";

interface TreeItemProps {
    entry: FileEntry;
    depth: number;
    onToggle: (e: FileEntry) => void;
    activePath: string;
    storageType: "local" | "cloud";
}

export function TreeItem({ entry, depth, onToggle, activePath, storageType }: TreeItemProps) {
    const isActive = activePath === entry.path;
    const isSpecialRoot = entry.path === "root";
    const isDrive = entry.name.includes("Disco Local") || entry.name.includes("C:\\");

    return (
        <div className="select-none">
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(entry);
                }}
                className={cn(
                    "group flex items-center gap-2.5 py-1.5 px-4 cursor-pointer transition-all border-l-[3px]",
                    isActive
                        ? (storageType === "cloud" ? "bg-blue-500/10 text-white border-blue-500" : "bg-white/[0.08] text-white border-white")
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white border-transparent"
                )}
                style={{ paddingLeft: `${depth * 12 + 16}px` }}
            >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {entry.isDirectory && (
                        <ChevronRight
                            className={cn(
                                "w-3 h-3 transition-transform duration-200",
                                entry.isOpen ? "rotate-90 text-white/70" : "text-white/30"
                            )}
                        />
                    )}
                </div>

                <div className="shrink-0">
                    {isSpecialRoot ? (
                        storageType === "cloud" ? <Cloud className="w-3.5 h-3.5 text-blue-400" /> : <Monitor className="w-3.5 h-3.5 text-white/70" />
                    ) : isDrive ? (
                        <HardDrive className="w-3.5 h-3.5 text-white/50" />
                    ) : entry.isDirectory ? (
                        <Folder className={cn("w-3.5 h-3.5 transition-colors", entry.isOpen ? "text-white/70" : "text-white/30")} />
                    ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                    )}
                </div>

                <span className={cn(
                    "truncate text-[10px] font-bold tracking-[0.1em] uppercase",
                    isSpecialRoot ? "text-white/80 tracking-[0.2em]" : ""
                )}>
                    {entry.name}
                </span>
            </div>

            {entry.isOpen && entry.children && (
                <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                    {entry.children.map(child => (
                        <TreeItem
                            key={child.path}
                            entry={child}
                            depth={depth + 1}
                            onToggle={onToggle}
                            activePath={activePath}
                            storageType={storageType}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
