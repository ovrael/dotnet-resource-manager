import ResourceRow from './resourceRow.js';
import ResourceData from './resourceData.js';

export default class TableDrawer {

    /** @type {HTMLDivElement} */
    #tableDiv;

    /** @type {VSCodeMessages} */
    #vscodeApi;

    constructor(tableDivId, vscodeApi) {

        this.#tableDiv = document.getElementById(tableDivId);

        if (!this.#tableDiv) {
            console.warn(`Something went horribly wrong, there is no table?`);
            return;
        }

        this.#vscodeApi = vscodeApi;
    }

    createTableHeaders(/**@type {TableData} */ tableData) {
        const commentHeaderElement = document.getElementById("commentHeader");

        // let cultureIndexHeader = 1;
        for (const culture of tableData.getCultures()) {
            const cultureName = culture === undefined ? "" : culture;
            const id = `${cultureName}CultureHeader`;
            const headerElement = document.getElementById(id);

            if (!headerElement) {
                const cultureHeader = document.createElement("div");
                cultureHeader.id = id;
                cultureHeader.innerText = culture;
                cultureHeader.className = `div-table-cell cell-header cell-long`;
                // cultureHeader.dataset.cultureindex = cultureIndexHeader;
                // cultureIndexHeader++;

                // cultureIndex.set(culture, cultureIndexHeader);
                commentHeaderElement.parentNode.insertBefore(
                    cultureHeader,
                    commentHeaderElement,
                );
            }
        }
    }

    createTableRows(/**@type {TableData} */ tableData) {
        const cultures = tableData.getCultures();
        for (const resourceRow of tableData.getResourceRows()) {
            const rowElement = this.#createRowElement(resourceRow, cultures);
            resourceTable.appendChild(rowElement);
        }
    }

    addNewRow(newRow, /**@type {TableData} */ tableData) {

        tableData.addResource(newRow);

        const rowElement = this.#createRowElement(newRow, tableData.getCultures());
        this.#tableDiv.appendChild(rowElement);
    }

    addNewCulture(culture, /**@type {TableData} */ tableData) {
        tableData.addCulture(culture);

        // const headerRow = document.getElementById("resourceTableHeader");
        // if (headerRow) {
        //     const cultureHeader = document.createElement("div");
        //     cultureHeader.id = `${culture}CultureHeader`;
        //     cultureHeader.innerText = culture;
        //     cultureHeader.className = `div-table-cell cell-header cell-long`;

        //     const commentHeaderElement = document.getElementById("commentHeader");
        //     headerRow.insertBefore(
        //         cultureHeader,
        //         commentHeaderElement,
        //     );
        // }

        /**@type {ResourceRow[] }*/const resources = tableData.getResourceRows();

        const rows = Array.from(document.getElementsByClassName('div-table-row'));
        // if resource has empty name, cant add culture

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (row.id === "resourceTableHeader") {
                const cultureHeader = document.createElement("div");
                cultureHeader.id = `${culture}CultureHeader`;
                cultureHeader.innerText = culture;
                cultureHeader.className = `div-table-cell cell-header cell-long`;

                const commentHeaderElement = document.getElementById("commentHeader");
                row.insertBefore(
                    cultureHeader,
                    commentHeaderElement,
                );
                continue;
            }

            const nameTextarea = row.children[0].children[0];
            if (!nameTextarea) continue;

            const commentElement = row.children[row.children.length - 1];

            const resourceName = nameTextarea.dataset.name ?? "";
            const resource = tableData.findResourceByName(resourceName);


            const valueElement = document.createElement("div");
            valueElement.id = `${resource.name}_${culture}Value`;
            valueElement.className = `div-table-cell cell-value cell-long`;

            const valueTextareaElement = this.#createTextarea(
                resource,
                resource.name,
                "",
                "value",
                culture,
            );

            const textareas = Array.from(
                row.querySelectorAll("textarea")
            );
            textareas.push(valueTextareaElement);
            valueElement.appendChild(valueTextareaElement);
            row.insertBefore(
                valueElement,
                commentElement,
            );

