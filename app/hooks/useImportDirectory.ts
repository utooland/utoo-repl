import { useState } from 'react';
import { toast } from 'sonner';
import type { Project } from '@utoo/web';

export const useImportDirectory = (project: Project | null, onImportComplete?: () => void) => {
  const [isImporting, setIsImporting] = useState(false);

  const importDirectory = async () => {
    if (!project) {
      toast.error('Project not initialized');
      return;
    }

    if (!('showDirectoryPicker' in window)) {
      toast.error('Your browser does not support the File System Access API');
      return;
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      setIsImporting(true);
      toast.info('Starting import...');

      const processHandle = async (handle: any, path: string) => {
        if (handle.kind === 'file') {
          const file = await handle.getFile();
          // Read as text by default. 
          // TODO: specific handling for binary files if needed.
          const content = await file.text();
          await project.writeFile(path, content);

        } else if (handle.kind === 'directory') {
          await project.mkdir(path);
          for await (const entry of handle.values()) {
             if (entry.name === '.git' || entry.name === 'node_modules') continue;
             
             // path is like "root/subdir". entry.name is "file.txt"
             // newPath should be "root/subdir/file.txt"
             const newPath = `${path}/${entry.name}`;
             await processHandle(entry, newPath);
          }
        }
      };

      const rootName = dirHandle.name;
      // Create the root folder for the imported directory
      await project.mkdir(rootName);
      
      // Iterate over the children of the selected directory
      for await (const entry of dirHandle.values()) {
          if (entry.name === '.git' || entry.name === 'node_modules') continue;
          await processHandle(entry, `${rootName}/${entry.name}`);
      }

      toast.success(`Imported ${rootName} successfully`);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Import failed:', error);
      if ((error as any).name !== 'AbortError') {
        toast.error('Failed to import directory');
      }
    } finally {
      setIsImporting(false);
    }
  };

  return { importDirectory, isImporting };
};
