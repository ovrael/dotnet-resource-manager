export class Element {

    public name = "";   // e.g. "FileMenu"
    public value = "";  // e.g. "File"
    public comment?: string; // optional, may not exist

    constructor(name: string, value: string, comment?: string) {
        this.name = name;
        this.value = value;
        this.comment = comment;
    }
}