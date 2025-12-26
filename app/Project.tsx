import { FolderInput, Trash2 } from "lucide-react";
import Image from "next/image";
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

  const previewRef = useRef<{ reload: () => void }>(null);

  const handleBuildReload = useCallback(() => {
    if (previewRef.current) {
      previewRef.current.reload();
    }
  }, []);

  const handleBuildSuccess = useCallback(
    (url: string) => {
      // Automatically set the preview URL after build is complete
      setPreviewUrl(url);
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

  const error = projectError || fileContentError || buildError;

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
      disabled={isBuilding || !project}
      variant="default"
      size="sm"
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {isBuilding ? "Building..." : "Build"}
    </Button>
  );

  const importButton = (
    <Button
      onClick={importDirectory}
      disabled={isImporting || !project}
      variant="ghost"
      size="icon"
      title="Import Folder"
      className="text-slate-400 hover:text-white mr-2"
    >
      <FolderInput className="w-4 h-4" />
    </Button>
  );

  const clearButton = (
    <Button
      onClick={handleClearAll}
      disabled={!project}
      variant="ghost"
      size="icon"
      title="Clear All Files"
      className="text-slate-400 hover:text-red-400 mr-2"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-foreground relative overflow-hidden">
      {/* Tech-style background decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent pointer-events-none z-0" />

      {/* Main content area */}
      <div className="grid grid-cols-[minmax(300px,1fr)_minmax(320px,1.6fr)_minmax(320px,1.4fr)] h-[calc(100vh-3rem)]">
        <Panel
          title="Project"
          actions={
            <div className="flex items-center">
              {clearButton}
              {importButton}
              {buildButton}
            </div>
          }
        >
          {error && (
            <p style={{ textAlign: "center", color: "#ef4444" }}>{error}</p>
          )}
          {(isLoading ||
            (initProgress !== undefined &&
              initProgress > 0 &&
              initProgress < 100)) && (
            <div className="mb-4 px-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-200 font-medium">
                  {initMessage || "Initializing project..."}
                </span>
                <Timer time={initTime} format="seconds" />
              </div>
              <Progress
                value={initProgress || 0}
                className="h-1.5 bg-secondary/20"
              />
            </div>
          )}
          {(isBuilding ||
            (buildProgress !== undefined && buildProgress > 0)) && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-200 font-medium">
                  {buildMessage || "Building project..."}
                </span>
                <Timer time={buildTime} format="seconds" />
              </div>
              <Progress
                value={buildProgress || 0}
                className="h-1.5 bg-secondary/20"
              />
            </div>
          )}
          {!isLoading && !error && (
            <ul className="flex flex-col gap-1 px-4 py-2 items-start">
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
                  selectedFile={selectedFilePath} // Pass the selectedFilePath state here
                  onContextMenu={handleContextMenu}
                  creatingItem={creatingItem}
                  onCreateConfirm={handleCreateConfirm}
                  onCreateCancel={cancelCreating}
                />
              ))}
            </ul>
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

        <Panel title="Editor" contentStyle={{ paddingTop: "0.5rem" }}>
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
          />
        </Panel>

        <Panel title="Preview" contentStyle={{ padding: 0 }}>
          <Preview
            ref={previewRef}
            url={previewUrl}
            isLoading={isLoading}
            isBuilding={isBuilding}
            initProgress={initProgress}
            initMessage={initMessage}
            initTime={initTime}
            buildProgress={buildProgress}
            buildMessage={buildMessage}
            buildTime={buildTime}
          />
        </Panel>
      </div>

      <div className="flex items-center justify-between px-6 py-2 bg-card/20 backdrop-blur-sm border-t border-border/30">
        <div className="flex items-center gap-2">
          <Image
            src="https://avatars.githubusercontent.com/u/217533135?s=200&v=4"
            alt="Utoo Logo"
            width={20}
            height={20}
            className="rounded-md shadow-lg"
          />
          <h1 className="text-md font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Utoo REPL
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <a
            href="https://npmjs.org/@utoo/web"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-primary hover:text-primary/80 transition-colors"
          >
            @utoo/web
          </a>
          <span>and</span>
          <a
            href="https://nextjs.org/docs/app/api-reference/turbopack"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-primary hover:text-primary/80 transition-colors"
          >
            turbopack
          </a>
        </div>
      </div>
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
