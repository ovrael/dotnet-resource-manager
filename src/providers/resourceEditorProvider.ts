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

        webviewPanel.webview.html = await this.getHtml(webviewPanel.webview);

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
            data: {
                fileName: baseName,
                cultures: tableData.cultures,
                resourceRows: resourceRows,
            }
        });

        webviewPanel.webview.onDidReceiveMessage(message => {
            if (message.type === "textareaChange" && message.data !== undefined) {

                const name = message.data.name;
                const prevname = message.data.prevname;
                const type = message.data.type;
                const culture = message.data.culture;
                const value = message.data.value;

                const searchName = prevname ? prevname : name;
                const resourceRow = resourceRows.find((r) => r.name === searchName);

                vscode.window.showInformationMessage(`Change in resource: ${name}, previous name: ${prevname}, culture: ${culture}, type: ${type}, new value: ${value}`);

                if (!resourceRow) {
                    vscode.window.showErrorMessage(`Resource row with name ${searchName} not found.`);
                    return;
                }

                switch (type) {
                    case "name":
                        resourceRow.name = value;
                        break;

                    case "value":
                        let data = resourceRow.data.find((d) => d.language === culture);
                        if (!data) {
                            data = { language: culture, value: "" };
                            resourceRow.data.push(data);
                        }
                        data.value = value;
                        break;
                    case "comment":
                        resourceRow.comment = value;
                        break;
                    default:
                        break;
                }



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

    private async getHtml(webview: vscode.Webview): Promise<string> {
        const extensionUri = this.context.extensionUri;
        const editorFilePath = vscode.Uri.joinPath(extensionUri, 'src', 'webviews', 'resourceEditor', 'index.html');
        const editorFile = await vscode.workspace.fs.readFile(editorFilePath);
        const html = this.textDecoder.decode(editorFile);


        return await this.addMedia(html, webview);
    }

    private async addMedia(html: string, webview: vscode.Webview): Promise<string> {
        const extensionUri = this.context.extensionUri;

        const jsPath = vscode.Uri.joinPath(extensionUri, 'src', 'webviews', 'resourceEditor', 'js');
        const cssPath = vscode.Uri.joinPath(extensionUri, 'src', 'webviews', 'resourceEditor', 'css');

        const styles = await vscode.workspace.fs.readDirectory(cssPath);

        const nonce = this.getNonce();
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(jsPath, 'main.js'));
        const scriptTag = `<script type="module" src="${scriptUri}" nonce="${nonce}"></script>`;

        const meta = `<meta
            http-equiv="Content-Security-Policy"
            content="
            default-src 'none';
            style-src ${webview.cspSource};
            script-src 'nonce-${nonce}';
            "/>`;

        let stylesTags = '';
        for (let i = 0; i < styles.length; i++) {
            if (!styles[i][0].endsWith('.css')) {
                continue;
            }
            const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(cssPath, styles[i][0]));
            stylesTags += `<link href="${styleUri}" rel="stylesheet" />\n`;
        }


        html = html.replace('<!-- [META_REPLACE] -->', meta);
        html = html.replace('<!-- [STYLES_REPLACE] -->', stylesTags);
        html = html.replace('<!-- [SCRIPTS_REPLACE] -->', scriptTag);

        return html;
    }

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}