import * as vscode from "vscode";
import { ExtensionUtils } from "./extensionUtils";
import { ResourceFilesFactory } from "./resourceFilesFactory";

export class CommandsRegistration {

    private context: vscode.ExtensionContext;
    private resourceFilesFactory: ResourceFilesFactory;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.resourceFilesFactory = new ResourceFilesFactory(this.context);
    }


    public createResourceFiles() {
        const disposable = vscode.commands.registerCommand(
            "dotnet-resource-manager.createResourceFiles",
            async () => {
                const errorMessage = await this.resourceFilesFactory.createFiles();

                if (errorMessage !== undefined && errorMessage.length > 0) {
                    vscode.window.showErrorMessage(`Cannot create resource files: ${errorMessage}`);
                }
            },
        );

        this.context.subscriptions.push(disposable);
    }

    public setDefaultCreateDirectory() {
        const disposable = vscode.commands.registerCommand(
            "dotnet-resource-manager.setDefaultCreateDirectory",
            async () => {
                const workspaceFolder = ExtensionUtils.getWorkspaceFolder();

                const directories = await vscode.window.showOpenDialog({
                    title: "Select new default create resources directory",
                    openLabel: "Set default create resources directory.",
                    canSelectFolders: true,
                    defaultUri: workspaceFolder,
                    canSelectMany: false
                });

                if (directories === undefined || directories[0] === undefined) {
                    vscode.window.showErrorMessage(
                        "User selected empty directory or canceled?",
                    );
                    return;
                }

                const currentConfig = vscode.workspace.getConfiguration(
                    "dotnet-resource-manager",
                );

                currentConfig.update("createDirectory", directories[0].toString());

                vscode.window.showInformationMessage(
                    `Set default create resource directory successfully`,
                );
            },
        );

        this.context.subscriptions.push(disposable);
    }
}
