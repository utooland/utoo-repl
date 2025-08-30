'use client';

// this is a hack to bundle determined worker assets
if (typeof window !== "undefined") {
  (window as any).__hack_workers = {
    worker: () => new Worker(/* webpackChunkName: "worker" */ new URL("./worker.ts", import.meta.url)),
    threadWorker: () => new Worker(/* webpackChunkName: "threadWorker" */ new URL("./threadWorker.ts", import.meta.url)),
    serviceWorker: () => new Worker(/* webpackChunkName: "serviceWorker" */ new URL("./serviceWorker.ts", import.meta.url))
  };
}


export default null;
