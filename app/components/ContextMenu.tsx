import { FilePlus, FolderPlus, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onDelete: () => void;
  selectedItem?: { type: "file" | "directory" } | null;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onNewFile,
  onNewFolder,
  onDelete,
  selectedItem,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const canDelete = selectedItem?.type === "directory";

  useEffect(() => {
    const handleInteractionOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleInteractionOutside);
    document.addEventListener("contextmenu", handleInteractionOutside);
    return () => {
      document.removeEventListener("mousedown", handleInteractionOutside);
      document.removeEventListener("contextmenu", handleInteractionOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-50 min-w-[160px] bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 text-slate-200 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      <div
        role="menuitem"
        tabIndex={0}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer focus:bg-slate-700 focus:outline-none"
        onClick={() => {
          onNewFile();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onNewFile();
            onClose();
          }
        }}
      >
        <FilePlus className="w-4 h-4 text-blue-400" />
        <span>New File...</span>
      </div>
      <div
        role="menuitem"
        tabIndex={0}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer focus:bg-slate-700 focus:outline-none"
        onClick={() => {
          onNewFolder();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onNewFolder();
            onClose();
          }
        }}
      >
        <FolderPlus className="w-4 h-4 text-yellow-400" />
        <span>New Folder...</span>
      </div>
      <div className="border-t border-slate-700 my-1" />
      {canDelete && (
        <div
          role="menuitem"
          tabIndex={0}
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer hover:text-red-400 focus:bg-slate-700 focus:text-red-400 focus:outline-none"
          onClick={() => {
            onDelete();
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onDelete();
              onClose();
            }
          }}
        >
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>Delete</span>
        </div>
      )}
    </div>
  );
};
