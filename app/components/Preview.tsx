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
  error?: string | Error | null;
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
    error,
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
            className="w-full h-full border-0 bg-white"
          />
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-slate-500 text-center p-8 bg-slate-950 tech-grid opacity-80">
            <div className="mb-4 p-4 rounded-full bg-slate-900 border border-white/5 glow-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <div className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-widest">
              Awaiting Build
            </div>
            <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
              Launch the compiler to generate artifacts and initialize the live preview system.
            </p>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 z-[60] flex flex-col justify-center items-center text-center p-8 bg-red-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="mb-6 p-4 rounded-full bg-red-900/30 border border-red-500/50 glow-red">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="text-sm font-bold text-red-400 uppercase tracking-[0.2em] mb-4">
              Build Error Detected
            </div>
            <div className="w-full max-w-[480px] p-4 bg-black/40 rounded-lg border border-red-500/20 font-mono text-left overflow-auto max-h-[60%]">
              <pre className="text-xs text-red-300 whitespace-pre-wrap break-words leading-relaxed">
                {typeof error === "string" ? error : ((error as any)?.message || "An unknown error occurred")}
              </pre>
            </div>
            <div className="mt-8 px-6 text-[10px] text-slate-400 max-w-[300px] leading-relaxed border-t border-white/5 pt-6">
              <p>The compiler encountered an issue. Fix the errors in your code to automatically resume the development session.</p>
            </div>
          </div>
        )}

        {/* Global Loading Overlay (Initialization) */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col justify-center items-center text-foreground text-center p-8 bg-slate-950/90 backdrop-blur-xl">
            <div className="mb-6 animate-spin text-purple-500">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
              {initMessage || "Initializing Environment"}
            </div>
            <div className="w-full max-w-[280px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Status</span>
                <Timer time={initTime || 0} format="seconds" />
              </div>
              <Progress value={initProgress || 0} className="h-1 bg-purple-500/20" />
            </div>
          </div>
        )}

        {/* Build Overlay */}
        {isBuilding && (
          <div className="absolute inset-0 z-40 flex flex-col justify-center items-center text-center p-8 bg-slate-950/80 backdrop-blur-md">
            <div className="mb-6 text-pink-500 animate-pulse">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 14 7-7 7 7" />
                <path d="M12 7v14" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] mb-6">
              {buildMessage || "Compiling Project"}
            </div>
            <div className="w-full max-w-[280px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Processing Sequence</span>
                <Timer time={buildTime || 0} format="seconds" />
              </div>
              <Progress value={buildProgress || 0} className="h-1 bg-pink-500/20" />
            </div>
            <div className="mt-8 px-6 text-[10px] text-slate-500 max-w-[300px] leading-relaxed border-t border-white/5 pt-6">
              <p>Compiler active. Preview will refresh automatically upon successful artifact generation.</p>
              <p className="mt-3 text-slate-400 italic">Manual bypass: select <span className="text-blue-400 non-italic font-mono">dist/index.html</span> from the explorer.</p>
            </div>
          </div>
        )}
      </div>
    );
  },
);
