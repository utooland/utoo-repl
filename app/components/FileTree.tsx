import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Folder, File, RefreshCw, FolderOpen, FilePlus, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileTreeItemProps } from "../types";

const InlineInput: React.FC<{
  type: "file" | "folder";
  onConfirm: (name: string) => void;
  onCancel: () => void;
  depth: number;
}> = ({ type, onConfirm, onCancel, depth }) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onConfirm(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div
      className="flex items-center py-1.5 px-2 rounded-md w-full min-h-[2.25rem] animate-in fade-in slide-in-from-top-1 duration-150"
      style={{ paddingLeft: `${depth * 1}rem` }}
    >
      <div className="flex items-center gap-2 flex-1 min-h-[1.25rem]">
        <div className="w-4 h-4 flex-shrink-0" />
        {type === "folder" ? (
          <FolderPlus className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        ) : (
          <FilePlus className="w-4 h-4 text-blue-400 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 bg-slate-700 text-slate-200 px-2 py-0.5 rounded border border-purple-500 outline-none focus:border-purple-400 text-sm leading-tight h-5"
        />
      </div>
    </div>
  );
};

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  item,
  onFileClick,
  onDirectoryExpand,
  selectedFile,
  onContextMenu,
  creatingItem,
  onCreateConfirm,
  onCreateCancel,
}) => {
  const [isExpanded, setIsExpanded] = useState(item.fullName === ".");

  const isSelected = selectedFile && selectedFile === item.fullName;
  const depth = item.fullName.split("/").length;
  const shouldShowInput = creatingItem?.parentPath === item.fullName && item.type === "directory";
  const isRoot = item.fullName === ".";

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === "directory") {
      setIsExpanded(!isExpanded);
      if (!isExpanded && onDirectoryExpand) {
        onDirectoryExpand(item);
      }
    }
  };

  const handleItemClick = () => {
    if (item.type === "file") {
      onFileClick(item.fullName);
    } else {
      handleToggleExpand({ stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  const renderIcon = () =>
    item.type === "directory" ? (
      isExpanded ? (
        <FolderOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-purple-400 flex-shrink-0" />
      )
    ) : (
      <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
    );

  useEffect(() => {
    if (shouldShowInput && !isExpanded) {
      setIsExpanded(true);
    }
  }, [shouldShowInput]);

  useEffect(() => {
    if (item.type === "directory" && selectedFile) {
      const isParent = item.fullName !== "." && selectedFile.startsWith(item.fullName + "/");
      if (isParent && !isExpanded) {
        setIsExpanded(true);
        onDirectoryExpand?.(item);
      }
    }
  }, [selectedFile, item.fullName, item.type, onDirectoryExpand]);

  return (
    <li className="flex flex-col text-sm w-full">
      <div
        className={cn(
          "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-150 w-full min-h-[2.25rem] select-none",
          isSelected ? "bg-purple-500/20 text-white" : "text-slate-300 hover:bg-slate-700/50",
          isRoot &&
            "sticky top-0 z-20 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-md border-b border-purple-500/30 shadow-lg"
        )}
        onClick={handleItemClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu?.(e, item);
        }}
        style={{ paddingLeft: `${depth * 1}rem` }}
      >
        <div className="flex items-center gap-2 flex-1 min-h-[1.25rem]">
          {item.type === "directory" ? (
            <ChevronRight
              className={cn(
                "w-4 h-4 flex-shrink-0 transform transition-transform duration-150",
                isExpanded && "rotate-90"
              )}
              onClick={handleToggleExpand}
            />
          ) : (
            <div className="w-4 h-4 flex-shrink-0" /> // Placeholder for alignment
          )}
          {renderIcon()}
          <span className="flex-1 truncate leading-tight">{item.name}</span>
        </div>
        {item.type === "directory" && onDirectoryExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDirectoryExpand(item);
            }}
            className="p-1 rounded-md hover:bg-slate-600 transition-colors flex-shrink-0"
            title="Refresh directory"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>
      {isExpanded && (
        <ul className="w-full">
          {shouldShowInput && onCreateConfirm && onCreateCancel && (
            <li className="w-full">
              <InlineInput
                type={creatingItem.type}
                onConfirm={onCreateConfirm}
                onCancel={onCreateCancel}
                depth={depth + 1}
              />
            </li>
          )}
          {item.children &&
            item.children.map((child) => (
              <FileTreeItem
                key={child.fullName}
                item={child}
                onFileClick={onFileClick}
                onDirectoryExpand={onDirectoryExpand}
                selectedFile={selectedFile}
                onContextMenu={onContextMenu}
                creatingItem={creatingItem}
                onCreateConfirm={onCreateConfirm}
                onCreateCancel={onCreateCancel}
              />
            ))}
        </ul>
      )}
    </li>
  );
};
