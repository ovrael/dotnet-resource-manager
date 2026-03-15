import * as vscode from 'vscode';

import { Element } from "./element";

export class ResourceFile {

    public filePath = ""; // e.g. "C:/project/Resources/MenuTexts.en.resx"
    public culture = "";  // e.g. "en" (culture part of the file name, can be empty for default culture)
    public resources: Element[] = []; // list of resources in the file

    private static textDecoder = new TextDecoder();
    private static dataRegex = /<data name="(?<name>.*?)".*>(?<content>[\s\S]*?)<\/data>/gm;
    private static valueRegex = /<value>(?<content>[\s\S]*?)<\/value>/g;
    private static commentRegex = /<comment>(?<content>[\s\S]*?)<\/comment>/g;

    private constructor(filePath: string, culture: string, resources: Element[]) {
        this.filePath = filePath;
        this.culture = culture;
        this.resources = resources;
    }

    public static async create(filePath: string, culture: string) {

        const fileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
        const text = this.textDecoder.decode(fileContent);

        const resources = this.getDataRecords(text);

        return new ResourceFile(filePath, culture, resources);
    }

    private static getDataRecords(text: string): Element[] {
        const validatedText = text.replace(/<!--.*-->/mgs, '');
        return this.searchForResourceData(validatedText);
    }

    public static searchForResourceData(text: string): Element[] {

        const dataRecords: Element[] = [];

        const dataMatches = text.matchAll(this.dataRegex);

        for (const dataMatch of dataMatches) {
            const name = dataMatch.groups?.name ?? "";
            const content = dataMatch.groups?.content?.trim() ?? "";

            this.valueRegex.lastIndex = 0; // reset regex state
            this.commentRegex.lastIndex = 0; // reset regex state

            const valueMatch = this.valueRegex.exec(content);
            const commentMatch = this.commentRegex.exec(content);

            const value = (valueMatch && valueMatch.groups?.content) ?? "";
            const comment = (commentMatch && commentMatch.groups?.content) ?? "";

            dataRecords.push(new Element(name.trim(), value.trim(), comment.trim()));
        }

        return dataRecords;
    }

}