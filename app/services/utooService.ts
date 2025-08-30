import { Project as UtooProject } from "@utoo/web";
import { packageLock } from "../packageLock";
import { demoFiles } from "../demoFiles";

const projectName = "/utooweb-demo";
export const serviceWorkerScope = "/preview";

export const initializeProject = async () => {
    const projectInstance = new UtooProject({
        cwd: projectName,
        workerUrl: `${location.origin}/_next/static/chunks/worker.js`,
        threadWorkerUrl: `${location.origin}/_next/static/chunks/threadWorker.js`,
        serviceWorker: {
            url: `${location.origin}/_next/static/chunks/serviceWorker.js`,
            scope: serviceWorkerScope,
        },
    });

    await projectInstance.installServiceWorker();
    await installDependencies(projectInstance);
    await initUtooProject(projectInstance);

    return projectInstance;
};

const installDependencies = async (project: UtooProject): Promise<void> => {
    console.log(
        "%cOPFS Project:%c Start to install dependencies.",
        "color: blue;",
        "color: green",
    );
    const start = performance.now();
    await project.install(JSON.stringify(packageLock));
    console.log(
        `%cOPFS Project:%c Finished to install dependencies in ${Math.round(performance.now() - start)} ms.`,
        "color: blue;",
        "color: green",
    );
};

const initUtooProject = async (project: UtooProject): Promise<void> => {
    await project.mkdir("src");

    for (const filePath in demoFiles) {
        if (Object.prototype.hasOwnProperty.call(demoFiles, filePath)) {
            const content = demoFiles[filePath as keyof typeof demoFiles];
            await project.writeFile(filePath, content);
        }
    }
};
