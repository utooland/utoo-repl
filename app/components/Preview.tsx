import { forwardRef, useImperativeHandle, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Timer } from "./Timer";

interface PreviewProps {
    url: string;
    isLoading?: boolean;
    isBuilding?: boolean;
    initProgress?: number;
    initMessage?: string;
    buildProgress?: number;
    buildMessage?: string;
}

export const Preview = forwardRef<{ reload: () => void }, PreviewProps>(({ 
    url,
    isLoading,
    isBuilding,
    initProgress,
    initMessage,
    buildProgress,
    buildMessage
}, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
        reload: () => {
            if (iframeRef.current) {
                iframeRef.current.contentWindow?.location.reload();
            }
        },
    }));


    // 显示 loading 状态
    if (isLoading) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-foreground text-center p-8 bg-gradient-to-br from-slate-900/90 to-purple-900/90 relative">
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                    ⚙️
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "1rem" }}>
                    {initMessage || "正在初始化项目..."}
                </div>
                <div style={{ width: "100%", maxWidth: "300px", marginBottom: "1rem" }}>
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        marginBottom: "0.5rem" 
                    }}>
                        <span style={{ 
                            fontSize: "0.75rem", 
                            color: "#cbd5e1", 
                            fontWeight: 500 
                        }}>
                            初始化进度
                        </span>
                        <Timer isRunning={isLoading} format="seconds" />
                    </div>
                                    <Progress 
                    value={initProgress || 0} 
                    className="h-1.5 bg-secondary/20"
                />
                </div>
                <div style={{ fontSize: "0.75rem" }}>
                    请稍候，项目初始化完成后即可预览
                </div>
            </div>
        );
    }

    // 显示构建状态
    if (isBuilding) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-muted-foreground text-center p-8 bg-gradient-to-br from-slate-900/90 to-purple-900/90">
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                    🔨
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "1rem" }}>
                    {buildMessage || "正在构建项目..."}
                </div>
                <div style={{ width: "100%", maxWidth: "300px", marginBottom: "1rem" }}>
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        marginBottom: "0.5rem" 
                    }}>
                        <span style={{ 
                            fontSize: "0.75rem", 
                            color: "#cbd5e1", 
                            fontWeight: 500 
                        }}>
                            构建进度
                        </span>
                        <Timer isRunning={isBuilding} format="seconds" />
                    </div>
                                    <Progress 
                    value={buildProgress || 0} 
                    className="h-1.5 bg-secondary/20"
                />
                </div>
                <div style={{ fontSize: "0.75rem" }}>
                    构建完成后将自动显示预览内容
                </div>
            </div>
        );
    }

    // 显示预览内容
    return (
        <div className="h-full w-full flex flex-col">
            {/* 预览内容 */}
            {url ? (
                <iframe
                    ref={iframeRef}
                    src={url}
                    title="preview"
                    className="w-full h-full border-0 bg-background"
                />
            ) : (
                            <div className="h-full flex flex-col justify-center items-center text-muted-foreground text-center p-8 bg-gradient-to-br from-slate-900/90 to-purple-900/90">
                    <div style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                        📄
                    </div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                        暂无预览内容
                    </div>
                    <div style={{ fontSize: "0.75rem" }}>
                        点击 Build 按钮构建项目后即可预览
                    </div>
                </div>
            )}
        </div>
    );
});
