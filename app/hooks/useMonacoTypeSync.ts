import type { Monaco } from "@monaco-editor/react";
import type { Project as UtooProject } from "@utoo/web";
import { useCallback, useRef } from "react";

const CHUNK_SIZE = 50;

export const useMonacoTypeSync = (project: UtooProject, activeFile: string) => {
  const libsMapRef = useRef<Map<string, string>>(new Map());
  const localFilesMapRef = useRef<Map<string, string>>(new Map());
  const packageJsonMappingsRef = useRef<Record<string, string>>({});
  const isSyncingRef = useRef(false);

  const updateCompilerOptionsPaths = useCallback(
    (
      monaco: Monaco,
      mappings: Record<string, string>,
      dTsFilePaths: string[],
    ) => {
      const tsDefaults = monaco.languages.typescript.typescriptDefaults;
      const jsDefaults = monaco.languages.typescript.javascriptDefaults;
      const current = tsDefaults.getCompilerOptions();
      const paths: Record<string, string[]> = { ...(current.paths || {}) };
      let changed = false;

      const setPath = (key: string, values: string[]) => {
        const prev = paths[key];
        const same =
          prev &&
          prev.length === values.length &&
          prev.every((v, i) => v === values[i]);
        if (!same) {
          paths[key] = values;
          changed = true;
        }
      };

      // 1) 根据 package.json 的 types/typings 精确映射包名
      for (const [pkgName, typesFullPath] of Object.entries(mappings)) {
        const relPath = typesFullPath.startsWith("/")
          ? typesFullPath.slice(1)
          : typesFullPath;
        const pkgDir = relPath.slice(0, relPath.lastIndexOf("/"));

        setPath(pkgName, [relPath]);
        setPath(`${pkgName}/*`, [`${pkgDir}/*`]);

        if (pkgName.startsWith("@types/")) {
          const actualPkgName = pkgName.replace("@types/", "");
          setPath(actualPkgName, [relPath]);
          setPath(`${actualPkgName}/*`, [`${pkgDir}/*`]);
        }
      }

      // 2) 兜底：从 index.d.ts 推断包名映射
      for (const path of dTsFilePaths) {
        if (!path.endsWith("index.d.ts")) continue;
        const parts = path.split("/");
        const nmIdx = parts.indexOf("node_modules");
        if (nmIdx === -1 || parts.length <= nmIdx + 1) continue;

        let pkgName = parts[nmIdx + 1];
        if (pkgName.startsWith("@") && parts.length > nmIdx + 2) {
          pkgName = `${pkgName}/${parts[nmIdx + 2]}`;
        }

        const relPath = path.startsWith("/") ? path.slice(1) : path;
        if (!paths[pkgName]) {
          setPath(pkgName, [relPath]);
        }

        if (pkgName.startsWith("@types/")) {
          const actualPkgName = pkgName.replace("@types/", "");
          if (!paths[actualPkgName]) {
            setPath(actualPkgName, [relPath]);
          }
        }
      }

      if (changed) {
        const newOptions = { ...current, paths };
        tsDefaults.setCompilerOptions(newOptions);
        jsDefaults.setCompilerOptions(newOptions);
        console.log("[Editor] Updated compiler options paths.");
      }
    },
    [],
  );

  const syncTypes = useCallback(
    async (monaco: Monaco) => {
      if (!project || isSyncingRef.current) return;
      isSyncingRef.current = true;
      const start = performance.now();
      try {
        console.log("[Editor] Starting full type synchronization...");

        const dTsFilePaths: string[] = [];
        const localFilePaths: string[] = [];
        const newPackageJsonMappings: Record<string, string> = {};

        const scanDirectory = async (dir: string, isInNodeModules = false) => {
          try {
            const children = await project.readdir(dir);
            await Promise.all(
              children.map(async (child) => {
                const name = child.name;
                const path = dir === "." ? name : `${dir}/${name}`;
                if (name.startsWith(".") && isInNodeModules) return;
                if (child.isDirectory()) {
                  await scanDirectory(
                    path,
                    isInNodeModules || name === "node_modules",
                  );
                } else {
                  if (path.endsWith(".d.ts")) {
                    dTsFilePaths.push(path);
                  } else if (isInNodeModules && name === "package.json") {
                    try {
                      const content = await project.readFile(path, "utf8");
                      const pkg = JSON.parse(content);
                      const types = pkg.types || pkg.typings;
                      if (types) {
                        const cleanTypes = types.replace(/^\.\//, "");
                        newPackageJsonMappings[pkg.name] =
                          `${dir}/${cleanTypes}`;
                      }
                    } catch (_) {}
                  } else if (!isInNodeModules && /\.(ts|tsx)$/.test(name)) {
                    localFilePaths.push(path);
                  }
                }
              }),
            );
          } catch (e) {
            if (e.message?.includes("NotFound")) return;
            console.error(`[Editor] Error scanning directory ${dir}:`, e);
          }
        };
        await scanDirectory(".");
        packageJsonMappingsRef.current = newPackageJsonMappings;

        const readFilesChunk = async (paths: string[], isLib: boolean) => {
          for (let i = 0; i < paths.length; i += CHUNK_SIZE) {
            const chunk = paths.slice(i, i + CHUNK_SIZE);
            await Promise.all(
              chunk.map(async (path) => {
                try {
                  const content = await project.readFile(path, "utf8");
                  const monacoPath = path.startsWith("/")
                    ? `file://${path}`
                    : `file:///${path}`;
                  if (isLib) {
                    libsMapRef.current.set(monacoPath, content);
                  } else {
                    localFilesMapRef.current.set(path, content);
                  }
                } catch (_) {}
              }),
            );
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        };

        libsMapRef.current.clear();
        localFilesMapRef.current.clear();

        // 并行加载所有类型库与本地文件
        await Promise.all([
          readFilesChunk(dTsFilePaths, true),
          readFilesChunk(localFilePaths, false),
        ]);

        const allExtraLibs = Array.from(libsMapRef.current.entries()).map(
          ([filePath, content]) => ({ content, filePath }),
        );
        if (allExtraLibs.length > 0) {
          monaco.languages.typescript.typescriptDefaults.setExtraLibs(
            allExtraLibs,
          );
          monaco.languages.typescript.javascriptDefaults.setExtraLibs(
            allExtraLibs,
          );

          const totalBytes = allExtraLibs.reduce(
            (sum, lib) => sum + lib.content.length,
            0,
          );
          console.log(
            `[Editor] All types loaded: ${allExtraLibs.length} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
          );
        }

        updateCompilerOptionsPaths(
          monaco,
          packageJsonMappingsRef.current,
          dTsFilePaths,
        );

        let modelsCreated = 0;
        let modelsUpdated = 0;
        localFilesMapRef.current.forEach((fileContent, path) => {
          const uri = monaco.Uri.parse(
            `file://${path.startsWith("/") ? path : `/${path}`}`,
          );
          const model = monaco.editor.getModel(uri);
          const normalizedActivePath = activeFile.startsWith("/")
            ? activeFile
            : `/${activeFile.replace(/^\.\//, "")}`;

          if (!model) {
            monaco.editor.createModel(fileContent, "typescript", uri);
            modelsCreated++;
          } else if (
            path !== normalizedActivePath &&
            model.getValue() !== fileContent
          ) {
            model.setValue(fileContent);
            modelsUpdated++;
          }
        });

        console.log(
          `[Editor] Models: ${modelsCreated} created, ${modelsUpdated} updated, ${localFilesMapRef.current.size} total local files`,
        );

        const duration = Math.round(performance.now() - start);
        console.log(`[Editor] Synchronization finished in ${duration}ms`);
      } catch (_) {
      } finally {
        isSyncingRef.current = false;
      }
    },
    [project, activeFile, updateCompilerOptionsPaths],
  );

  return { syncTypes };
};
