import React, { useEffect, useRef } from 'react';
import { FilePlus, FolderPlus } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onNewFile, onNewFolder }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    }
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 text-slate-200 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer"
        onClick={() => {
          onNewFile();
          onClose();
        }}
      >
        <FilePlus className="w-4 h-4 text-blue-400" />
        <span>New File...</span>
      </div>
      <div
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer"
        onClick={() => {
          onNewFolder();
          onClose();
        }}
      >
        <FolderPlus className="w-4 h-4 text-yellow-400" />
        <span>New Folder...</span>
      </div>
    </div>
  );
};
