import type { Project as UtooProject } from "@utoo/web";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { serviceWorkerScope } from "../services/utooService";

interface FileState {
  content: string;
  isDirty: boolean;
  isSaving?: boolean;
}

interface UseFileContentReturn {
  openFiles: string[];
  openFile: (filePath: string) => Promise<void>;
  closeFile: (filePath: string) => Promise<void>;
  selectedFilePath: string;
  selectedFileContent: string;
  fileState: { isDirty: boolean; isSaving: boolean };
  setSelectedFileContent: (content: string) => void;
  manualSaveFile: () => Promise<void>;
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
  fetchFileContent: (filePath: string) => Promise<void>;
  error: string;
}

export const useFileContent = (
  project: UtooProject | null,
  onShowConfirm?: (title: string) => Promise<"save" | "dontSave" | null>,
): UseFileContentReturn => {
  const [openFiles, setOpenFiles] = useState<string[]>(["src/index.tsx"]);
  const [fileStates, setFileStates] = useState<Record<string, FileState>>({});
  const [selectedFilePath, setSelectedFilePath] =
    useState<string>("src/index.tsx");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const initializingRef = useRef(false);

  const updateFileState = useCallback(
    (filePath: string, updates: Partial<FileState>) => {
      setFileStates((prev) => ({
        ...prev,
        [filePath]: { ...prev[filePath], ...updates },
      }));
    },
    [],
  );

  const readAndOpenFile = useCallback(
    async (filePath: string) => {
      try {
        if (!project) throw new Error("Project not initialized.");
        const content = await project.readFile(filePath, "utf8");
        updateFileState(filePath, { content, isDirty: false, isSaving: false });
        setSelectedFilePath(filePath);
        setOpenFiles((prev) =>
          prev.includes(filePath) ? prev : [...prev, filePath],
        );
        if (filePath.endsWith("dist/index.html")) {
          setPreviewUrl(`${location.origin}${serviceWorkerScope}/${filePath}`);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(`Error reading file: ${errorMessage}`);
      }
    },
    [project, updateFileState],
  );

  const openFile = useCallback(
    async (filePath: string) => {
      if (!fileStates[filePath]) {
        await readAndOpenFile(filePath);
      } else {
        setSelectedFilePath(filePath);
        setOpenFiles((prev) =>
          prev.includes(filePath) ? prev : [...prev, filePath],
        );
      }
    },
    [fileStates, readAndOpenFile],
  );

  const closeFile = useCallback(
    async (filePath: string) => {
      if (fileStates[filePath]?.isDirty) {
        const fileName = filePath.split("/").pop();
        const title = `Do you want to save the changes you made to ${fileName}?`;
        const action = await onShowConfirm?.(title);

        if (action === null) {
          return;
        } else if (action === "save") {
          try {
            updateFileState(filePath, { isSaving: true });
            await project?.writeFile(filePath, fileStates[filePath].content);
            updateFileState(filePath, { isDirty: false, isSaving: false });
          } catch (e: unknown) {
            setError(
              `Error saving file: ${e instanceof Error ? e.message : String(e)}`,
            );
            updateFileState(filePath, { isSaving: false });
            return;
          }
        }
      }

      const remainingFiles = openFiles.filter((p) => p !== filePath);
      if (selectedFilePath === filePath) {
        setSelectedFilePath(
          remainingFiles.length > 0
            ? remainingFiles[remainingFiles.length - 1]
            : "",
        );
      }
      setOpenFiles(remainingFiles);
      setFileStates((prev) => {
        const { [filePath]: _, ...rest } = prev;
        return rest;
      });
    },
    [
      openFiles,
      fileStates,
      selectedFilePath,
      onShowConfirm,
      project,
      updateFileState,
    ],
  );

  const setSelectedFileContent = useCallback(
    (content: string) => {
      if (!selectedFilePath) return;
      updateFileState(selectedFilePath, { content, isDirty: true });
    },
    [selectedFilePath, updateFileState],
  );

  const manualSaveFile = useCallback(async () => {
    if (!selectedFilePath || !project) return;
    const fileState = fileStates[selectedFilePath];
    if (!fileState) return;

    updateFileState(selectedFilePath, { isSaving: true });

    try {
      await project.writeFile(selectedFilePath, fileState.content);
      updateFileState(selectedFilePath, { isDirty: false, isSaving: false });
    } catch (e: unknown) {
      setError(
        `Error saving file: ${e instanceof Error ? e.message : String(e)}`,
      );
      updateFileState(selectedFilePath, { isSaving: false });
    }
  }, [selectedFilePath, project, fileStates, updateFileState]);

  useEffect(() => {
    if (!project || initializingRef.current) return;

    initializingRef.current = true;
    openFiles.forEach((p) => {
      if (!fileStates[p]) {
        readAndOpenFile(p);
      }
    });
  }, [project, readAndOpenFile, openFiles, fileStates]);

  const currentFile = useMemo(
    () =>
      fileStates[selectedFilePath] ?? {
        content: "",
        isDirty: false,
        isSaving: false,
      },
    [fileStates, selectedFilePath],
  );

  return {
    openFiles,
    openFile,
    closeFile,
    selectedFilePath,
    selectedFileContent: currentFile.content,
    fileState: {
      isDirty: currentFile.isDirty,
      isSaving: currentFile.isSaving ?? false,
    },
    setSelectedFileContent,
    manualSaveFile,
    previewUrl,
    setPreviewUrl,
    fetchFileContent: readAndOpenFile,
    error,
  };
};
