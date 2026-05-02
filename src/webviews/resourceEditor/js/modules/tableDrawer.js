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

    #createTextarea(name, value, type, culture) {
        const textarea = document.createElement("textarea");
        textarea.dataset.name = name;
        textarea.dataset.type = type;
        textarea.value = value;
        textarea.className = `resource-input textarea-reset`;

        textarea.dataset.culture = culture === undefined ? '' : culture;

        if (type === "name") {
            textarea.dataset.prevname = name;
        }

        this.#addTextareaEvents(textarea, type, undefined);

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
            // valueElement.textContent = data.value;
            valueElement.className = `div-table-cell cell-value cell-long`;

            let trueValue = data === undefined ? "" : data.value;
            const valueTextareaElement = this.#createTextarea(
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
        commentElement.textContent = resourceRow.comment;
        commentElement.className = `div-table-cell cell-value cell-short`;

        const commentTextareaElement = this.#createTextarea(
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

            /** @type {ResourceRow} **/
            const resourceRow = resourceRows.find((r) => r.name === textarea.dataset.name);

            if (!resourceRow) { return; }

            switch (type) {
                case "name":
                    textarea.dataset.prevname = `${textarea.dataset.name}`;
                    resourceRow.name = textarea.value;
                    textarea.dataset.name = `${resourceRow.name}`;

                    const textareas = resourceRow.getElementsByTagName("textarea");
                    for (const textarea of textareas) {

                        if (textarea.dataset.name === resourceRow.name) { continue; }
                        else {
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
        let empty = true;

        for (const textarea of textareas) {

            textarea.addEventListener("input", () => {
                for (const ta of textareas) {
                    if (ta.value.length > 0) {
                        empty = false;
                        break;
                    }
                }

                if (empty) {
                    rowElement.classList.add("empty-row");
                } else {
                    rowElement.classList.remove("empty-row");
                }
            });



            textarea.addEventListener("input", () => {

                const heightsInput = textareas.map((ta) => ta.scrollHeight);
                const maxHeightInput = Math.max(...heightsInput);

                if (maxHeightInput <= 0) { return; }

                for (const ta of textareas) {
                    ta.style.height = maxHeightInput + "px";
                }
            });

        }


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