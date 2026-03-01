import path from 'path';
import * as vscode from 'vscode';
import { ResourceFile } from '../models/resourceFile';
import { ResourceConverter } from '../models/resourceConverter';
import { ResourceRow } from '../models/resourceRow';

export class ResourceEditorProvider implements vscode.CustomTextEditorProvider {

    private context: vscode.ExtensionContext;
    private readonly textDecoder = new TextDecoder();

    private openPanels: Map<string, vscode.WebviewPanel> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    private async getResourceFiles(uri: vscode.Uri, baseName: string): Promise<vscode.Uri[]> {

        const folderPath = path.dirname(uri.fsPath);

        const pattern1 = new vscode.RelativePattern(folderPath, `${baseName}.resx`);
        const pattern2 = new vscode.RelativePattern(folderPath, `${baseName}.*.resx`);

        const files1 = await vscode.workspace.findFiles(pattern1);
        const files2 = await vscode.workspace.findFiles(pattern2);

        return files1.concat(files2);
    }

    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel
    ): Promise<void> {

        const folderPath = path.dirname(document.fileName);
        const baseName = path.basename(document.fileName).replace(/(\.\w*)?\.resx/, '').replace(/\.Designer\.cs$/, '');
        const panelKey = `${folderPath}/${baseName}`;

        const existingPanel = this.openPanels.get(panelKey);
        if (existingPanel) {
            existingPanel.reveal();
            webviewPanel.dispose();
            return;
        }

        this.openPanels.set(panelKey, webviewPanel);

        webviewPanel.onDidDispose(() => {
            this.openPanels.delete(panelKey);
        });

        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = await this.getHtml();

        const files = await this.getResourceFiles(document.uri, baseName);
        const resourceFiles = [];
        for (let i = 0; i < files.length; i++) {
            const resourceFile = await ResourceFile.create(files[i]);
            resourceFiles.push(resourceFile);
        }

        const resourceConverter: ResourceConverter = new ResourceConverter();
        const tableData = resourceConverter.createResourceTableData(resourceFiles);
        const resourceRows = resourceConverter.createResourceRows(resourceFiles, tableData);

        webviewPanel.webview.postMessage({
            type: "init",
            fileName: baseName,
            cultures: tableData.cultures,
            resourceRows: resourceRows,
        });

        webviewPanel.webview.onDidReceiveMessage(message => {
            if (message.type === "updateResources") {


                console.log(`Editor made changes in resources`);

                // const edit = new vscode.WorkspaceEdit();

                // edit.replace(
                //     document.uri,
                //     new vscode.Range(
                //         0, 0,
                //         document.lineCount, 0
                //     ),
                //     message.text
                // );

                // vscode.workspace.applyEdit(edit);
            }
        });
    }

    private async getHtml(): Promise<string> {
        const extensionUri = this.context.extensionUri;
        const editorFilePath = vscode.Uri.joinPath(extensionUri, 'src', 'templates', 'ResourceEditor.html');
        const editorFile = await vscode.workspace.fs.readFile(editorFilePath);
        return this.textDecoder.decode(editorFile);
    }
}