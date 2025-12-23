import { forwardRef, useImperativeHandle, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Timer } from "./Timer";

interface PreviewProps {
  url: string;
  isLoading?: boolean;
  isBuilding?: boolean;
  initProgress?: number;
  initMessage?: string;
  initTime?: number;
  buildProgress?: number;
  buildMessage?: string;
  buildTime?: number;
}

export const Preview = forwardRef<{ reload: () => void }, PreviewProps>(
  (
    {
      url,
      isLoading,
      isBuilding,
      initProgress,
      initMessage,
      initTime,
      buildProgress,
      buildMessage,
      buildTime,
    },
    ref,
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
      reload: () => {
        if (iframeRef.current) {
          iframeRef.current.contentWindow?.location.reload();
        }
      },
    }));

    // Display loading state
    if (isLoading) {
      return (
        <div className="h-full flex flex-col justify-center items-center text-foreground text-center p-8 bg-gradient-to-br from-slate-900/90 to-purple-900/90 relative">
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚙️</div>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "1rem",
            }}
          >
            {initMessage || "Initializing project..."}
          </div>
          <div
            style={{ width: "100%", maxWidth: "300px", marginBottom: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#cbd5e1",
                  fontWeight: 500,
                }}
              >
                Initialization Progress
              </span>
              <Timer time={initTime || 0} format="seconds" />
            </div>
            <Progress
              value={initProgress || 0}
              className="h-1.5 bg-secondary/20"
            />
          </div>
          <div style={{ fontSize: "0.75rem" }}>
            Please wait, the preview will be available after project
            initialization.
          </div>
        </div>
      );
    }

    // Display building state
    if (isBuilding) {
      return (
        <div className="h-full flex flex-col justify-center items-center text-muted-foreground text-center p-8 bg-gradient-to-br from-slate-900/90 to-purple-900/90">
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔨</div>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "1rem",
            }}
          >
            {buildMessage || "Building project..."}
          </div>
          <div
            style={{ width: "100%", maxWidth: "300px", marginBottom: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#cbd5e1",
                  fontWeight: 500,
                }}
              >
                Build Progress
              </span>
              <Timer time={buildTime || 0} format="seconds" />
            </div>
            <Progress
              value={buildProgress || 0}
              className="h-1.5 bg-secondary/20"
            />
          </div>
          <div style={{ fontSize: "0.75rem" }}>
            The preview will be displayed automatically after the build is
            complete.
          </div>
        </div>
      );
    }

    // Display preview content
    return (
      <div className="h-full w-full flex flex-col">
        {/* Preview content */}
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
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.25rem",
              }}
            >
              No preview available
            </div>
            <div style={{ fontSize: "0.75rem" }}>
              Click the Build button to build the project and see the preview.
            </div>
          </div>
        )}
      </div>
    );
  },
);
