import * as vscode from "vscode";
import * as path from "path";
import { ExtensionUtils } from "./utils/extensionUtils";

export class CommandsRegistration {



    public static CreateResourceFiles(context: vscode.ExtensionContext) {
        const disposable = vscode.commands.registerCommand(
            "dotnet-resource-manager.createResourceFiles",
            async () => {

                const config = ExtensionUtils.GetConfiguration();
                const workspaceFolder = ExtensionUtils.GetWorkspaceFolder();
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
                        vscode.window.showErrorMessage(
                            "User selected empty directory or canceled?",
                        );
                        return;
                    }

                    createDirectory = directories[0];
                }
                else {
                    createDirectory = vscode.Uri.parse(defaultCreateDirectory);
                }

                // Should not happen
                if (createDirectory === undefined) {
                    vscode.window.showErrorMessage("No directory to create resource files");
                    return;
                }

                let resourceFileName = "Resources";
                const userFileName = await vscode.window.showInputBox({
                    title: "Resource file name",
                    placeHolder: "AppResource",
                });
                if (userFileName !== undefined && userFileName.length > 0) {
                    resourceFileName = userFileName;
                }


                // Get Project name
                let projectName = undefined;


                if (workspaceFolder) {
                    projectName = ExtensionUtils.getCurrentFolderName(workspaceFolder);
                }

                if (projectName === undefined) {
                    projectName = "Unknown_Project";
                }


                const extensionUri = context.extensionUri;

                // Read designer template file, replace variables and write copy to create directory
                const designerFilePath = vscode.Uri.joinPath(extensionUri, 'src', 'templates', 'DesignerFile.txt');
                const designerTemplateContent = await vscode.workspace.fs.readFile(designerFilePath);
                let designerFileText = new TextDecoder().decode(designerTemplateContent);
                designerFileText = designerFileText.replaceAll('[PROJECT_NAME]', projectName);
                designerFileText = designerFileText.replaceAll('[CREATE_DIRECTORY]', "Test_Directory");
                designerFileText = designerFileText.replaceAll('[FILE_NAME]', resourceFileName);
                const encodedDesignerText = new TextEncoder().encode(designerFileText);
                await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(createDirectory, `${userFileName}.Designer.cs`), encodedDesignerText);


                // Read resx template file and write copy to create directory
                const resxFilePath = vscode.Uri.joinPath(extensionUri, 'src', 'templates', 'ResxFile.txt');
                const resxTemplateContent = await vscode.workspace.fs.readFile(resxFilePath);
                await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(createDirectory, `${userFileName}.resx`), resxTemplateContent);


                vscode.window.showInformationMessage(
                    `Created files ${userFileName}.[Designer.cs/resx]`,
                );
            },
        );

        context.subscriptions.push(disposable);
    }

    public static SetDefaultCreateDirectory(context: vscode.ExtensionContext) {
        const disposable = vscode.commands.registerCommand(
            "dotnet-resource-manager.setDefaultCreateDirectory",
            async () => {
                const workspaceFolder = ExtensionUtils.GetWorkspaceFolder();

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

        context.subscriptions.push(disposable);
    }
}
