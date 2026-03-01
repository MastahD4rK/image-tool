import { CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { FileEntry } from "../types";

interface FileListViewProps {
    files: FileEntry[];
    searchQuery: string;
    onProcess: (file: FileEntry) => void;
}

export function FileListView({ files, searchQuery, onProcess }: FileListViewProps) {
    const filtered = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (files.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-32 text-white/20">
                <ImageIcon className="w-16 h-16 mb-6 stroke-[1] opacity-20" />
                <p className="text-sm font-medium tracking-tight text-white/40 uppercase tracking-[0.2em]">Selecciona una carpeta para ver imágenes</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {filtered.map((file, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.05] transition-all group border border-transparent hover:border-white/[0.08]"
                >
                    <div className="flex items-center gap-4 w-[60%]">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                            <ImageIcon className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                        </div>
                        <div className="truncate">
                            <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors truncate">
                                {file.name}
                            </div>
                            <div className="text-[10px] text-white/40 font-mono mt-0.5">
                                {file.path.split(/[\\/]/).slice(-3, -1).join(' > ')}
                            </div>
                        </div>
                    </div>

                    <div className="w-[20%] flex items-center justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
                            {file.status === 'processing' && <Loader2 className="w-2.5 h-2.5 text-blue-500 animate-spin" />}
                            {file.status === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />}
                            {file.status === 'error' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />}
                            <span className={cn(
                                "text-[9px] font-bold tracking-widest uppercase",
                                file.status === 'success' ? "text-green-500" : file.status === 'error' ? "text-red-500" : "text-white/40"
                            )}>
                                {file.status === 'idle' ? 'Listo' : file.status}
                            </span>
                        </div>
                    </div>

                    <div className="w-[20%] flex justify-end">
                        {file.status === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500/80" />
                        ) : (
                            <button
                                onClick={() => onProcess(file)}
                                className="opacity-0 group-hover:opacity-100 px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                OPTIMIZAR
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
