export class ResourceTableData {
    cultures: string[] = [];
    resourceNames: string[] = [];

    constructor(cultureUniques: Set<string>, resourceNameUniques: Set<string>) {
        this.cultures = [...cultureUniques];
        this.resourceNames = [...resourceNameUniques];
    }
}