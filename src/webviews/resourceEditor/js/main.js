import ResourceRow from './modules/resourceRow.js';
import ResourceData from './modules/resourceData.js';
import VSCodeMessages from './modules/vscodeMessages.js';
import TableDrawer from './modules/tableDrawer.js';
import TableData from './modules/tableData.js';
import ActionsDrawer from './modules/actionsDrawer.js';

document.addEventListener("DOMContentLoaded", () => {

    function updateTableData() {

    }

    console.log("--------------------------------- START JAVASCRIPT");

    const vscode = acquireVsCodeApi();
    const vscodeMessages = new VSCodeMessages(vscode);
    const tableDrawer = new TableDrawer("resourceTable", vscodeMessages);
    const tableData = new TableData([], []);
    const actionsDrawer = new ActionsDrawer();

    window.addEventListener("message", (event) => {

        const type = event.data.type;
        const data = event.data.data;

        if (type === "init") {

            const fileNameHeader = document.getElementById("fileNameHeader");
            fileNameHeader.innerHTML = data.fileName;

            tableData.fill(data.resourceRows, data.cultures.sort());

            tableDrawer.createTableHeaders(tableData);
            tableDrawer.createTableRows(tableData);


            actionsDrawer.init(tableDrawer, tableData);
            // initButtons();
        }
    });
});