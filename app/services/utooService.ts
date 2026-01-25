import { Project as UtooProject } from "@utoo/web";
import { demoFiles } from "../demoFiles";

/**
 * Creates a safe wrapper around the UtooProject instance (which is a Comlink Proxy).
 * React 19 dev-mode logging attempts to inspect/serialize objects, which can cause
 * "Cannot convert object to primitive value" errors when it hits a Comlink Proxy.
 * This manual bridge provides a plain object that doesn't trigger Proxy traps
 * for symbols or unexpected property lookups.
 */
export const createSafeProject = (project: UtooProject): UtooProject => {
  if (!project) return project;

  const safeProject = {
    installServiceWorker: () => project.installServiceWorker(),
    readFile: (path: string, options?: any) => project.readFile(path, options),
    writeFile: (path: string, content: string | Uint8Array) => project.writeFile(path, content),
    mkdir: (path: string, options?: any) => project.mkdir(path, options),
    rmdir: (path: string, options?: any) => project.rmdir(path, options),
    readdir: (path: string) => project.readdir(path),
    install: (packageLock: string) => project.install(packageLock),
    build: () => project.build(),
    dev: (callback: (result: any) => void) => project.dev(callback),
    connectHmrIframe: (iframe: HTMLIFrameElement) => project.connectHmrIframe(iframe),

    // Explicitly define common inspection properties to avoid Proxy triggers
    toString: () => "[SafeUtooProject]",
    toJSON: () => "[SafeUtooProject]",
    [Symbol.toStringTag]: "UtooProject",
  };

  // Prevent extensions and ensure it stays a plain-ish object
  return Object.freeze(safeProject) as unknown as UtooProject;
};

const projectName = "/utooweb-demo";
export const serviceWorkerScope = "/preview";

export type ProgressCallback = (progress: number, message: string) => void;

export const initializeProject = async (onProgress?: ProgressCallback) => {
  const projectInstance = new UtooProject({
    cwd: projectName,
    workerUrl: `${location.origin}/_next/static/chunks/worker.js`,
    threadWorkerUrl: `${location.origin}/_next/static/chunks/threadWorker.js`,
    loaderWorkerUrl: new URL("@utoo/web/esm/loaderWorker.js", import.meta.url)
      .href,
    serviceWorker: {
      url: `${location.origin}/_next/static/chunks/serviceWorker.js`,
      scope: serviceWorkerScope,
    },
    logFilter: new URLSearchParams(location.search).get("logFilter") || "",
  });

  onProgress?.(10, "Initializing service worker...");
  await projectInstance.installServiceWorker();

  onProgress?.(20, "Syncing project files...");
  await initUtooProject(projectInstance);

  onProgress?.(30, "Project files synchronized successfully!");

  return projectInstance;
};

export const installDependencies = async (
  project: UtooProject,
  onProgress?: ProgressCallback,
): Promise<void> => {
  console.log(
    "%cOPFS Project:%c Start to install dependencies.",
    "color: blue;",
    "color: green",
  );
  const start = performance.now();

  // Simulate installation progress
  const progressSteps = [
    { progress: 50, message: "Resolving dependencies..." },
    { progress: 60, message: "Downloading dependencies..." },
    { progress: 80, message: "Installing dependencies..." },
  ];

  let currentStep = 0;
  const progressInterval = setInterval(() => {
    if (currentStep < progressSteps.length) {
      const step = progressSteps[currentStep];
      onProgress?.(step.progress, step.message);
      currentStep++;
    }
  }, 200);

  try {
    const packageLock = await project.readFile("package-lock.json", "utf8");
    await project.install(packageLock);
    clearInterval(progressInterval);
    onProgress?.(100, "Dependencies installed successfully!");
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }

  console.log(
    `%cOPFS Project:%c Finished to install dependencies in ${Math.round(performance.now() - start)} ms.`,
    "color: blue;",
    "color: green",
  );
};

const initUtooProject = async (project: UtooProject): Promise<void> => {
  for (const filePath in demoFiles) {
    if (Object.hasOwn(demoFiles, filePath)) {
      const content = demoFiles[filePath as keyof typeof demoFiles];

      // Ensure directory exists
      if (filePath.includes("/")) {
        const dir = filePath.substring(0, filePath.lastIndexOf("/"));
        await project.mkdir(dir, { recursive: true }).catch(() => { });
      }

      await project.writeFile(filePath, content);
    }
  }
};
