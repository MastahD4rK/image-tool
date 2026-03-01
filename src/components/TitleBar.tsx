import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

const appWindow = getCurrentWindow();

export function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const updateMaximized = async () => {
            setIsMaximized(await appWindow.isMaximized());
        };
        updateMaximized();
        const unlisten = appWindow.onResized(updateMaximized);
        return () => {
            unlisten.then(f => f());
        };
    }, []);

    return (
        <div
            className="h-9 bg-black flex items-center justify-between select-none relative z-[9999] border-b border-white/[0.08]"
        >
            <div
                data-tauri-drag-region
                className="absolute inset-0 w-full h-full cursor-default pointer-events-auto"
            />

            <div className="flex items-center gap-3 px-5 pointer-events-none relative z-10">
                <div className="w-0.5 h-3 bg-white/40" />
                <span className="text-[10px] font-bold text-white/60 tracking-[0.4em] uppercase">
                    Image Tool
                </span>
            </div>

            <div className="flex h-full relative z-20">
                <WindowButton onClick={() => appWindow.minimize()}>
                    <Minus className="w-3.5 h-3.5" />
                </WindowButton>
                <WindowButton onClick={() => appWindow.toggleMaximize()}>
                    {isMaximized ? (
                        <Square className="w-3 h-3" />
                    ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                    )}
                </WindowButton>
                <WindowButton
                    onClick={() => appWindow.close()}
                    className="hover:bg-red-500 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </WindowButton>
            </div>
        </div>
    );
}

function WindowButton({ children, onClick, className }: { children: React.ReactNode, onClick: () => void, className?: string }) {
    return (
        <button
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={cn(
                "w-12 h-full flex items-center justify-center text-white/40 hover:bg-white/[0.12] hover:text-white transition-all cursor-default relative pointer-events-auto",
                className
            )}
        >
            {children}
        </button>
    );
}
