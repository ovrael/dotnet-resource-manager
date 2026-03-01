import * as vscode from 'vscode';
import * as path from 'path';

class ResourceTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly resourceUri?: vscode.Uri,
        public readonly basePath?: string
    ) {
        super(label, collapsibleState);
    }
}

export class ResourceTreeProvider implements vscode.TreeDataProvider<ResourceTreeItem> {

    getTreeItem(element: ResourceTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ResourceTreeItem): Promise<ResourceTreeItem[]> {

        if (!vscode.workspace.workspaceFolders) return [];

        const files = await vscode.workspace.findFiles('**/*.resx');
        const grouped = new Map<string, vscode.Uri[]>();

        for (const file of files) {
            const base = file.fsPath.replace(/\.\w+\.resx$/, '');
            if (!grouped.has(base)) {
                grouped.set(base, []);
            }
            grouped.get(base)!.push(file);
        }


        if (!element) {
            return Array.from(grouped.keys()).map(base =>
                new ResourceTreeItem(
                    path.basename(base),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    base
                )
            );
        } else {
            if (element.basePath === undefined) {
                vscode.window.showErrorMessage("Cannot show children of: " + element.label);
                return [];
            }

            const children = grouped.get(element.basePath) || [];

            return children.map(file =>
                new ResourceTreeItem(
                    path.basename(file.fsPath),
                    vscode.TreeItemCollapsibleState.None,
                    file,
                    undefined
                )
            );
        }
    }
}