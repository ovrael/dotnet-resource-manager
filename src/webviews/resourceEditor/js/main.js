import ResourceRow from './modules/resourceRow.js';
import ResourceData from './modules/resourceData.js';
import VSCodeMessages from './modules/vscodeMessages.js';
import TableDrawer from './modules/tableDrawer.js';
import TableData from './modules/tableData.js';
import ActionsDrawer from './modules/actionsDrawer.js';

document.addEventListener("DOMContentLoaded", () => {

    console.log("--------------------------------- START JAVASCRIPT");

    const vscode = acquireVsCodeApi();
    const vscodeMessages = new VSCodeMessages(vscode);
    const tableDrawer = new TableDrawer("resourceTable", vscodeMessages);
    const tableData = new TableData([], []);
    const actionsDrawer = new ActionsDrawer();

    /** @type {HTMLDivElement} */
    let errorContainer = undefined;

    // function initButtons() {
    //     const askDialog = document.getElementById("ask-dialog");

    //     const dialogConfirmButton = document.getElementById(
    //         "askDialogConfirmButton",
    //     );

    //     const dialogCancelButton = document.getElementById(
    //         "askDialogCancelButton",
    //     );
    //     const dialogInput = document.getElementById("askDialogInput");

    //     dialogCancelButton.onclick = (event) => {
    //         askDialog.hidden = true;
    //         dialogConfirmButton.onclick = null;
    //         dialogInput.oninput = null;
    //     };

    //     const addValueButton = document.getElementById("addValueButton");
    //     addValueButton.onclick = (event) => {
    //         const dialogTitle = document.getElementById("askDialogTitle");
    //         const dialogText = document.getElementById("askDialogText");
    //         const dialogInputContainer = document.getElementById(
    //             "askDialogInputContainer",
    //         );

    //         dialogTitle.innerText = "Add new resource value";
    //         dialogText.innerText = "Enter name for new resource value:";
    //         dialogInputContainer.hidden = false;
    //         dialogInput.value = ``;
    //         dialogInput.placeholder = `Value name`;

    //         dialogInput.oninput = (event) => {
    //             const name = dialogInput.value.trim();
    //             if (name.length === 0) {
    //                 askDialog.classList.remove("good-input");
    //                 askDialog.classList.add("bad-input");
    //                 dialogConfirmButton.disabled = true;
    //                 return;
    //             }

    //             const existingRow = tableData.resourceByName(name);
    //             if (existingRow === undefined) {
    //                 askDialog.classList.remove("bad-input");
    //                 askDialog.classList.add("good-input");
    //                 dialogConfirmButton.disabled = false;
    //             } else {
    //                 askDialog.classList.remove("good-input");
    //                 askDialog.classList.add("bad-input");
    //                 dialogConfirmButton.disabled = true;
    //             }
    //         };

    //         dialogConfirmButton.onclick = (event) => {
    //             const name = dialogInput.value.trim();

    //             const newRow = new ResourceRow();
    //             newRow.name = name;
    //             newRow.data = [];
    //             newRow.comment = "";

    //             for (const culture of cultures) {
    //                 const newData = new ResourceData();
    //                 newData.language = culture;
    //                 newData.value = "";

    //                 newRow.data.push(newData);
    //             }

    //             tableData.addResource(newRow);

    //             const rowElement = createRowElement(newRow);
    //             resourceTable.appendChild(rowElement);

    //             askDialog.hidden = true;
    //             dialogConfirmButton.onclick = null;
    //             dialogInput.oninput = null;
    //         };

    //         askDialog.hidden = false;
    //     };
    // }

    window.addEventListener("message", (event) => {

        const type = event.data.type;
        const data = event.data.data;

        if (type === "init") {

            errorContainer = document.getElementById("errorMessagesContainer");

            const fileNameHeader = document.getElementById("fileNameHeader");
            fileNameHeader.innerHTML = data.fileName;

            tableData.fill(data.resourceRows, data.cultures.sort());

            tableDrawer.createTableHeaders(tableData);
            tableDrawer.createTableRows(tableData);


            actionsDrawer.init();
            // initButtons();
        }
    });
});