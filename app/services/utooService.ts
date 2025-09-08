import { Project as UtooProject } from "@utoo/web";
import { packageLock } from "../packageLock";
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
        serviceWorker: {
            url: `${location.origin}/_next/static/chunks/serviceWorker.js`,
            scope: serviceWorkerScope,
        },
    });

    onProgress?.(10, "Initializing service worker...");
    await projectInstance.installServiceWorker();
    
    onProgress?.(20, "Installing dependencies...");
    await installDependencies(projectInstance, onProgress);
    
    onProgress?.(80, "Creating project files...");
    await initUtooProject(projectInstance);
    
    onProgress?.(100, "Project initialization complete!");

    return projectInstance;
};

const installDependencies = async (project: UtooProject, onProgress?: ProgressCallback): Promise<void> => {
    console.log(
        "%cOPFS Project:%c Start to install dependencies.",
        "color: blue;",
        "color: green",
    );
    const start = performance.now();
    
    // Simulate installation progress
    const progressSteps = [
        { progress: 25, message: "Resolving dependencies..." },
        { progress: 50, message: "Downloading dependencies..." },
        { progress: 75, message: "Installing dependencies..." },
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
        await project.install(JSON.stringify(packageLock));
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
    await project.mkdir("src");

    for (const filePath in demoFiles) {
        if (Object.hasOwn(demoFiles, filePath)) {
            const content = demoFiles[filePath as keyof typeof demoFiles];
            await project.writeFile(filePath, content);
        }
    }
};
