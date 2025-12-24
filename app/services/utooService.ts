import { Project as UtooProject } from "@utoo/web";
import { demoFiles } from "../demoFiles";

const projectName = "/utooweb-demo";
export const serviceWorkerScope = "/preview";

export interface ProgressCallback {
  (progress: number, message: string): void;
}

export const initializeProject = async (onProgress?: ProgressCallback) => {
  const projectInstance = new UtooProject({
    cwd: projectName,
    workerUrl: `${location.origin}/_next/static/chunks/worker.js`,
    threadWorkerUrl: `${location.origin}/_next/static/chunks/threadWorker.js`,
    loaderWorkerUrl: new URL('@utoo/web/esm/loaderWorker.js', import.meta.url).href,
    serviceWorker: {
      url: `${location.origin}/_next/static/chunks/serviceWorker.js`,
      scope: serviceWorkerScope,
    },
    logFilter: new URLSearchParams(location.search).get("logFilter") || "",
  });

  onProgress?.(10, "Initializing service worker...");
  await projectInstance.installServiceWorker();

  onProgress?.(20, "Creating project files...");
  const hasUtooPack = await projectInstance.readFile('utoopack.json').catch(() => {
    return false;
  })
  if (hasUtooPack === false) {
    await initUtooProject(projectInstance);
  }

  onProgress?.(30, "Project files created successfully!");

  return projectInstance;
};

export const installDependencies = async (project: UtooProject, onProgress?: ProgressCallback): Promise<void> => {
  console.log("%cOPFS Project:%c Start to install dependencies.", "color: blue;", "color: green");
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
    "color: green"
  );
};

const initUtooProject = async (project: UtooProject): Promise<void> => {
  await project.mkdir("src");

  for (const filePath in demoFiles) {
    if (Object.hasOwn(demoFiles, filePath)) {
      const content = demoFiles[filePath as keyof typeof demoFiles];
      await project.writeFile(filePath, content);
    }
  }
};
