import * as vscode from "vscode";

export class ExtensionUtils {
    public static GetConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration(
            "dotnet-resource-manager",
        );
    }

    public static GetWorkspaceFolder(): vscode.Uri | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        let workspaceFolder = undefined;

        if (
            workspaceFolders !== undefined &&
            workspaceFolders[0] !== undefined
        ) {
            workspaceFolder = workspaceFolders[0].uri;
        }

        return workspaceFolder;
    }

    public static getParentFolderName(uri: vscode.Uri): string | undefined {
        const parent = vscode.Uri.joinPath(uri, "..");

        if (parent.toString() === uri.toString()) {
            return undefined; // jesteś w root
        }

        const segments = parent.path.split("/");
        return segments[segments.length - 1];
    }

    public static getCurrentFolderName(uri: vscode.Uri): string | undefined {
        const segments = uri.path.split("/");
        return segments[segments.length - 1];
    }
}