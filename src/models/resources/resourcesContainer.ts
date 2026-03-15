import * as vscode from 'vscode';
import { ResourceFilesContainer } from "./resourceFilesContainer";
import { ResourcePath } from "./resourcePath";

export class ResourcesContainer {

    private resourceFilesContainers: ResourceFilesContainer[] = [];
    private static resourcePatterns = ['**/*.resx', '**/*.*.resx', '**/*.Designer.cs'];

    private constructor() {
        this.resourceFilesContainers = [];
    }

    public async tryAddResource(uri: vscode.Uri): Promise<ResourceFilesContainer | undefined> {
        const filePath = uri.fsPath;
        const resourcePath = new ResourcePath(filePath);
        const existing = this.resourceFilesContainers.find(r => r.exists(resourcePath));

        if (existing) {
            return await existing.tryAdd(filePath);
        } else {
            const newContainer = await ResourceFilesContainer.create(filePath);
            this.resourceFilesContainers.push(newContainer);
            return newContainer;
        }
    }

    private tryRemoveResource(uri: vscode.Uri) {
        const filePath = uri.fsPath;
        const resourcePath = new ResourcePath(filePath);
        const existing = this.resourceFilesContainers.find(r => r.exists(resourcePath));

        if (existing) {
            existing.tryRemove(filePath);
        }
    }


    public static async create(): Promise<ResourcesContainer> {

        const instance = new ResourcesContainer();
        const resourceFileUris = await this.getResourceFileUris();

        for (let i = 0; i < resourceFileUris.length; i++) {
            await instance.tryAddResource(resourceFileUris[i]);
        }

        instance.registerFileWatcher();

        return instance;
    }

    private registerFileWatcher() {

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders === undefined || workspaceFolders.length === 0 || workspaceFolders[0] === undefined) {
            return [];
        }

        ResourcesContainer.resourcePatterns.forEach(async pattern => {
            const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceFolders[0], pattern), false, true, false);
            watcher.onDidCreate(async uri => {
                await this.tryAddResource(uri);
            });

            watcher.onDidDelete(uri => {
                this.tryRemoveResource(uri);
            });
        });
    }


    private static async getResourceFileUris(): Promise<vscode.Uri[]> {

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders === undefined || workspaceFolders.length === 0 || workspaceFolders[0] === undefined) {
            return [];
        }

        const uris: vscode.Uri[] = [];

        for (const pattern of this.resourcePatterns) {
            const resourcePattern = new vscode.RelativePattern(workspaceFolders[0], pattern);
            // Note: This is a simplified approach. In a real implementation, you would need to handle the asynchronous nature of findFiles properly.
            const foundUris = await vscode.workspace.findFiles(resourcePattern);
            uris.push(...foundUris);
        }

        return uris;
    }

    public tryGetResorce(path: ResourcePath): ResourceFilesContainer | undefined {
        return this.resourceFilesContainers.find(r => r.exists(path));
    }
}