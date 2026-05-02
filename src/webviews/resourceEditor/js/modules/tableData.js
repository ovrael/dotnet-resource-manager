export default class TableData {

    /** @type {ResourceRow[]} */
    #resourceRows = [];

    /** @type {string[]} */
    #cultures = [];

    constructor(resourceRows, cultures) {
        this.#resourceRows = resourceRows;
        this.#cultures = cultures;
    }

    fill(resourceRows, cultures) {
        this.#resourceRows = resourceRows;
        this.#cultures = cultures;
    }

    getCultures() {
        return this.#cultures;
    }

    getResourceRows() {
        return this.#resourceRows;
    }

    addResource(/** @type {ResourceRow} */ newResource) {
        this.#resourceRows.push(newResource);
    }

    findResourceByName(/** @type {string} */ resourceName) {
        return this.#resourceRows.find((r) => r.name === resourceName);
    }
}