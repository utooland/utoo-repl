import { forwardRef, useImperativeHandle, useRef } from "react";
import { ProgressBar } from "./ProgressBar";
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
            <div style={{ 
                height: "100%",
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                alignItems: "center",
                color: "#9ca3af", 
                textAlign: "center",
                padding: "2rem",
                background: "#f9fafb"
            }}>
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
                            color: "#6b7280", 
                            fontWeight: 500 
                        }}>
                            初始化进度
                        </span>
                        <Timer isRunning={isLoading} format="seconds" />
                    </div>
                    <ProgressBar 
                        progress={initProgress || 0} 
                        animated={isLoading}
                        color="#22c55e"
                        height={6}
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
            <div style={{ 
                height: "100%",
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                alignItems: "center",
                color: "#9ca3af", 
                textAlign: "center",
                padding: "2rem",
                background: "#f9fafb"
            }}>
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
                            color: "#6b7280", 
                            fontWeight: 500 
                        }}>
                            构建进度
                        </span>
                        <Timer isRunning={isBuilding} format="seconds" />
                    </div>
                    <ProgressBar 
                        progress={buildProgress || 0} 
                        animated={isBuilding}
                        color="#2563eb"
                        height={6}
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
        <div style={{ 
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* 预览内容 */}
            {url ? (
                <iframe
                    ref={iframeRef}
                    src={url}
                    title="preview"
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "#fff",
                    }}
                />
            ) : (
                <div style={{ 
                    height: "100%",
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center",
                    color: "#9ca3af", 
                    textAlign: "center",
                    padding: "2rem",
                    background: "#f9fafb"
                }}>
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
