import { Cpu, Search } from "lucide-react";

interface TopBarProps {
    currentPath: string;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
}

export function TopBar({
    currentPath,
    searchQuery,
    setSearchQuery
}: TopBarProps) {
    return (
        <header className="h-10 border-b border-white/[0.08] flex items-center px-6 gap-6 bg-black sticky top-0 z-20">
            <div className="flex items-center gap-3 text-white/40 truncate flex-1 group cursor-default">
                <Cpu className="w-3.5 h-3.5 group-hover:text-white/80 transition-colors" />
                <div className="flex items-center gap-2 overflow-hidden text-[9px] font-bold tracking-[0.2em] text-white/60 group-hover:text-white/90 transition-colors uppercase">
                    {currentPath || "Este equipo"}
                </div>
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-white/[0.08]">
                <div className="relative group flex items-center">
                    <Search className="w-3.5 h-3.5 text-white/30 group-focus-within:text-white/60 transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR..."
                        className="bg-transparent border-none px-4 outline-none text-[9px] font-bold tracking-[0.3em] w-24 focus:w-40 transition-all placeholder-white/20 text-white uppercase"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
}
