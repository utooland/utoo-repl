import MonacoEditor from "@monaco-editor/react";
import type { Project as UtooProject } from "@utoo/web";
import { type FC, useCallback, useEffect, useMemo } from "react";
import { useMonacoTypeSync } from "../hooks/useMonacoTypeSync";
import { wireFileNavigation } from "../utils/monacoNavigation";

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
  project: UtooProject;
}

const LANGUAGE_MAP: Record<string, string> = {
  tsx: "typescript",
  ts: "typescript",
  jsx: "typescript",
  js: "typescript",
  json: "json",
  css: "css",
  less: "less",
  html: "html",
};

const getLanguage = (filename: string): string => {
  const ext = filename.split(".").pop() || "";
  return LANGUAGE_MAP[ext] || "plaintext";
};

export const Editor: FC<EditorProps> = ({
  openFiles,
  activeFile,
  content,
  isDirty,
  isSaving = false,
  onContentChange,
  onSwitchFile,
  onCloseFile,
  onSave,
  project,
}) => {
  const modelUri = useMemo(
    () =>
      activeFile ? `file:///${activeFile.replace(/^\.\//, "")}` : undefined,
    [activeFile],
  );
  const language = useMemo(() => getLanguage(activeFile), [activeFile]);
  const hasOpenFiles = openFiles.length > 0;

  const { syncTypes } = useMonacoTypeSync(project, activeFile);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && onSave && isDirty) {
        e.preventDefault();
        onSave();
      }
    },
    [isDirty, onSave],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-full flex flex-col">
      {hasOpenFiles && (
        <div
          role="tablist"
          className="flex items-center gap-1 px-2 py-1 bg-card/10 border-b border-border/20 overflow-x-auto flex-shrink-0"
        >
          {openFiles.map((file) => {
            const name = file.split("/").pop() || file;
            const isActive = file === activeFile;
            const isDirtyForFile = isDirty && isActive;
            return (
              <div
                key={file}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => onSwitchFile(file)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSwitchFile(file);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer text-sm whitespace-nowrap transition-all select-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 ${
                  isActive
                    ? "bg-purple-600/30 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/30"
                }`}
                title={file}
              >
                <span className="truncate max-w-[150px]">{name}</span>
                {isDirtyForFile && (
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isSaving ? "bg-blue-400 animate-pulse" : "bg-orange-400"
                    }`}
                    title={isSaving ? "Saving..." : "Unsaved changes"}
                  />
                )}
                <button
                  type="button"
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

      {hasOpenFiles ? (
        <div className="flex-1 min-h-0">
          <MonacoEditor
            width="100%"
            height="100%"
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
              const compilerOptions = {
                target: monaco.languages.typescript.ScriptTarget.ESNext,
                allowNonTsExtensions: true,
                moduleResolution:
                  monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                noEmit: true,
                jsx: monaco.languages.typescript.JsxEmit.React,
                allowJs: true,
                reactNamespace: "React",
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                baseUrl: "file:///",
                paths: {
                  "*": ["*", "node_modules/*"],
                },
                typeRoots: ["node_modules/@types"],
                skipLibCheck: true,
                skipDefaultLibCheck: true,
              };
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                compilerOptions,
              );
              monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
                compilerOptions,
              );
              monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
                true,
              );
              monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
                true,
              );
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                {
                  noSemanticValidation: false,
                  noSyntaxValidation: false,
                },
              );
              monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                {
                  noSemanticValidation: false,
                  noSyntaxValidation: false,
                },
              );
              monaco.languages.css.cssDefaults.setOptions({ validate: true });
              monaco.languages.css.lessDefaults.setOptions({ validate: true });
              monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
              });
              monaco.languages.html.htmlDefaults.setOptions({
                format: {
                  tabSize: 2,
                  insertSpaces: true,
                  wrapLineLength: 120,
                  unformatted:
                    'default": "a, abbr, acronym, b, bdo, big, br, button, cite, code, dfn, em, i, img, input, kbd, label, map, object, q, samp, select, small, span, strong, sub, sup, textarea, tt, var',
                  contentUnformatted: "pre",
                  indentInnerHtml: false,
                  preserveNewLines: true,
                  maxPreserveNewLines: null,
                  indentHandlebars: false,
                  endWithNewline: false,
                  extraLiners: "head, body, /html",
                  wrapAttributes: "auto",
                },
                suggest: { html5: true, angular1: true, ionic: true },
              });

              // Using a refined Cyberpunk-inspired Dark theme
              monaco.editor.defineTheme("modern-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  { token: "comment", foreground: "64748b", fontStyle: "italic" },
                  { token: "string", foreground: "4ade80" },
                  { token: "number", foreground: "fbbf24" },
                  { token: "keyword", foreground: "f472b6" },
                  { token: "operator", foreground: "94e2d5" },
                  { token: "delimiter", foreground: "94a3b8" },
                  { token: "tag", foreground: "f472b6" },
                  { token: "attribute.name", foreground: "89dceb" },
                  { token: "attribute.value", foreground: "4ade80" },
                  { token: "type", foreground: "fab387" },
                  { token: "identifier", foreground: "f1f5f9" },
                  { token: "predefined", foreground: "60a5fa" },
                  { token: "variable", foreground: "f1f5f9" },
                  { token: "function", foreground: "60a5fa" },
                  { token: "constant", foreground: "fab387" },
                  { token: "property", foreground: "818cf8" },
                ],
                colors: {
                  "editor.background": "#020617",
                  "editor.foreground": "#f1f5f9",
                  "editor.lineHighlightBackground": "#1e293b50",
                  "editor.selectionBackground": "#33415580",
                  "editorCursor.foreground": "#f472b6",
                  "editorLineNumber.foreground": "#475569",
                  "editorLineNumber.activeForeground": "#94a3b8",
                  "editorGutter.background": "#020617",
                  "editorBracketMatch.background": "#0f172a",
                  "editorBracketMatch.border": "#f472b6",
                  "editor.selectionHighlightBackground": "#33415550",
                  "editorWidget.background": "#0f172a",
                  "editorWidget.border": "#334155",
                  "editorSuggestWidget.background": "#0f172a",
                  "editorSuggestWidget.border": "#334155",
                  "editorSuggestWidget.selectedBackground": "#1e293b",
                  "editorHoverWidget.background": "#0f172a",
                  "editorHoverWidget.border": "#334155",
                },
              });
            }}
            onMount={(editor, monaco) => {
              monaco.editor.setTheme("modern-dark");
              syncTypes(monaco);

              const disposeNavigation = wireFileNavigation(
                editor,
                monaco,
                onSwitchFile,
              );
              editor.onDidDispose(() => disposeNavigation());
            }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1">
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
  );
};
