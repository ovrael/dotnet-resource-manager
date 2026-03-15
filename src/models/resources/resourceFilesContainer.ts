import path from "path";
import * as vscode from 'vscode';

import { ResourceFile } from "./resourceFile";
import { DesignerFile } from "./designerFile";
import { PathData } from "./pathData";

import { ResourceRow } from "../resourceTable/resourceRow";
import { ResourceData } from "../resourceTable/resourceData";
import { ResourceTableData } from "../resourceTable/resourceTableData";
import { Element } from "./element";

export class ResourceFilesContainer {

    public webviewEditorPanel?: vscode.WebviewPanel; // optional, may not exist
    public resourcePath: PathData;

    public designerFile?: DesignerFile; // optional, may not exist - can be recreated
    public resourceFiles: ResourceFile[] = [];

    private constructor(resourcePath: string) {
        this.resourcePath = new PathData(resourcePath);
    }

    public openEditor(editor: vscode.WebviewPanel) {
        this.webviewEditorPanel = editor;
    }

    public closeEditor() {
        this.webviewEditorPanel = undefined;

    }

    public exists(otherPath: PathData): boolean {
        return this.resourcePath.compareTo(otherPath);
    }

    public static async create(resourcePath: string) {
        const container = new ResourceFilesContainer(resourcePath);
        await container.tryAdd(resourcePath); // add the resource file itself to the container

        return container;
    }



    public async tryAdd(filePath: string): Promise<ResourceFilesContainer | undefined> {

        if (filePath.endsWith(".Designer.cs")) {

            if (this.designerFile === undefined) {
                // we don't need to read the designer file, we just need to know it exists
                this.designerFile = new DesignerFile(filePath);
            }

            return this;
        }
        else if (filePath.endsWith(".resx")) {

            const parts = path.basename(filePath).split(".");

            let culture: string | undefined = undefined;

            if (parts.length === 2) {
                culture = ""; // default culture
            }
            else if (parts.length === 3) {
                culture = parts[1]; // culture is the middle part of the file name
            }
            else {
                return undefined; // invalid file name format
            }

            const existing = this.resourceFiles.find(r => r.culture === culture);
            if (existing) {
                return this; // file already exists
            }

            const resourceFile = await ResourceFile.create(filePath, culture);
            this.resourceFiles.push(resourceFile);

            return this;
        }

        return undefined;
    }

    public tryRemove(filePath: string): boolean {
        if (filePath.endsWith(".Designer.cs")) {

            if (this.designerFile !== undefined) {
                this.designerFile = undefined;
                return true; // designer file removed
            }
            // if designer file doesn't exist, we consider it as already removed, so we return true
            return true;
        }
        else if (filePath.endsWith(".resx")) {

            const index = this.resourceFiles.findIndex(r => r.filePath === filePath);

            if (index !== -1) {
                this.resourceFiles.splice(index, 1);
                return true; // resource file removed
            }
            // if resource file doesn't exist, we consider it as already removed, so we return true
            return true;
        }

        return false;
    }

    public getCultures(): string[] {
        return this.resourceFiles.map(r => r.culture);
    }


    private createResourceTableData(inputResources: ResourceFile[]): ResourceTableData {
        const uniqueCultures: Set<string> = new Set();
        const uniqueResourceNames: Set<string> = new Set();
        for (let i = 0; i < inputResources.length; i++) {
            uniqueCultures.add(inputResources[i].culture);
            for (let j = 0; j < inputResources[i].resources.length; j++) {
                uniqueResourceNames.add(inputResources[i].resources[j].name);
            }
        }
        return new ResourceTableData(uniqueCultures, uniqueResourceNames);
    }

    public toResourceRows(): ResourceRow[] {
        const resourceRows: ResourceRow[] = [];
        const tableData = this.createResourceTableData(this.resourceFiles);
        const cultures = tableData.cultures;
        const resourceNames = tableData.resourceNames;

        for (let i = 0; i < cultures.length; i++) {
            const resourceFile = this.resourceFiles.find(
                (r) => r.culture === cultures[i],
            );

            if (!resourceFile) {
                continue;
            }

            for (let j = 0; j < resourceNames.length; j++) {
                let record = resourceFile.resources.find(
                    (r) => r.name === resourceNames[j],
                );

                if (!record) {
                    record = new Element(resourceNames[j], "", "");
                }

                const row: ResourceRow | undefined = resourceRows.find((r) => r.name === record.name);
                const newData = new ResourceData(cultures[i], record.value);

                if (row === undefined) {
                    const newRow = new ResourceRow(record.name, record.comment ?? "", [newData]);
                    resourceRows.push(newRow);
                } else {
                    row.data.push(newData);
                }
            }
        }
        return resourceRows;
    }
}