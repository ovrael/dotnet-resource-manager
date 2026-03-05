import ResourceRow from './modules/resourceRow.js';
import ResourceData from './modules/resourceData.js';
import VSCodeMessages from './modules/vscodeMessages.js';

document.addEventListener("DOMContentLoaded", () => {

    const vscode = acquireVsCodeApi();
    const vscodeMessages = new VSCodeMessages(vscode);

    /** @type {HTMLDivElement} */
    let resourceTable = undefined;

    /** @type {HTMLDivElement} */
    let errorContainer = undefined;

    /** @type {ResourceRow[]} */
    let resourceRows = [];

    /** @type {string[]} */
    let cultures = [];

    function createTableHeaders() {
        const commentHeaderElement = document.getElementById("commentHeader");

        let cultureIndexHeader = 1;
        for (const culture of cultures) {
            const cultureName = culture === undefined ? "" : culture;
            const id = `${cultureName}CultureHeader`;
            const headerElement = document.getElementById(id);

            if (!headerElement) {
                const cultureHeader = document.createElement("div");
                cultureHeader.id = id;
                cultureHeader.innerText = culture;
                cultureHeader.className = `div-table-cell cell-header cell-long`;
                cultureHeader.dataset.cultureindex = cultureIndexHeader;
                cultureIndexHeader++;

                // cultureIndex.set(culture, cultureIndexHeader);
                commentHeaderElement.parentNode.insertBefore(
                    cultureHeader,
                    commentHeaderElement,
                );
            }
        }
    }

    function createTextarea(name, value, type, culture) {
        const textarea = document.createElement("textarea");
        textarea.dataset.name = name;
        textarea.dataset.type = type;
        textarea.value = value;
        textarea.className = `resource-input textarea-reset`;

        if (culture !== undefined) {
            textarea.dataset.culture = culture;
        }

        if (type === "name") {
            textarea.dataset.prevname = name;
        }

        addTextareaEvents(textarea, value, type, undefined);

        return textarea;
    }

    function createRowElement(/** @type {ResourceRow} **/ resourceRow) {
        const rowElement = document.createElement("div");
        rowElement.id = `${resourceRow.name}Row`;
        rowElement.className = `div-table-row`;

        const nameElement = document.createElement("div");
        nameElement.id = `${resourceRow.name}Name`;
        nameElement.className = `div-table-cell cell-value cell-short`;

        const nameTextareaElement = createTextarea(
            resourceRow.name,
            resourceRow.name,
            "name",
            undefined,
        );

        nameElement.appendChild(nameTextareaElement);

        rowElement.appendChild(nameElement);

        for (const culture of cultures) {
            const valueElement = document.createElement("div");
            const data = resourceRow.data.find((d) => d.language === culture);
            valueElement.id = `${resourceRow.name}_${culture}Value`;
            // valueElement.textContent = data.value;
            valueElement.className = `div-table-cell cell-value cell-long`;

            let trueValue = data === undefined ? "" : data.value;
            const valueTextareaElement = createTextarea(
                resourceRow.name,
                trueValue,
                "value",
                culture,
            );

            valueElement.appendChild(valueTextareaElement);

            rowElement.appendChild(valueElement);
        }

        const commentElement = document.createElement("div");
        commentElement.id = `${resourceRow.name}Comment`;
        commentElement.textContent = resourceRow.comment;
        commentElement.className = `div-table-cell cell-value cell-short`;

        const commentTextareaElement = createTextarea(
            resourceRow.name,
            resourceRow.comment,
            "comment",
            undefined,
        );
        commentElement.appendChild(commentTextareaElement);

        rowElement.appendChild(commentElement);

        const textareas = rowElement.getElementsByTagName("textarea");
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
        }

        return rowElement;
    }

    function createTableRows() {
        for (const resourceRow of resourceRows) {
            const rowElement = createRowElement(resourceRow);
            resourceTable.appendChild(rowElement);
        }
    }

    function addTextareaEvents(
          /** @type {HTMLTextAreaElement}**/ textarea,
        rowName,
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

        textarea.addEventListener("input", resize);
        textarea.addEventListener("input", updateData);
        textarea.addEventListener("input", () => vscodeMessages.textareaChange(textarea));

        setTimeout(() => {
            resize();
        }, 500);
    }

    function initButtons() {
        const askDialog = document.getElementById("ask-dialog");

        const dialogConfirmButton = document.getElementById(
            "askDialogConfirmButton",
        );

        const dialogCancelButton = document.getElementById(
            "askDialogCancelButton",
        );
        const dialogInput = document.getElementById("askDialogInput");

        dialogCancelButton.onclick = (event) => {
            askDialog.hidden = true;
            dialogConfirmButton.onclick = null;
            dialogInput.oninput = null;
        };

        const addValueButton = document.getElementById("addValueButton");
        addValueButton.onclick = (event) => {
            const dialogTitle = document.getElementById("askDialogTitle");
            const dialogText = document.getElementById("askDialogText");
            const dialogInputContainer = document.getElementById(
                "askDialogInputContainer",
            );

            dialogTitle.innerText = "Add new resource value";
            dialogText.innerText = "Enter name for new resource value:";
            dialogInputContainer.hidden = false;
            dialogInput.value = ``;
            dialogInput.placeholder = `New Value #${resourceRows.length + 1}`;

            dialogInput.oninput = (event) => {
                const name = dialogInput.value.trim();
                if (name.length === 0) {
                    askDialog.classList.remove("good-input");
                    askDialog.classList.add("bad-input");
                    dialogConfirmButton.disabled = true;
                    return;
                }

                const existingRow = resourceRows.find((r) => r.name === name);
                if (existingRow === undefined) {
                    askDialog.classList.remove("bad-input");
                    askDialog.classList.add("good-input");
                    dialogConfirmButton.disabled = false;
                } else {
                    askDialog.classList.remove("good-input");
                    askDialog.classList.add("bad-input");
                    dialogConfirmButton.disabled = true;
                }
            };

            dialogConfirmButton.onclick = (event) => {
                const name = dialogInput.value.trim();

                const newRow = new ResourceRow();
                newRow.name = name;
                newRow.data = [];
                newRow.comment = "";

                for (const culture of cultures) {
                    const newData = new ResourceData();
                    newData.language = culture;
                    newData.value = "";

                    newRow.data.push(newData);
                }

                resourceRows.push(newRow);

                const rowElement = createRowElement(newRow);
                resourceTable.appendChild(rowElement);

                askDialog.hidden = true;
                dialogConfirmButton.onclick = null;
                dialogInput.oninput = null;
            };

            askDialog.hidden = false;
        };
    }

    //#region Send to client methods

    // element is 'row' or 'culture'
    function sendRemoveChange(element, name) {
        if (element !== "row" && element !== "culture") {
            console.warn(`Unknown element to remove: ${element}`);
            return;
        }

        vscode.postMessage({
            type: "removeChange",
            element: element,
            name: name,
        });
    }

    function sendAddRow() {
        vscode.postMessage({
            type: "updateResources",
            data: resourceRows,
        });
    }

    function sendAddCulture() {
        vscode.postMessage({
            type: "updateResources",
            data: resourceRows,
        });
    }

    //#endregion

    window.addEventListener("message", (event) => {

        const type = event.data.type;
        const data = event.data.data;

        if (type === "init") {

            errorContainer = document.getElementById("errorMessagesContainer");
            resourceTable = document.getElementById("resourceTable");
            if (!resourceTable) {
                console.warn(`Something went horribly wrong, there is no table?`);
                return;
            }

            const fileNameHeader = document.getElementById("fileNameHeader");
            fileNameHeader.innerHTML = data.fileName;

            cultures = data.cultures;
            resourceRows = data.resourceRows;

            createTableHeaders();
            createTableRows();

            initButtons();
        }
    });
});