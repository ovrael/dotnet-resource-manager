import path from "path";

export class PathData {

    public directoryPath = ""; // e.g. "C:/project/Resources/"
    public basename = ""; // e.g. "MenuTexts" (with culture and extension)

    constructor(filePath: string) {
        this.directoryPath = path.dirname(filePath);
        const fileParts = path.basename(filePath).split(".");
        if (fileParts.length > 2) {
            this.basename = fileParts.slice(0, -2).join("."); // join all parts except the last two (culture and extension)
        } else {
            this.basename = fileParts[0]; // if there are not enough parts, use the whole name as basename
        }
    }

    public compareTo(other: PathData): boolean {
        return this.directoryPath === other.directoryPath && this.basename === other.basename;
    }
}