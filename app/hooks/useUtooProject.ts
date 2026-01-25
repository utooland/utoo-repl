import type { Project as UtooProject } from "@utoo/web";
import { useEffect, useRef, useState } from "react";
import {
  initializeProject,
  installDependencies,
  createSafeProject,
  type ProgressCallback,
} from "../services/utooService";
import { useTimer } from "./useTimer";

export const useUtooProject = () => {
  const projectRef = useRef<UtooProject | null>(null);
  const [projectVersion, setProjectVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [initProgress, setInitProgress] = useState(0);
  const [initMessage, setInitMessage] = useState("");
  const {
    time: initTime,
    start: startInitTimer,
    stop: stopInitTimer,
  } = useTimer();
  const initStarted = useRef(false);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    const init = async () => {
      setIsLoading(true);
      setInitProgress(0);
      setInitMessage("Starting project initialization...");
      startInitTimer();

      const onProgress: ProgressCallback = (progress, message) => {
        setInitProgress(progress);
        setInitMessage(message);
      };

      try {
        const projectInstance = await initializeProject(onProgress);

        // Use the manual bridge to wrap the Comlink proxy
        const safeProject = createSafeProject(projectInstance);

        projectRef.current = safeProject;
        setProjectVersion((v) => v + 1);
        setIsLoading(false);

        try {
          await installDependencies(safeProject, onProgress);
        } catch (e) {
          console.error("Dependency installation failed:", e);
          setInitMessage("Dependency installation failed.");
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : (typeof e === "object" && e !== null ? "Initialization Error" : String(e));
        setError(`Initialization failed: ${errorMessage}`);
        setIsLoading(false);
      } finally {
        stopInitTimer();
      }
    };

    init();
  }, [startInitTimer, stopInitTimer]);

  return {
    project: projectRef.current,
    isLoading,
    error,
    initProgress,
    initMessage,
    initTime,
    projectVersion
  };
};
