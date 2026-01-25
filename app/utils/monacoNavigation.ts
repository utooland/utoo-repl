import type { Monaco } from "@monaco-editor/react";

type Dispose = () => void;

export const wireFileNavigation = (
  editor: any,
  monaco: Monaco,
  onSwitchFile: (filePath: string) => void,
): Dispose => {
  const openerDispose = monaco.editor.registerEditorOpener({
    // Keep signature flexible to be compatible across versions
    openCodeEditor: async (_source: any, resource: any) => {
      if (resource?.scheme === "file") {
        const path = resource.path || "";
        const cleanPath = (typeof path === "string" ? path : String(path)).replace(/^\/+/, "");
        onSwitchFile(cleanPath);
        return true;
      }
      return false;
    },
  });

  const modelSub = editor.onDidChangeModel(() => {
    const model = editor.getModel?.();
    const uri = model?.uri;
    if (uri && uri.scheme === "file") {
      const path = uri.path || "";
      const cleanPath = (typeof path === "string" ? path : String(path)).replace(/^\/+/, "");
      onSwitchFile(cleanPath);
    }
  });

  return () => {
    try {
      modelSub?.dispose?.();
    } catch { }
    try {
      openerDispose?.dispose?.();
    } catch { }
  };
};
