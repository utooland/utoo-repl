import React from "react";
import MonacoEditor from "@monaco-editor/react";

interface EditorProps {
    filePath: string;
    content: string;
    onContentChange: (newContent: string) => void;
}

export const Editor = ({ filePath, content, onContentChange }: EditorProps) => {
    const modelUri = filePath ? `file:///${filePath.replace(/^\.\//, '')}` : undefined;

    if (!filePath) {
        return null;
    }

    return (
        <MonacoEditor
            height="100%"
            width="100%"
            path={modelUri}
            language={
                ["tsx", "ts", "jsx", "js"].some((ext) =>
                    filePath.endsWith(ext),
                )
                    ? "typescript"
                    : filePath.endsWith(".json")
                        ? "json"
                        : filePath.endsWith(".css")
                            ? "css"
                            : filePath.endsWith(".html")
                                ? "html"
                                : "plaintext"
            }
            value={content}
            onChange={(value) => onContentChange(value || "")}
            theme="custom-dark"
            options={{
                readOnly: false,
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', monospace",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                wordWrap: "on",
                automaticLayout: true,
            }}
            beforeMount={(monaco) => {
                monaco.editor.defineTheme('custom-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                        'editor.background': '#0f172a',
                        'editor.foreground': '#f8fafc',
                        'editor.lineHighlightBackground': '#1e293b',
                        'editor.selectionBackground': '#3b82f64d',
                        'editor.inactiveSelectionBackground': '#1e293b',
                        'editorCursor.foreground': '#3b82f6',
                        'editorLineNumber.foreground': '#94a3b8',
                        'editorLineNumber.activeForeground': '#f8fafc',
                        'editorGutter.background': '#0f172a',
                        'editorBracketMatch.background': '#1e293b',
                        'editorBracketMatch.border': '#3b82f6',
                    }
                });
            }}
            onMount={(editor, monaco) => {
                monaco.editor.setTheme('custom-dark');
            }}
        />
    );
};
