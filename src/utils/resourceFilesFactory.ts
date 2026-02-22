import * as vscode from "vscode";
import { ExtensionUtils } from "./extensionUtils";
import * as path from 'path';

export class ResourceFilesFactory {

    private context: vscode.ExtensionContext;
    private textDecoder = new TextDecoder();
    private textEncoder = new TextEncoder();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public async createFiles(): Promise<string> {

        const workspaceFolder = ExtensionUtils.getWorkspaceFolder();
        const createDirectory = await this.getCreateDirectory(workspaceFolder);

        // Should not happen...
        if (createDirectory === undefined) {
            return "User selected empty directory or canceled?";
        }


        const resourceFileName = await this.getResourceFileName();
        const designerFilePath = vscode.Uri.joinPath(createDirectory, `${resourceFileName}.Designer.cs`);
        const resxFilePath = vscode.Uri.joinPath(createDirectory, `${resourceFileName}.resx`);

        if (await this.canCreateFiles(designerFilePath, resxFilePath) === false) {
            return `One of the files already exists: ${resourceFileName}.Designer.cs or ${resourceFileName}.resx in selected directory: ${createDirectory.toString()}`;
        }


        const namespace = await this.getNamespace(createDirectory, workspaceFolder); // SOLUTION.FOLDERS...
        const validatedNamespace = await this.validateNamespace(namespace);

        if (validatedNamespace === undefined) {
            return 'Invalid namespace: is undefined';
        }

        vscode.window.showInformationMessage(`namespace: ${validatedNamespace}`);

        await this.createResourceFiles(validatedNamespace, resourceFileName, designerFilePath, resxFilePath);


        vscode.window.showInformationMessage(
            `Created files ${resourceFileName}.[Designer.cs/resx]`,
        );

        return '';
    }

    private async getCreateDirectory(workspaceFolder: vscode.Uri | undefined): Promise<vscode.Uri | undefined> {
        const config = ExtensionUtils.getConfiguration();
        let createDirectory: vscode.Uri | undefined = undefined;

        const defaultCreateDirectory = config.get<string>("createDirectory");
        if (defaultCreateDirectory === undefined || defaultCreateDirectory.length === 0) {
            const directories = await vscode.window.showOpenDialog({
                title: "Select directory where new resource files will be created",
                openLabel: "Set create resources directory.",
                canSelectFolders: true,
                defaultUri: workspaceFolder,
                canSelectMany: false
            });

            if (directories === undefined || directories[0] === undefined) {
                return undefined;
            }

            createDirectory = directories[0];
        }
        else {
            createDirectory = vscode.Uri.parse(defaultCreateDirectory);
        }

        return createDirectory;
    }

    private async getResourceFileName() {
        let resourceFileName = "Resources";
        const userFileName = await vscode.window.showInputBox({
            title: "Provied resource file name, leave empty for default name: 'Resources'",
            placeHolder: "Resources",
        });

        if (userFileName !== undefined && userFileName.length > 0) {
            resourceFileName = userFileName;
        }

        return resourceFileName;
    }

    private async canCreateFiles(designerFilePath: vscode.Uri, resxFilePath: vscode.Uri): Promise<boolean> {

        if (await ExtensionUtils.fileExists(designerFilePath) === true) return false
        if (await ExtensionUtils.fileExists(resxFilePath) === true) return false

        return true;
    }

    private async getNamespace(
        createDirectory: vscode.Uri,
        workspaceFolder: vscode.Uri | undefined
    ): Promise<string | undefined> {

        if (!workspaceFolder) {
            return undefined;
        }

        let currentDir = createDirectory;
        let namespace = '';

        try {
            while (true) {

                // Szukamy *.sln tylko w bieżącym katalogu
                const pattern = new vscode.RelativePattern(currentDir, '*.sln');
                const files = await vscode.workspace.findFiles(pattern, undefined, 1);

                if (files.length > 0) {

                    const slnFile = files[0];
                    const solutionName = path.basename(slnFile.fsPath, '.sln');

                    return solutionName + namespace;
                }

                const currentFolderName = path.basename(currentDir.fsPath);

                // Dodajemy ".Folder" na początek
                namespace = `.${currentFolderName}${namespace}`;

                const parentPath = path.dirname(currentDir.fsPath);

                // Jeśli wyszliśmy poza workspace → przerywamy
                if (!parentPath.startsWith(workspaceFolder.fsPath)) {
                    return namespace;
                }

                // Jeśli już jesteśmy w root → koniec
                if (parentPath === currentDir.fsPath) {
                    return namespace;
                }

                currentDir = vscode.Uri.file(parentPath);
            }
        } catch (error) {
            return namespace;
        }
    }

    private async validateNamespace(namespace: string | undefined): Promise<string | undefined> {
        if (namespace === undefined || namespace.length === 0) {

            const userNamespace = await vscode.window.showInputBox({
                title: "Missing namespace, provide one",
                placeHolder: "Namespace such as [SOLUTION_NAME].[NAMESPACE...]",
            });

            return userNamespace;
        }

        if (namespace.startsWith(".")) {
            const userSolution = await vscode.window.showInputBox({
                title: "Invalid namespace, missing solution name, provide solution name",
                placeHolder: "Solution name",
            });

            return `${userSolution}${namespace}`;
        }

        return namespace;
    }

    private async createResourceFiles(namespace: string, resourceFileName: string, designerFilePath: vscode.Uri, resxFilePath: vscode.Uri) {
        const extensionUri = this.context.extensionUri;

        let solutionName = namespace;
        let namespacePath = '';

        const dotIndex = namespace.indexOf('.');
        if (dotIndex > 0) {
            solutionName = namespace.substring(0, dotIndex);
            namespacePath = namespace.substring(dotIndex);
        }


        // Read designer template file, replace variables and write copy to create directory
        const designerTemplateFilePath = vscode.Uri.joinPath(extensionUri, 'src', 'templates', 'DesignerFile.txt');
        const designerTemplateContent = await vscode.workspace.fs.readFile(designerTemplateFilePath);
        let designerFileText = this.textDecoder.decode(designerTemplateContent);
        designerFileText = designerFileText.replaceAll('[PROJECT_NAME]', solutionName);
        designerFileText = designerFileText.replaceAll('[NAMESPACE]', namespacePath);
        designerFileText = designerFileText.replaceAll('[FILE_NAME]', resourceFileName);
        const encodedDesignerText = this.textEncoder.encode(designerFileText);
        await vscode.workspace.fs.writeFile(designerFilePath, encodedDesignerText);


        // Copy resx template file to create directory
        const resxTemplateFilePath = vscode.Uri.joinPath(extensionUri, 'src', 'templates', 'ResxFile.txt');
        await vscode.workspace.fs.copy(resxTemplateFilePath, resxFilePath);
    }
}