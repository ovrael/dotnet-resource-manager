export class ResourceFileDataRecord {
    public name: string;
    public value: string;
    public comment: string;

    constructor(name: string, value: string, comment: string | undefined) {
        this.name = name;
        this.value = value;
        this.comment = comment ?? '';
    }
}