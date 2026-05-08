import ResourceData from './resourceData.js';

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

    addCulture(culture) {
        this.#cultures.push(culture);
        for (let i = 0; i < this.#resourceRows.length; i++) {
            const newCultureValue = new ResourceData();
            newCultureValue.language = culture;
            newCultureValue.value = "";
            this.#resourceRows[i].data.push(newCultureValue);
        }
    }

    getCulture(searchCulture) {
        return this.#cultures.find(r => r === searchCulture);
    }

    findResourceByName(/** @type {string} */ resourceName) {
        return this.#resourceRows.find((r) => r.name === resourceName);
    }

}