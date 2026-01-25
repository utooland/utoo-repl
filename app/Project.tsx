import { FolderUp, Eraser, Play, Zap, Terminal } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ContextMenu } from "./components/ContextMenu";
import { Editor } from "./components/Editor";
import { FileTreeItem } from "./components/FileTree";
import { Panel } from "./components/Panel";
import { Preview } from "./components/Preview";
import { Timer } from "./components/Timer";
import { useBuild } from "./hooks/useBuild";
import { useConfirmDialog } from "./hooks/useConfirmDialog";
import { useContextMenu } from "./hooks/useContextMenu";
import { useDev } from "./hooks/useDev";
import { useFileContent } from "./hooks/useFileContent";
import { useFileTree } from "./hooks/useFileTree";
import { useImportDirectory } from "./hooks/useImportDirectory";
import { useUtooProject } from "./hooks/useUtooProject";
import "./styles.css";

const Project = () => {
  const { dialogState, showConfirmDialog, handleDialogAction } =
    useConfirmDialog();

  const {
    project,
    isLoading,
    error: projectError,
    initProgress,
    initMessage,
    initTime,
  } = useUtooProject();
  const {
    fileTree,
    handleDirectoryExpand,
    createFile,
    createFolder,
    deleteItem,
    clearAll,
  } = useFileTree(project);
  const { importDirectory, isImporting } = useImportDirectory(project);
  const {
    openFiles,
    openFile,
    closeFile,
    selectedFilePath,
    selectedFileContent,
    fileState,
    setSelectedFileContent,
    manualSaveFile,
    previewUrl,
    setPreviewUrl,
    error: fileContentError,
  } = useFileContent(project, showConfirmDialog);

  const previewRef = useRef<{
    reload: () => void;
    getIframe: () => HTMLIFrameElement | null;
  }>(null);

  // HMR iframe connection handler
  const handleConnectHmrIframe = useCallback(
    (iframe: HTMLIFrameElement) => {
      if (!project) return null;
      return project.connectHmrIframe(iframe);
    },
    [project],
  );

  const handleBuildReload = useCallback(() => {
    if (previewRef.current) {
      previewRef.current.reload();
    }
  }, []);

  const handleBuildSuccess = useCallback(
    (url: string) => {
      // Clear URL first to ensure iframe mount/unmount or state reset if URL changed
      setPreviewUrl("");
      // Using setTimeout to ensure state cycle for potential flash avoidance or re-mounting
      setTimeout(() => setPreviewUrl(url), 0);
    },
    [setPreviewUrl],
  );

  const {
    isBuilding,
    handleBuild,
    error: buildError,
    buildProgress,
    buildMessage,
    buildTime,
  } = useBuild(
    project,
    fileTree,
    handleDirectoryExpand,
    handleBuildReload,
    handleBuildSuccess,
  );

  const {
    isDevMode,
    isBuilding: isDevBuilding,
    startDev,
    stopDev,
    error: devError,
    buildProgress: devProgress,
    buildMessage: devMessage,
    buildTime: devTime,
  } = useDev(project, fileTree, handleDirectoryExpand, {
    // HMR will handle updates automatically, no need to manually reload
    onBuildComplete: undefined,
    onPreviewReady: handleBuildSuccess,
  });

  const currentIsBuilding = isBuilding || isDevBuilding;
  const currentBuildProgress = isDevBuilding ? devProgress : buildProgress;
  const currentBuildMessage = isDevBuilding ? devMessage : buildMessage;
  const currentBuildTime = isDevBuilding ? devTime : buildTime;
  const currentBuildError =
    projectError || fileContentError || buildError || devError;

  const error = currentBuildError;

  const memoizedFileTree = useMemo(() => fileTree, [fileTree]);

  const {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
    handleCreateFile,
    handleCreateFolder,
    handleDelete,
    creatingItem,
    cancelCreating,
    deletingItem,
    cancelDeleting,
  } = useContextMenu(handleDirectoryExpand);

  const handleCreateConfirm = useCallback(
    async (name: string) => {
      if (!creatingItem) return;

      try {
        const isFile = creatingItem.type === "file";
        isFile
          ? await createFile(creatingItem.parentPath, name)
          : await createFolder(creatingItem.parentPath, name);
        toast.success(`${isFile ? "文件" : "文件夹"} "${name}" 创建成功`);
        cancelCreating();
      } catch (error) {
        console.error("Error creating item:", error);
        toast.error(
          `创建失败: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [creatingItem, createFile, createFolder, cancelCreating],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;

    try {
      await deleteItem(deletingItem.fullName);
      toast.success(`文件夹 "${deletingItem.name}" 已删除`);
      cancelDeleting();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(
        `删除失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [deletingItem, deleteItem, cancelDeleting]);

  const handleClearAll = () => {
    toast("Are you sure you want to clear all files?", {
      description: "This action cannot be undone.",
      action: {
        label: "Clear All",
        onClick: async () => {
          try {
            await clearAll();
            toast.success("Project cleared successfully");
          } catch (error) {
            console.error("Error clearing project:", error);
            toast.error("Failed to clear project");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  useEffect(() => {
    if (deletingItem) {
      handleDeleteConfirm();
    }
  }, [deletingItem, handleDeleteConfirm]);

  const buildButton = (
    <Button
      type="button"
      onClick={handleBuild}
      disabled={isBuilding || isDevMode || !project}
      variant="outline"
      size="sm"
      className="tech-border-neon bg-purple-500/5 text-purple-400 border-purple-500/30 hover:bg-purple-500/15 transition-all duration-300 font-mono text-[10px] uppercase tracking-wider h-7 min-w-[72px] px-2"
    >
      <Play className="w-3 h-3 mr-1 opacity-80 fill-purple-400 flex-shrink-0" />
      <span className="truncate">{isBuilding ? "Compiling" : "Build"}</span>
    </Button>
  );

  const devButton = (
    <Button
      type="button"
      onClick={isDevMode ? stopDev : startDev}
      disabled={isBuilding || !project}
      variant={isDevMode ? "destructive" : "outline"}
      size="sm"
      className={
        cn(
          "font-mono text-[10px] uppercase tracking-wider h-7 min-w-[72px] px-2 transition-all duration-300",
          isDevMode
            ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]"
            : "border-cyan-500/30 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400/15"
        )
      }
    >
      <Zap className={cn("w-3 h-3 mr-1 flex-shrink-0", isDevMode ? "fill-red-400" : "fill-cyan-400")} />
      {isDevMode ? "Stop" : "Dev"}
    </Button>
  );

  const importButton = (
    <Button
      onClick={importDirectory}
      disabled={isImporting || !project}
      variant="ghost"
      size="icon"
      title="Import Folder"
      className="text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all w-8 h-8"
    >
      <FolderUp className="w-4 h-4" />
    </Button>
  );

  const clearButton = (
    <Button
      onClick={handleClearAll}
      disabled={!project}
      variant="ghost"
      size="icon"
      title="Clear Project"
      className="text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-8 h-8"
    >
      <Eraser className="w-4 h-4" />
    </Button>
  );

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-foreground relative overflow-hidden font-sans">
      {/* High-Tech Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep Grid Base */}
        <div className="absolute inset-0 tech-grid opacity-20" />
        <div className="absolute inset-0 tech-grid-faint opacity-10" />
        
        {/* Animated Scanline */}
        <div className="scanline" />

        {/* Dynamic Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main content area */}
      <div className="flex-1 grid grid-cols-[minmax(280px,0.8fr)_minmax(400px,2fr)_minmax(320px,1.2fr)] relative z-10">
        <Panel
          title="Explorer"
          actions={
            <div className="flex items-center gap-1.5">
              {clearButton}
              {importButton}
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              {buildButton}
              {devButton}
            </div>
          }
        >
          {error && (
            <div className="m-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-center color-[#ef4444] leading-relaxed">
                {typeof error === "string" ? error : ((error as any)?.message || "An unknown error occurred")}
              </p>
            </div>
          )}
          {(isLoading ||
            (initProgress !== undefined &&
              initProgress > 0 &&
              initProgress < 100)) && (
            <div className="px-4 py-3 bg-white/5 border-b border-white/5 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  {initMessage || "Booting Project..."}
                </span>
                <Timer time={initTime} format="seconds" />
              </div>
              <Progress
                value={initProgress || 0}
                className="h-1 bg-purple-500/20"
              />
            </div>
          )}
          {!isLoading && !error && (
            <div className="pb-8">
              <ul className="flex flex-col gap-0.5">
                {memoizedFileTree.map((item) => (
                  <FileTreeItem
                    key={item.fullName}
                    item={item}
                    onFileClick={openFile}
                    onDirectoryExpand={
                      item.type === "directory"
                        ? handleDirectoryExpand
                        : undefined
                    }
                    selectedFile={selectedFilePath}
                    onContextMenu={handleContextMenu}
                    creatingItem={creatingItem}
                    onCreateConfirm={handleCreateConfirm}
                    onCreateCancel={cancelCreating}
                  />
                ))}
              </ul>
            </div>
          )}
        </Panel>

        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onNewFile={handleCreateFile}
            onNewFolder={handleCreateFolder}
            onDelete={handleDelete}
            selectedItem={
              contextMenu.item ? { type: contextMenu.item.type } : null
            }
          />
        )}

        <Panel title="Editor">
          <Editor
            openFiles={openFiles}
            activeFile={selectedFilePath}
            content={selectedFileContent}
            isDirty={fileState.isDirty}
            isSaving={fileState.isSaving}
            onContentChange={setSelectedFileContent}
            onSwitchFile={openFile}
            onCloseFile={closeFile}
            onSave={manualSaveFile}
            project={project}
          />
        </Panel>

        <Panel title="Live Preview">
          <Preview
            ref={previewRef}
            url={previewUrl}
            isLoading={isLoading}
            isBuilding={currentIsBuilding}
            isDevMode={isDevMode}
            initProgress={initProgress}
            initMessage={initMessage}
            initTime={initTime}
            buildProgress={currentBuildProgress}
            buildMessage={currentBuildMessage}
            buildTime={currentBuildTime}
            onIframeReady={handleConnectHmrIframe}
          />
        </Panel>
      </div>

      <footer className="h-10 flex items-center justify-between px-4 glass-header z-20 relative">
        <div className="flex items-center gap-3">
          <div className="p-1 px-1.5 rounded-md bg-white/5 border border-white/10 tech-border-neon">
            <Image
              src="https://avatars.githubusercontent.com/u/217533135?s=200&v=4"
              alt="Utoo Logo"
              width={14}
              height={14}
              className="rounded-sm opacity-90"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xs font-bold tracking-tight text-futuristic uppercase">
              UTOO REPL
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              High-performance browser-based development laboratory
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="tech-tag text-cyan-500 border-cyan-500/20">System Online</div>
          </div>

          <div className="w-[1px] h-3 bg-white/10" />

          <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
            <span>Core</span>
            <div className="flex items-center gap-1 font-mono">
              <a href="https://npmjs.org/@utoo/web" target="_blank" className="text-slate-300 hover:neon-text-cyan transition-colors">@utoo/web</a>
              <span className="text-slate-700">::</span>
              <a href="https://nextjs.org" target="_blank" className="text-slate-300 hover:neon-text-purple transition-colors">turbopack</a>
            </div>
          </div>
          
          <div className="w-[1px] h-3 bg-white/10" />
          
          <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-slate-400">
            <span className="text-slate-600 font-mono text-[8px]">HOST//</span>
            <a href="https://vercel.com" target="_blank" className="flex items-center gap-1 hover:text-white transition-colors">
              <span className="font-bold text-slate-200 uppercase tracking-tighter">Vercel</span>
            </a>
          </div>
        </div>
      </footer>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        onSave={() => handleDialogAction("save")}
        onDontSave={() => handleDialogAction("dontSave")}
        onCancel={() => handleDialogAction(null)}
      />
    </div>
  );
};

export default Project;
