import { useState } from "react";
import { ImageIcon, HardDrive, Cloud, ChevronRight, ArrowLeft } from "lucide-react";
import { WorkEnv } from "../types";

interface EntryScreenProps {
    onSelect: (env: WorkEnv) => void;
}

export function EntryScreen({ onSelect }: EntryScreenProps) {
    const [view, setView] = useState<"main" | "cloud-providers">("main");

    if (view === "cloud-providers") {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center text-white font-sans p-10 select-none animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={() => setView("main")}
                    className="absolute top-12 left-12 flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase hover:translate-x-[-4px] duration-200"
                >
                    <ArrowLeft className="w-4 h-4" /> VOLVER
                </button>

                <div className="w-16 h-16 rounded-xl bg-blue-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    <Cloud className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Proveedores Cloud</h1>
                <p className="text-white/40 text-sm mb-12 font-medium">Selecciona tu servicio de almacenamiento para optimizar</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                    <ProviderCard
                        name="Cloudflare R2"
                        description="Almacenamiento compatible con S3 sin costos de salida."
                        icon={<div className="w-8 h-8 bg-orange-500/10 rounded flex items-center justify-center font-bold text-orange-500">R2</div>}
                        onClick={() => onSelect('cloud')}
                    />
                    <ProviderCard
                        name="Amazon S3"
                        description="El estándar de la industria para almacenamiento masivo."
                        icon={<div className="w-8 h-8 bg-yellow-500/10 rounded flex items-center justify-center font-bold text-yellow-500">S3</div>}
                        disabled
                    />
                    <ProviderCard
                        name="Cloudinary"
                        description="Gestión inteligente y optimización automática de medios."
                        icon={<div className="w-8 h-8 bg-blue-400/10 rounded flex items-center justify-center font-bold text-blue-400">CL</div>}
                        disabled
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white font-sans p-10 select-none animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                <ImageIcon className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">ImageTool</h1>
            <p className="text-white/40 text-sm mb-12 font-medium tracking-wide">Selecciona un entorno de trabajo para continuar</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <OptionCard
                    icon={<HardDrive className="w-5 h-5 text-emerald-500" />}
                    title="Entorno Local"
                    description="Optimiza imágenes en tu sistema de archivos local con velocidad nativa."
                    onClick={() => onSelect('local')}
                    colorClass="hover:border-emerald-500/20"
                />
                <OptionCard
                    icon={<Cloud className="w-5 h-5 text-blue-500" />}
                    title="Entorno Cloud"
                    description="Sube imágenes optimizadas a tu infraestructura en la nube directamente."
                    onClick={() => setView("cloud-providers")}
                    colorClass="hover:border-blue-500/20"
                />
            </div>
        </div>
    );
}

function OptionCard({ icon, title, description, onClick, colorClass }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, colorClass: string }) {
    return (
        <button
            onClick={onClick}
            className={`group relative p-8 rounded-2xl bg-white/[0.03] border border-white/10 ${colorClass} transition-all text-left overflow-hidden hover:bg-white/[0.05] active:scale-[0.98] duration-200`}
        >
            <div className="relative z-10 text-white/90 group-hover:text-white">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-lg font-bold mb-1 tracking-tight">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium">{description}</p>
            </div>
            <div className="absolute bottom-0 right-0 p-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
        </button>
    );
}

function ProviderCard({ name, description, icon, onClick, disabled }: { name: string, description: string, icon: React.ReactNode, onClick?: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`group relative p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-left ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:bg-white/[0.05] active:scale-[0.98]'}`}
        >
            <div className="flex items-center justify-between mb-4">
                {icon}
                {!disabled && <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />}
            </div>
            <h4 className="text-base font-bold mb-1">{name}</h4>
            <p className="text-[11px] text-white/40 leading-relaxed font-medium">{description}</p>
            {disabled && <span className="absolute top-4 right-4 text-[8px] font-bold text-white/20 tracking-widest uppercase">Próximamente</span>}
        </button>
    );
}
