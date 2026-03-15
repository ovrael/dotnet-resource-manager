import * as vscode from 'vscode';
import { Resources } from '../models/resources/resources';

export class ResourceEditorProvider implements vscode.CustomTextEditorProvider {

    private context: vscode.ExtensionContext;
    private resourcesContainer: Resources;
    private readonly textDecoder = new TextDecoder();

    private constructor(context: vscode.ExtensionContext, resourcesContainer: Resources) {
        this.context = context;
        this.resourcesContainer = resourcesContainer;
    }

    public static async create(context: vscode.ExtensionContext) {
        const resourcesContainer = await Resources.create();
        return new ResourceEditorProvider(context, resourcesContainer);
    }


    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel
    ): Promise<void> {

        const container = await this.resourcesContainer.tryAddResource(document.uri);
        if (!container) {
            vscode.window.showErrorMessage(`Failed to open resource editor for ${document.uri.fsPath}.`);
            webviewPanel.dispose();
            return;
        }

        if (container.webviewEditorPanel) {
            container.webviewEditorPanel.reveal();
            webviewPanel.dispose();
            return;
        }

        container.openEditor(webviewPanel);
        webviewPanel.reveal();


        webviewPanel.onDidDispose(() => {
            container.closeEditor();
        });

        webviewPanel.webview.options = {
            enableScripts: true,
        };


        webviewPanel.webview.html = await this.getHtml(webviewPanel.webview);

        const cultures = container.getCultures();
        const resourceRows = container.toResourceRows();

        webviewPanel.webview.postMessage({
            type: "init",
            data: {
                fileName: container.resourcePath.basename,
                cultures: cultures,
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