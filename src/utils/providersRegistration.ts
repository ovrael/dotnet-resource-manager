import * as vscode from "vscode";
import { ResourceEditorProvider } from "../providers/resourceEditorProvider";

export class ProvidersRegistration {

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public async resourceEditor() {
        const disposable = vscode.window.registerCustomEditorProvider(
            "dotnet-resource-manager.resourceEditor",
            await ResourceEditorProvider.create(this.context),
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        );

        this.context.subscriptions.push(disposable);
    }

}
