import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "@utoo/web";
import { useFileTree } from "./useFileTree";
import { installDependencies } from "../services/utooService";

export const useImportDirectory = (project: Project | null) => {
	const [isImporting, setIsImporting] = useState(false);
	const { refresh, clearAll } = useFileTree(project);

	const importDirectory = async () => {
		if (!project) {
			toast.error("Project not initialized");
			return;
		}

		if (!("showDirectoryPicker" in window)) {
			toast.error("Your browser does not support the File System Access API");
			return;
		}

		try {
			const selectedDirHandle = await window.showDirectoryPicker();
			let rootHandle = selectedDirHandle;
			setIsImporting(true);
			toast.info("Starting import...");

			// clear the project
			await clearAll();

			const processHandle = async (
				handle: FileSystemDirectoryHandle | FileSystemFileHandle,
				path: string,
			) => {
				if (handle.kind === "file") {
					const file = await handle.getFile();
					// Read as text by default.
					// TODO: specific handling for binary files if needed.
					const content = await file.text();
					await project.writeFile(path, content);
				} else if (handle.kind === "directory") {
					await project.mkdir(path);
					for await (const entry of handle.values()) {
						if (entry.name === ".git" || entry.name === "node_modules")
							continue;

						// path is like "root/subdir". entry.name is "file.txt"
						// newPath should be "root/subdir/file.txt"
						const newPath = `${path}/${entry.name}`;
						await processHandle(entry, newPath);
					}
				}
			};

			// If .muse-browser directory exists, use it instead of the selected directory
			await selectedDirHandle
				.getDirectoryHandle(".muse-browser")
				.then((dir) => {
					return dir.getDirectoryHandle("compiled");
				})
				.catch(() => {
					return selectedDirHandle;
				})
				.then((dir) => {
					rootHandle = dir;
				});
			// write package-lock.json to the project
			await selectedDirHandle
				.getDirectoryHandle(".muse-browser")
				.then((dir) => {
					return dir.getDirectoryHandle("cache");
				})
				.then((cacheDir) => {
					return cacheDir.getFileHandle("package-lock.json");
				})
				.catch(() => {
					return selectedDirHandle.getFileHandle("package-lock.json");
				})
				.then(async (fileHandle) => {
					const file = await fileHandle.getFile();
					const content = await file.text();
					await project.writeFile("package-lock.json", content);
				})
				.catch(() => {
					console.error("Failed to get package-lock.json file");
				});

			// Iterate over the children of the selected directory
			for await (const entry of rootHandle.values()) {
				if (entry.name === ".git" || entry.name === "node_modules") continue;
				await processHandle(entry, entry.name);
			}

			toast.success(`Imported ${selectedDirHandle.name} successfully`);
			refresh();
			await installDependencies(project);
		} catch (error) {
			console.error("Import failed:", error);
			if (error.name !== "AbortError") {
				toast.error("Failed to import directory");
			}
		} finally {
			setIsImporting(false);
		}
	};

	return { importDirectory, isImporting };
};
