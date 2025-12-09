import React, { useMemo, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";

interface EditorProps {
  openFiles: string[];
  activeFile: string;
  content: string;
  isDirty: boolean;
  isSaving?: boolean;
  onContentChange: (newContent: string) => void;
  onSwitchFile: (filePath: string) => void;
  onCloseFile: (filePath: string) => void;
  onSave?: () => Promise<void>;
}

const LANGUAGE_MAP: Record<string, string> = {
  tsx: "typescript",
  ts: "typescript",
  jsx: "typescript",
  js: "typescript",
  json: "json",
  css: "css",
  html: "html",
};

const getLanguage = (filename: string): string => {
  const ext = filename.split(".").pop() || "";
  return LANGUAGE_MAP[ext] || "plaintext";
};

export const Editor: React.FC<EditorProps> = ({
  openFiles,
  activeFile,
  content,
  isDirty,
  isSaving = false,
  onContentChange,
  onSwitchFile,
  onCloseFile,
  onSave,
}) => {
  const modelUri = useMemo(
    () => (activeFile ? `file:///${activeFile.replace(/^\.\//, "")}` : undefined),
    [activeFile]
  );
  const language = useMemo(() => getLanguage(activeFile), [activeFile]);
  const hasOpenFiles = openFiles.length > 0;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && onSave && isDirty) {
        e.preventDefault();
        onSave();
      }
    },
    [isDirty, onSave]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-full flex flex-col">
      {hasOpenFiles && (
        <div className="flex items-center gap-1 px-2 py-1 bg-card/10 border-b border-border/20 overflow-x-auto">
          {openFiles.map((file) => {
            const name = file.split("/").pop() || file;
            const isActive = file === activeFile;
            const isDirtyForFile = isDirty && isActive;
            return (
              <div
                key={file}
                onClick={() => onSwitchFile(file)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer text-sm whitespace-nowrap transition-all select-none ${
                  isActive ? "bg-purple-600/30 text-white shadow-lg" : "text-slate-300 hover:bg-slate-700/30"
                }`}
                title={file}
              >
                <span className="truncate max-w-[150px]">{name}</span>
                {isDirtyForFile && (
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${isSaving ? "bg-blue-400 animate-pulse" : "bg-orange-400"}`}
                    title={isSaving ? "Saving..." : "Unsaved changes"}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file);
                  }}
                  className="text-xs text-slate-400 hover:text-red-400 ml-1 flex-shrink-0"
                  aria-label={`Close ${name}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1">
        {hasOpenFiles ? (
          <MonacoEditor
            height="100%"
            width="100%"
            path={modelUri}
            language={language}
            value={content}
            onChange={(value) => onContentChange(value || "")}
            theme="custom-dark"
            options={{
              readOnly: false,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', monospace",
              lineHeight: 1.6,
              letterSpacing: 0.5,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              wordWrap: "on",
              automaticLayout: true,
            }}
            beforeMount={(monaco) => {
              // Using Catppuccin Mocha theme
              monaco.editor.defineTheme("catppuccin-mocha", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  { token: "comment", foreground: "a6adc8", fontStyle: "italic" },
                  { token: "string", foreground: "a6e3a1" },
                  { token: "number", foreground: "f9e2af" },
                  { token: "keyword", foreground: "cba6f7" },
                  { token: "operator", foreground: "94e2d5" },
                  { token: "delimiter", foreground: "cdd6f4" },
                  { token: "tag", foreground: "f38ba8" },
                  { token: "attribute.name", foreground: "94e2d5" },
                  { token: "attribute.value", foreground: "a6e3a1" },
                  { token: "type", foreground: "fab387" },
                  { token: "identifier", foreground: "cdd6f4" },
                  { token: "predefined", foreground: "89b4fa" },
                  { token: "variable", foreground: "cdd6f4" },
                  { token: "function", foreground: "89b4fa" },
                  { token: "constant", foreground: "fab387" },
                  { token: "property", foreground: "89dceb" },
                  { token: "namespace", foreground: "f5c2e7" },
                ],
                colors: {
                  "editor.background": "#1e1e2e",
                  "editor.foreground": "#cdd6f4",
                  "editor.lineHighlightBackground": "#ffffff0a",
                  "editor.selectionBackground": "#585b70",
                  "editorCursor.foreground": "#f5e0dc",
                  "editorLineNumber.foreground": "#7f849c",
                  "editorLineNumber.activeForeground": "#cdd6f4",
                  "editorGutter.background": "#1e1e2e",
                  "editorBracketMatch.background": "#1e1e2e",
                  "editorBracketMatch.border": "#94e2d5",
                },
              });
            }}
            onMount={(editor, monaco) => {
              monaco.editor.setTheme("catppuccin-mocha");
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-6xl opacity-40">📄</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  No files open
                </h3>
                <p className="text-sm text-slate-400">
                  Select a file from the project tree to start editing
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
