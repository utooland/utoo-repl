import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Timer } from "./Timer";

interface PreviewProps {
  url: string;
  isLoading?: boolean;
  isBuilding?: boolean;
  isDevMode?: boolean;
  initProgress?: number;
  initMessage?: string;
  initTime?: number;
  buildProgress?: number;
  buildMessage?: string;
  buildTime?: number;
  onIframeReady?: (iframe: HTMLIFrameElement) => { close: () => void } | null;
}

export const Preview = forwardRef<
  { reload: () => void; getIframe: () => HTMLIFrameElement | null },
  PreviewProps
>((props, ref) => {
  const {
    url,
    isLoading,
    isBuilding,
    isDevMode,
    initProgress,
    initMessage,
    initTime,
    buildProgress,
    buildMessage,
    buildTime,
    onIframeReady,
  } = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hmrClientRef = useRef<{ close: () => void } | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !onIframeReady || !url) return;

    const handleMessage = (event: MessageEvent) => {
      // Check if this is an hmr-ready message from our iframe
      if (
        event.data?.type === "hmr-ready" &&
        event.source === iframe.contentWindow
      ) {
        // Disconnect previous HMR client if exists
        if (hmrClientRef.current) {
          hmrClientRef.current.close();
          hmrClientRef.current = null;
        }

        // Connect HMR client via callback
        const client = onIframeReady(iframe);
        if (client) {
          hmrClientRef.current = client;
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (hmrClientRef.current) {
        hmrClientRef.current.close();
        hmrClientRef.current = null;
      }
    };
  }, [onIframeReady, url, isDevMode]);

  useImperativeHandle(ref, () => ({
      reload: () => {
        if (iframeRef.current) {
          iframeRef.current.contentWindow?.location.reload();
        }
      },
      getIframe: () => iframeRef.current,
    }));

    // Display preview content with optional overlays
    return (
      <div className="h-full w-full flex flex-col relative overflow-hidden">
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

        {/* Global Loading Overlay (Initialization) */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col justify-center items-center text-foreground text-center p-8 bg-gradient-to-br from-slate-900/90 to-purple-900/90">
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
          </div>
        )}

        {/* Build Overlay - only show if no url or not in Dev Mode */}
        {isBuilding && (!isDevMode || !url) && (
          <div className="absolute inset-0 z-40 flex flex-col justify-center items-center text-muted-foreground text-center p-8 bg-gradient-to-br from-slate-900/90 to-purple-900/90">
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
          </div>
        )}
      </div>
    );
  },
);
