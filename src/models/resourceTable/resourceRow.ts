import { ResourceData } from "./resourceData";

export class ResourceRow {
    name: string = '';
    comment: string = '';
    data: ResourceData[] = [];

    constructor(name: string, comment: string, data: ResourceData[]) {
        this.name = name;
        this.comment = comment;
        this.data = data;
    }
}

