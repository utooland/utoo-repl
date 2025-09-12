import React, { useState } from "react";
import {
  ChevronRight,
  Folder,
  File,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileTreeItemProps } from "../types";

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  item,
  onFileClick,
  onDirectoryExpand,
  selectedFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(item.fullName === ".");

  const isSelected = selectedFile === item.fullName;

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
    } else if (item.type === "directory") {
      // Also toggle expansion on directory name click
      handleToggleExpand({ stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  const renderIcon = () => {
    if (item.type === "directory") {
      return isExpanded ? (
        <FolderOpen className="w-4 h-4 text-purple-400" />
      ) : (
        <Folder className="w-4 h-4 text-purple-400" />
      );
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <li className="flex flex-col text-sm w-full">
      <div
        className={cn(
          "flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-150 w-full",
          isSelected
            ? "bg-purple-500/20 text-white"
            : "text-slate-300 hover:bg-slate-700/50",
        )}
        onClick={handleItemClick}
        style={{ paddingLeft: `${item.fullName.split("/").length * 1}rem` }}
      >
        <div className="flex items-center gap-2 flex-1">
          {item.type === "directory" ? (
            <ChevronRight
              className={cn(
                "w-4 h-4 transform transition-transform duration-150",
                isExpanded && "rotate-90",
              )}
              onClick={handleToggleExpand}
            />
          ) : (
            <div className="w-4" /> // Placeholder for alignment
          )}
          {renderIcon()}
          <span className="flex-1 truncate">{item.name}</span>
        </div>
        {item.type === "directory" && onDirectoryExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDirectoryExpand(item);
            }}
            className="p-1 rounded-md hover:bg-slate-600 transition-colors"
            title="Refresh directory"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>
      {isExpanded && item.children && (
        <ul className="pl-4 w-full">
          {item.children.map((child) => (
            <FileTreeItem
              key={child.fullName}
              item={child}
              onFileClick={onFileClick}
              onDirectoryExpand={onDirectoryExpand}
              selectedFile={selectedFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
