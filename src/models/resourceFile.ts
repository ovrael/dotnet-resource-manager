import * as vscode from 'vscode';
import path from 'path';

import { ResourceFileDataRecord } from './resourceFileDataRecord';

export class ResourceFile {
    public uri: vscode.Uri | string;
    // public text: string;
    public clearFileName: string;
    public language: string;
    public dataRecords: ResourceFileDataRecord[] = [];

    constructor(document: vscode.TextDocument) {
        this.uri = document.uri.toString();
        // this.text = document.getText();
        const text = document.getText();

        const basename = path.basename(document.fileName);

        const match = basename.match(/^(.+)\.(.+)\.resx$/);

        if (match) {
            this.clearFileName = match[1];   // "Example"
            this.language = match[2];   // "pl"
        } else {
            this.clearFileName = basename.replace(/(\.\w*)?\.resx/, '').replace(/\.Designer\.cs$/, '');
            this.language = '';
        }

        this.fillDataRecords(text);
        // this.fillDataRecords(this.text);
    }

    private fillDataRecords(text: string) {
        const validatedText = text.replace(/<!--.*-->/mgs, '');
        const matches = validatedText.matchAll(/<data name="(.*?)".*>\s*<value>(.*)<\/value>\s*((<comment>(.*)<\/comment>)|(<comment\/>))?\s*<\/data>/gm);

        this.dataRecords = [];
        for (const match of matches) {
            // match[1] → name
            // match[2] → value
            // match[5] → comment
            this.dataRecords.push(new ResourceFileDataRecord(
                match[1],
                match[2],
                match[5]
            ));
        }
    }

    public static async create(uri: vscode.Uri): Promise<ResourceFile> {
        const document = await vscode.workspace.openTextDocument(uri);
        return new ResourceFile(document);
    }
}