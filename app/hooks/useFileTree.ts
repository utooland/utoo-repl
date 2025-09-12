import { useState, useCallback, useEffect } from "react";
import { Project as UtooProject } from "@utoo/web";
import { FileTreeNode, DirectoryExpandParams, ProjectFileItem } from "../types";

const projectName = "/utooweb-demo";

export const useFileTree = (project: UtooProject | null) => {
    const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(["."]));

    const buildInitialFileTree = useCallback(async (proj: UtooProject) => {
        const rootItems = await proj.readdir(".");
        const initialTree = [
            {
                name: projectName,
                fullName: ".",
                type: "directory" as const,
                children: rootItems
                    .map((item) => ({
                        ...item,
                        fullName: `./${item.name}`,
                        type: item.isDirectory()
                            ? ("directory" as const)
                            : ("file" as const),
                        children: item.isDirectory() ? [] : null,
                    }))
                    .sort((a, b) =>
                        a.type === b.type
                            ? a.name.localeCompare(b.name)
                            : a.type.localeCompare(b.type),
                    ),
            },
        ];
        setFileTree(initialTree);
    }, []);

    useEffect(() => {
        if (project) {
            buildInitialFileTree(project);
        }
    }, [project, buildInitialFileTree]);

    const updateTreeWithChildren = useCallback(
        (tree: FileTreeNode[], targetPath: string, newChildren: FileTreeNode[]): FileTreeNode[] => {
            return tree.map((node) => {
                if (node.fullName === targetPath) {
                    const mergedChildren = newChildren.map(child => {
                        const existingChild = node.children?.find(c => c.fullName === child.fullName);
                        if (existingChild && existingChild.type === 'directory' && expandedDirs.has(existingChild.fullName)) {
                            return { ...child, children: existingChild.children };
                        }
                        return child;
                    });
                    return { ...node, children: mergedChildren };
                }
                if (node.type === "directory" && node.children && node.children.length > 0) {
                    return {
                        ...node,
                        children: updateTreeWithChildren(node.children, targetPath, newChildren),
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

                setExpandedDirs(prev => new Set(prev).add(parentItem.fullName));

                const children: ProjectFileItem[] = await project.readdir(parentItem.fullName);

                const newChildren: FileTreeNode[] = children
                    .map((item: ProjectFileItem) => ({
                        ...item,
                        fullName: [parentItem.fullName, item.name].filter(Boolean).join("/"),
                        name: item.name,
                        type: item.isDirectory() ? ("directory" as const) : ("file" as const),
                        children: item.isDirectory() ? [] : null,
                    }))
                    .sort((a, b) =>
                        a.type === b.type
                            ? a.name.localeCompare(b.name)
                            : a.type.localeCompare(b.type),
                    );

                setFileTree((prevTree) => {
                    const updatedTree = updateTreeWithChildren(prevTree, parentItem.fullName, newChildren);
                    return [...updatedTree];
                });
            } catch (e: any) {
                console.error(`Error expanding directory at path ${parentItem.fullName}:`, e);
            }
        },
        [project, updateTreeWithChildren],
    );

    return { fileTree, handleDirectoryExpand, setFileTree };
};
