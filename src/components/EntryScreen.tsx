import { ImageIcon, HardDrive, Cloud, ChevronRight } from "lucide-react";
import { WorkEnv } from "../types";

interface EntryScreenProps {
    onSelect: (env: WorkEnv) => void;
}

export function EntryScreen({ onSelect }: EntryScreenProps) {
    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white font-sans p-10 select-none">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <ImageIcon className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">ImageTool</h1>
            <p className="text-white/40 text-sm mb-12 font-medium">Selecciona un entorno de trabajo para continuar</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <OptionCard
                    icon={<HardDrive className="w-5 h-5" />}
                    title="Entorno Local"
                    description="Optimiza imágenes en tu sistema de archivos local con velocidad nativa."
                    onClick={() => onSelect('local')}
                />
                <OptionCard
                    icon={<Cloud className="w-5 h-5" />}
                    title="Entorno Cloud"
                    description="Sube imágenes optimizadas a tu bucket de Cloudflare R2 automáticamente."
                    onClick={() => onSelect('cloud')}
                />
            </div>
        </div>
    );
}

function OptionCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-left overflow-hidden"
        >
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-white/60 group-hover:text-white transition-colors">{icon}</div>
                </div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{description}</p>
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
        </button>
    );
}
