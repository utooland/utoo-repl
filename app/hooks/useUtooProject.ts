import { useState, useEffect, useRef } from "react";
import type { Project as UtooProject } from "@utoo/web";
import { initializeProject, type ProgressCallback } from "../services/utooService";

export const useUtooProject = () => {
    const [project, setProject] = useState<UtooProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [initProgress, setInitProgress] = useState(0);
    const [initMessage, setInitMessage] = useState("");
    const initStarted = useRef(false);

    useEffect(() => {
        if (initStarted.current) return;
        initStarted.current = true;

        const init = async () => {
            setIsLoading(true);
            setInitProgress(0);
            setInitMessage("开始初始化项目...");
            
            const onProgress: ProgressCallback = (progress, message) => {
                setInitProgress(progress);
                setInitMessage(message);
            };
            
            try {
                const projectInstance = await initializeProject(onProgress);
                setProject(projectInstance);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                setError(`Initialization failed: ${errorMessage}`);
            } finally {
                setIsLoading(false);
                // 保留进度条显示，不重置
            }
        };

        init();
    }, []);

    return { project, isLoading, error, initProgress, initMessage };
};
