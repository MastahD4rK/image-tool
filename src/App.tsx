import { useState, useEffect } from "react";
import { useFileSystem } from "./hooks/useFileSystem";
import { useImageProcessor } from "./hooks/useImageProcessor";
import { EntryScreen } from "./components/EntryScreen";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { FileListView } from "./components/FileListView";
import { TitleBar } from "./components/TitleBar";
import { WorkEnv } from "./types";

function App() {
  const [env, setEnv] = useState<WorkEnv>('selection');
  const [searchQuery, setSearchQuery] = useState("");

  const {
    rootEntries,
    currentPath,
    filesInView,
    setFilesInView,
    toggleFolder,
    initRoot
  } = useFileSystem();

  const {
    isProcessing,
    processFile,
    setOptions
  } = useImageProcessor();

  useEffect(() => {
    if (env !== 'selection') {
      initRoot();
      setOptions(prev => ({ ...prev, storage_type: env }));
    }
  }, [env, initRoot, setOptions]);

  const handleUpdateFile = (updatedFile: any) => {
    setFilesInView(prev => prev.map(f => f.path === updatedFile.path ? updatedFile : f));
  };

  if (env === 'selection') {
    return (
      <div className="h-screen flex flex-col bg-black overflow-hidden border border-white/[0.08] selection:bg-white/10">
        <TitleBar />
        <div className="flex-1">
          <EntryScreen onSelect={setEnv} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white font-sans overflow-hidden border border-white/[0.08] select-none selection:bg-white/10 shadow-[inner_0_0_100px_rgba(255,255,255,0.03)]">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          rootEntries={rootEntries}
          currentPath={currentPath}
          onToggle={toggleFolder}
          onExit={() => setEnv('selection')}
        />

        <main className="flex-1 flex flex-col bg-black">
          <TopBar
            currentPath={currentPath}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Column Headers */}
          <div className="h-8 border-b border-white/[0.04] bg-black flex items-center px-8 text-[8px] font-bold text-white/40 uppercase tracking-[0.3em] cursor-default">
            <div className="w-[70%]">Archivo</div>
            <div className="w-[15%] text-center">Estado</div>
            <div className="w-[15%] text-right">Acción</div>
          </div>

          <div className="flex-1 overflow-x-hidden overflow-y-auto bg-black p-2">
            <FileListView
              files={filesInView}
              searchQuery={searchQuery}
              onProcess={(file) => processFile(file, handleUpdateFile)}
            />
          </div>

          {/* Status Bar */}
          <footer className="h-6 bg-black border-t border-white/[0.04] px-6 flex items-center justify-between text-[7px] font-bold text-white/30 uppercase tracking-[0.4em]">
            <div className="flex items-center gap-6">
              <span className="text-white/40">{filesInView.length} IMGS</span>
              <span className="text-white/20">ENV: {env}</span>
            </div>
            <div className="flex items-center gap-4">
              {isProcessing && (
                <div className="flex items-center gap-1.5 text-blue-400">
                  <div className="w-0.5 h-0.5 rounded-full bg-blue-400 animate-pulse" /> PROCESANDO
                </div>
              )}
              <span className="text-white/10">BUILD v2.0.6</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
