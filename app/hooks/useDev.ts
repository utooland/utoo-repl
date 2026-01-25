import type { Project as UtooProject } from "@utoo/web";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FileTreeNode } from "../types";
import { generateHtml } from "../utils/htmlGenerator";
import { useTimer } from "./useTimer";

export interface UseDevOptions {
  /** Callback when build completes successfully */
  onBuildComplete?: () => void;
  /** Callback when preview is ready */
  onPreviewReady?: (url: string) => void;
}

export const useDev = (
  project: UtooProject | null,
  fileTree: FileTreeNode[],
  handleDirectoryExpand: (root: FileTreeNode) => Promise<void>,
  options: UseDevOptions = {},
) => {
  const { onBuildComplete, onPreviewReady } = options;
  const [isDevMode, setIsDevMode] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState("");
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildMessage, setBuildMessage] = useState("");
  const {
    time: buildTime,
    start: startBuildTimer,
    stop: stopBuildTimer,
    reset: resetBuildTimer,
  } = useTimer();

  const isStarting = useRef(false);

  const processBuildStats = useCallback(async () => {
    if (!project) return;
    try {
      const statsContent = await project.readFile("dist/stats.json", "utf8");
      const stats = JSON.parse(statsContent);

      const styles: string[] = [];
      const scripts: string[] = [];

      if (stats.assets) {
        for (const asset of stats.assets) {
          const assetPath = `/preview/dist/${asset.name}`;
          if (asset.name.endsWith(".css")) {
            styles.push(`<link rel="stylesheet" href="${assetPath}">`);
          } else if (asset.name.endsWith(".js")) {
            scripts.push(`<script src="${assetPath}"></script>`);
          }
        }
      }

      const html = generateHtml(styles, scripts);
      await project.writeFile("dist/index.html", html);
    } catch (e) {
      console.error("Failed to process stats.json in Dev:", e);
    }
  }, [project]);

  const startDev = useCallback(async () => {
    if (!project || isDevMode || isStarting.current) return;

    isStarting.current = true;

    setError("");
    setBuildProgress(0);
    setBuildMessage("Starting Dev...");
    resetBuildTimer();
    startBuildTimer();

    try {
      setIsBuilding(true);

      // Start Dev mode
      project.dev((result) => {
        setIsBuilding(false);
        setBuildProgress(100);
        setBuildMessage(`Build completed`);
        stopBuildTimer();

        if (result.issues && result.issues.length > 0) {
          const firstError = result.issues.find((i: any) => i.severity === "error");
          if (firstError) {
            const message = (firstError as any).message;
            setError(typeof message === "string" ? message : "Dev Build Error");
          }
        }

        // Process stats and update index.html on every build
        processBuildStats().then(() => {
          if (!isDevMode) {
            setIsDevMode(true);
            isStarting.current = false;

            // ONLY notify initial preview ready AFTER the first build artifact (index.html) is generated
            if (onPreviewReady) {
              const previewUrl = `${location.origin}/preview/dist/index.html`;
              onPreviewReady(previewUrl);
            }
          }

          onBuildComplete?.();
        });
      });

      // No longer notifying onPreviewReady here, moved inside the first successful build completion callback above.

    } catch (e: unknown) {
      console.error("Failed to start Dev:", e);
      const errorMessage = e instanceof Error ? e.message : (typeof e === "object" && e !== null ? "Dev Mode Error" : String(e));
      setError(`Failed to start Dev: ${errorMessage}`);
      setIsDevMode(false);
      isStarting.current = false;
    }
  }, [project, isDevMode, processBuildStats, onBuildComplete, onPreviewReady, startBuildTimer, stopBuildTimer, resetBuildTimer]);

  const stopDev = useCallback(() => {
    // Current @utoo/web might not have an explicit stopDev, 
    // but we can at least update our state.
    setIsDevMode(false);
    setIsBuilding(false);
  }, []);

  return {
    isDevMode,
    isBuilding,
    startDev,
    stopDev,
    error,
    buildProgress,
    buildMessage,
    buildTime,
  };
};
