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
                // Using Catppuccin Mocha theme
                monaco.editor.defineTheme('catppuccin-mocha', {
                    base: 'vs-dark',
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
                monaco.editor.setTheme('catppuccin-mocha');
            }}
        />
    );
};
