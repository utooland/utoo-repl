import { useCallback, useState } from "react";
import { FileTreeNode, CreateItemState } from "../types";

type ContextMenuState = {
  visible: boolean;
  x: number;
  y: number;
  item: FileTreeNode | null;
};

export const useContextMenu = (onDirectoryExpand?: (item: FileTreeNode) => void) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  const [creatingItem, setCreatingItem] = useState<CreateItemState | null>(null);
  const [deletingItem, setDeletingItem] = useState<FileTreeNode | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, item: FileTreeNode) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, item });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const getParentPath = (item: FileTreeNode): string =>
    item.type === "directory" ? item.fullName : item.fullName.split("/").slice(0, -1).join("/") || ".";

  const handleCreateItem = useCallback((type: "file" | "folder") => {
    const item = contextMenu.item;
    if (!item) return;

    if (item.type === "directory" && onDirectoryExpand) {
      onDirectoryExpand(item);
    }

    setCreatingItem({
      type,
      parentPath: getParentPath(item),
      parentType: item.type,
    });
  }, [contextMenu.item, onDirectoryExpand]);

  const handleDelete = useCallback(() => {
    const item = contextMenu.item;
    if (!item) return;
    setDeletingItem(item);
  }, [contextMenu.item]);

  const cancelCreating = useCallback(() => {
    setCreatingItem(null);
  }, []);

  const cancelDeleting = useCallback(() => {
    setDeletingItem(null);
  }, []);

  return { 
    contextMenu, 
    handleContextMenu, 
    closeContextMenu, 
    handleCreateFile: () => handleCreateItem("file"),
    handleCreateFolder: () => handleCreateItem("folder"),
    creatingItem,
    setCreatingItem,
    cancelCreating,
    deletingItem,
    setDeletingItem,
    handleDelete,
    cancelDeleting,
  };
};