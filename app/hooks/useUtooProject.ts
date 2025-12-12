import { useState, useEffect, useRef } from "react";
import type { Project as UtooProject } from "@utoo/web";
import { initializeProject, installDependencies, type ProgressCallback } from "../services/utooService";
import { useTimer } from "./useTimer";

export const useUtooProject = () => {
    const [project, setProject] = useState<UtooProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [initProgress, setInitProgress] = useState(0);
    const [initMessage, setInitMessage] = useState("");
    const { time: initTime, start: startInitTimer, stop: stopInitTimer } = useTimer();
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
                setProject(projectInstance);
                setIsLoading(false);

                try {
                    await installDependencies(projectInstance, onProgress);
                } catch (e) {
                    console.error("Dependency installation failed:", e);
                    setInitMessage("Dependency installation failed.");
                }
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                setError(`Initialization failed: ${errorMessage}`);
                setIsLoading(false);
            } finally {
                stopInitTimer();
            }
        };

        init();
    }, [startInitTimer, stopInitTimer]);

    return { project, isLoading, error, initProgress, initMessage, initTime };
};