            this.#addRowEvents(row, textareas);
        }


        // for (let i = 0; i < resources.length; i++) {
        //     const resource = resources[i];
        //     const row = document.getElementById(`${resource.name}Row`);
        //     const commentElement = document.getElementById(`${resource.name}Comment`);


        //     const valueElement = document.createElement("div");
        //     valueElement.id = `${resource.name}_${culture}Value`;
        //     valueElement.className = `div-table-cell cell-value cell-long`;

        //     const valueTextareaElement = this.#createTextarea(
        //         resource,
        //         resource.name,
        //         "",
        //         "value",
        //         culture,
        //     );

        //     const textareas = Array.from(
        //         row.querySelectorAll("textarea")
        //     );
        //     textareas.push(valueTextareaElement);
        //     valueElement.appendChild(valueTextareaElement);
        //     row.insertBefore(
        //         valueElement,
        //         commentElement,
        //     );

        //     this.#addRowEvents(row, textareas);
        // }

    }

    #createTextarea(resourceRow, name, value, type, culture) {
        const textarea = document.createElement("textarea");
        textarea.dataset.name = name;
        textarea.dataset.type = type;
        textarea.value = value;
        textarea.className = `resource-input textarea-reset`;

        textarea.dataset.culture = culture === undefined ? '' : culture;

        if (type === "name") {
            textarea.dataset.prevname = name;
        }

        this.#addTextareaEvents(resourceRow, textarea, type, undefined);

        return textarea;
    }

    #createRowElement(/** @type {ResourceRow} **/ resourceRow, cultures) {

        const textareas = [];

        const rowElement = document.createElement("div");
        rowElement.id = `${resourceRow.name}Row`;
        rowElement.className = `div-table-row`;

        const nameElement = document.createElement("div");
        nameElement.id = `${resourceRow.name}Name`;
        nameElement.className = `div-table-cell cell-value cell-short`;

        const nameTextareaElement = this.#createTextarea(
            resourceRow,
            resourceRow.name,
            resourceRow.name,
            "name",
            undefined,
        );
        textareas.push(nameTextareaElement);
        nameElement.appendChild(nameTextareaElement);
        rowElement.appendChild(nameElement);

        for (const culture of cultures) {
            const valueElement = document.createElement("div");
            const data = resourceRow.data.find((d) => d.language === culture);
            valueElement.id = `${resourceRow.name}_${culture}Value`;
            valueElement.className = `div-table-cell cell-value cell-long`;

            let trueValue = data === undefined ? "" : data.value;
            const valueTextareaElement = this.#createTextarea(
                resourceRow,
                resourceRow.name,
                trueValue,
                "value",
                culture,
            );
            textareas.push(valueTextareaElement);
            valueElement.appendChild(valueTextareaElement);
            rowElement.appendChild(valueElement);
        }

        const commentElement = document.createElement("div");
        commentElement.id = `${resourceRow.name}Comment`;
        commentElement.className = `div-table-cell cell-value cell-short`;

        const commentTextareaElement = this.#createTextarea(
            resourceRow,
            resourceRow.name,
            resourceRow.comment,
            "comment",
            undefined,
        );
        textareas.push(commentTextareaElement);
        commentElement.appendChild(commentTextareaElement);
        rowElement.appendChild(commentElement);

        this.#addRowEvents(rowElement, textareas);



        return rowElement;
    }

    #addTextareaEvents(
          /** @type {ResourceRow}**/ resourceRow,
          /** @type {HTMLTextAreaElement}**/ textarea,
        type,
        culture,
    ) {
        const resize = () => {
            if (textarea.scrollHeight >= 0) {
                textarea.style.height = "auto";
                textarea.style.height = textarea.scrollHeight + "px";
            }
        };

        const updateData = () => {

            // /** @type {ResourceRow} **/
            // const resourceRow = resourceRows.find((r) => r.name === textarea.dataset.name);

            if (!resourceRow) { return; }

            switch (type) {
                case "name":
                    textarea.dataset.prevname = `${textarea.dataset.name}`;
                    resourceRow.name = textarea.value;
                    textarea.dataset.name = `${resourceRow.name}`;

                    const textareasSiblings = textarea.parentElement.parentElement.getElementsByTagName("textarea");
                    for (const textarea of textareasSiblings) {

                        if (textarea.dataset.name === resourceRow.name) {
                            continue;
                        } else {
                            textarea.dataset.name = `${resourceRow.name}`;
                        }
                    }
                    break;
                case "value":
                    let data = resourceRow.data.find((d) => d.language === culture);
                    if (!data) {
                        data = { language: culture, value: "" };
                        resourceRow.data.push(data);
                    }
                    data.value = textarea.value;
                    break;
                case "comment":
                    resourceRow.comment = textarea.value;
                    break;
                default:
                    break;
            }
        };

        textarea.addEventListener("input", updateData);
        textarea.addEventListener("input", () => this.#vscodeApi.textareaChange(textarea));
    }

    #addRowEvents(/** @type {HTMLDivElement} **/ rowElement, /** @type {HTMLTextAreaElement[]} **/ textareas) {

        rowElement.addEventListener("input", (e) => {

            if (!(e.target instanceof HTMLTextAreaElement)) {
                return;
            }

            const empty = textareas.every(ta => ta.value.length === 0);

            rowElement.classList.toggle("empty-row", empty);

            const maxHeight = Math.max(
                ...textareas.map(ta => ta.scrollHeight)
            );

            if (maxHeight > 0) {
                for (const ta of textareas) {
                    ta.style.height = maxHeight + "px";
                }
            }
        });

        setTimeout(() => {
            const heights = textareas.map((ta) => ta.scrollHeight);
            const maxHeight = Math.max(...heights);

            if (maxHeight <= 0) { return; }

            for (const textarea of textareas) {
                textarea.style.height = "auto";
                textarea.style.height = maxHeight + "px";
            }
        }, 100);
    }
}