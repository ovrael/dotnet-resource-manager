import * as vscode from "vscode";

export class HandlersRegistration {

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }


    public openTextDocument() {
        const disposable = vscode.workspace.onDidOpenTextDocument(
            async (textDocument) => {

                if (!textDocument)
                    return;

                console.log(textDocument);

            },
        );

        this.context.subscriptions.push(disposable);
    }
}
