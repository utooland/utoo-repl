import type { Project as UtooProject } from "@utoo/web";
import { useCallback, useEffect, useState } from "react";
import type {
  DirectoryExpandParams,
  FileTreeNode,
  ProjectFileItem,
} from "../types";

const projectName = "/utooweb-demo";

const sortFileTreeNodes = (nodes: FileTreeNode[]): FileTreeNode[] =>
  nodes.sort((a, b) =>
    a.type === b.type
      ? a.name.localeCompare(b.name)
      : a.type.localeCompare(b.type),
  );

const joinPath = (parent: string, child: string): string =>
  parent === "." ? child : `${parent}/${child}`;

const itemToFileTreeNode = (
  item: ProjectFileItem,
  fullName: string,
): FileTreeNode => ({
  name: item.name,
  fullName,
  type: item.isDirectory() ? ("directory" as const) : ("file" as const),
  children: item.isDirectory() ? [] : null,
});

const loadDirectoryChildren = async (
  project: UtooProject,
  parentPath: string,
): Promise<FileTreeNode[]> => {
  const children = await project.readdir(parentPath);
  return sortFileTreeNodes(
    children.map((item) =>
      itemToFileTreeNode(item, joinPath(parentPath, item.name)),
    ),
  );
};

export const useFileTree = (project: UtooProject | null) => {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(["."]));

  const buildInitialFileTree = useCallback(async (proj: UtooProject) => {
    const children = await loadDirectoryChildren(proj, ".");
    setFileTree([
      {
        name: projectName,
        fullName: ".",
        type: "directory" as const,
        children,
      },
    ]);
  }, []);

  useEffect(() => {
    if (project) {
      buildInitialFileTree(project);
    }
  }, [project, buildInitialFileTree]);

  const updateTreeWithChildren = useCallback(
    (
      tree: FileTreeNode[],
      targetPath: string,
      newChildren: FileTreeNode[],
    ): FileTreeNode[] => {
      return tree.map((node) => {
        if (node.fullName === targetPath) {
          const mergedChildren = newChildren.map((child) => {
            const existingChild = node.children?.find(
              (c) => c.fullName === child.fullName,
            );
            if (
              existingChild &&
              existingChild.type === "directory" &&
              expandedDirs.has(existingChild.fullName)
            ) {
              return { ...child, children: existingChild.children };
            }
            return child;
          });
          return { ...node, children: mergedChildren };
        }
        if (
          node.type === "directory" &&
          node.children &&
          node.children.length > 0
        ) {
          return {
            ...node,
            children: updateTreeWithChildren(
              node.children,
              targetPath,
              newChildren,
            ),
          };
        }
        return node;
      });
    },
    [expandedDirs],
  );

  const handleDirectoryExpand = useCallback(
    async (parentItem: DirectoryExpandParams): Promise<void> => {
      try {
        if (!project) throw new Error("Project not initialized.");

        setExpandedDirs((prev) => new Set(prev).add(parentItem.fullName));

        const newChildren = await loadDirectoryChildren(
          project,
          parentItem.fullName,
        );
        setFileTree((prevTree) =>
          updateTreeWithChildren(prevTree, parentItem.fullName, newChildren),
        );
      } catch (e: unknown) {
        console.error(
          `Error expanding directory at path ${parentItem.fullName}:`,
          e,
        );
      }
    },
    [project, updateTreeWithChildren],
  );

  const createItem = useCallback(
    async (
      parentPath: string,
      itemName: string,
      isFolder: boolean,
    ): Promise<void> => {
      try {
        if (!project) throw new Error("Project not initialized.");

        const itemPath = joinPath(parentPath, itemName);
        isFolder
          ? await project.mkdir(itemPath)
          : await project.writeFile(itemPath, "");

        const newChildren = await loadDirectoryChildren(project, parentPath);
        setFileTree((prevTree) =>
          updateTreeWithChildren(prevTree, parentPath, newChildren),
        );
      } catch (e: unknown) {
        console.error(
          `Error creating ${isFolder ? "folder" : "file"} at path ${parentPath}/${itemName}:`,
          e,
        );
        throw e;
      }
    },
    [project, updateTreeWithChildren],
  );

  const createFile = useCallback(
    (parentPath: string, fileName: string) =>
      createItem(parentPath, fileName, false),
    [createItem],
  );

  const createFolder = useCallback(
    (parentPath: string, folderName: string) =>
      createItem(parentPath, folderName, true),
    [createItem],
  );

  const deleteItem = useCallback(
    async (itemPath: string): Promise<void> => {
      try {
        if (!project) throw new Error("Project not initialized.");

        // TODO: rm has a bug, will support files after fix
        await project.rmdir(itemPath, { recursive: true });

        const parentPath = itemPath.split("/").slice(0, -1).join("/") || ".";
        const newChildren = await loadDirectoryChildren(project, parentPath);
        setFileTree((prevTree) =>
          updateTreeWithChildren(prevTree, parentPath, newChildren),
        );

        setExpandedDirs((prev) => {
          const updated = new Set(prev);
          updated.delete(itemPath);
          return updated;
        });
      } catch (e: unknown) {
        console.error(`Error deleting folder at path ${itemPath}:`, e);
        throw e;
      }
    },
    [project, updateTreeWithChildren],
  );

  return {
    fileTree,
    handleDirectoryExpand,
    setFileTree,
    createFile,
    createFolder,
    deleteItem,
  };
};
