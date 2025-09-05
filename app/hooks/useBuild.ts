import { useState, useCallback } from "react";
import type { Project as UtooProject } from "@utoo/web";
import type { FileTreeNode } from "../types";
import { generateHtml } from "../utils/htmlGenerator";

export const useBuild = (
    project: UtooProject | null,
    fileTree: FileTreeNode[],
    handleDirectoryExpand: (root: FileTreeNode) => Promise<void>,
    onBuildComplete: () => void,
    onPreviewReady?: (url: string) => void
) => {
    const [isBuilding, setIsBuilding] = useState(false);
    const [error, setError] = useState("");
    const [buildProgress, setBuildProgress] = useState(0);
    const [buildMessage, setBuildMessage] = useState("");

    const handleBuild = useCallback(async () => {
        if (!project) return;
        setIsBuilding(true);
        setError("");
        setBuildProgress(0);
        setBuildMessage("开始构建...");
        
        try {
            // 模拟构建进度
            const progressSteps = [
                { progress: 20, message: "解析项目配置..." },
                { progress: 40, message: "编译 TypeScript..." },
                { progress: 60, message: "打包资源文件..." },
                { progress: 80, message: "生成构建产物..." },
            ];
            
            let currentStep = 0;
            const progressInterval = setInterval(() => {
                if (currentStep < progressSteps.length) {
                    const step = progressSteps[currentStep];
                    setBuildProgress(step.progress);
                    setBuildMessage(step.message);
                    currentStep++;
                }
            }, 300);
            
            await project.build();
            clearInterval(progressInterval);
            setBuildProgress(90);
            setBuildMessage("处理构建结果...");

            try {
                const statsContent = await project.readFile("dist/stats.json", "utf8");
                const stats = JSON.parse(statsContent);

                const styles: string[] = [];
                const scripts: string[] = [];

                if (stats.assets) {
                    for (const asset of stats.assets) {
                        const assetPath = `/dist/${asset.name}`;
                        if (asset.name.endsWith(".css")) {
                            styles.push(`<link rel="stylesheet" href="${assetPath}">`);
                        } else if (asset.name.endsWith(".js")) {
                            scripts.push(`<script src="${assetPath}"></script>`);
                        }
                    }
                }

                const html = generateHtml(styles, scripts);

                await project.writeFile("dist/index.html", html);
                setBuildProgress(100);
                setBuildMessage("构建完成！");
                
                // 自动设置预览 URL
                if (onPreviewReady) {
                    const previewUrl = `${location.origin}/preview/dist/index.html`;
                    onPreviewReady(previewUrl);
                }
                
                onBuildComplete();

                const root = fileTree.find((node) => node.fullName === ".");
                if (root) {
                    await handleDirectoryExpand(root);
                }
            } catch (e: unknown) {
                console.error("Failed to process stats.json:", e);
                const errorMessage = e instanceof Error ? e.message : String(e);
                setError(`Build succeeded, but failed to display stats: ${errorMessage}`);
            }
        } catch (e: unknown) {
            console.error("Build failed: ", e);
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(`Build failed: ${errorMessage}`);
        } finally {
            setIsBuilding(false);
            // 保留进度条显示，不重置
        }
    }, [project, fileTree, handleDirectoryExpand, onBuildComplete, onPreviewReady]);

    return { isBuilding, handleBuild, error, buildProgress, buildMessage };
};
