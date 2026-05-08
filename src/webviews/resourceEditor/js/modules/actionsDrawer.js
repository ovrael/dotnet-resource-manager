import { DialogBuilder } from './dialogBuilder.js';
import ResourceRow from './resourceRow.js';
import ResourceData from './resourceData.js';

export default class ActionsDrawer {

    // Dialog
    dialogContainer = document.getElementById("dialogContainer");

    dialogConfirmButton = document.getElementById(
        "dialogConfirmButton",
    );
    dialogCancelButton = document.getElementById(
        "dialogCancelButton",
    );

    // Actions
    addValueButton = document.getElementById("addValueButton");

    init(tableDrawer, tableData) {
        this.#initAddValueAction(tableDrawer, tableData);
    }

    #initAddValueAction(tableDrawer, tableData) {
        const parser = new DOMParser();


        addValueButton.onclick = (event) => {

            const dialogContent = DialogBuilder.createAddValueDialog(tableData.getCultures());

            this.dialogContainer.innerHTML = dialogContent;


            this.dialogConfirmButton = document.getElementById(
                "dialogConfirmButton",
            );
            this.dialogCancelButton = document.getElementById(
                "dialogCancelButton",
            );

            const dialogInput = this.dialogContainer.querySelector("#valueNameInput");

            this.dialogCancelButton.onclick = (event) => {
                this.dialogContainer.hidden = true;
                this.dialogConfirmButton.onclick = null;
                dialogInput.oninput = null;
                this.dialogContainer.replaceChildren([]);
            };

            dialogInput.oninput = (event) => {
                const name = dialogInput.value.trim();
                if (name.length === 0) {
                    this.dialogContainer.classList.remove("good-input");
                    this.dialogContainer.classList.add("bad-input");
                    this.dialogConfirmButton.disabled = true;
                    return;
                }

                const existingRow = tableData.findResourceByName(name);
                if (existingRow === undefined) {
                    this.dialogContainer.classList.remove("bad-input");
                    this.dialogContainer.classList.add("good-input");
                    this.dialogConfirmButton.disabled = false;
                } else {
                    this.dialogContainer.classList.remove("good-input");
                    this.dialogContainer.classList.add("bad-input");
                    this.dialogConfirmButton.disabled = true;
                }
            };

            this.dialogConfirmButton.onclick = (event) => {
                const name = dialogInput.value.trim();
                if (name.length === 0) {
                    dialogInput.placeholder = `Value name with length greater than 0 ;)`;
                    return;
                }

                const commentInput = this.dialogContainer.querySelector("#commentInput");

                const newRow = new ResourceRow();
                newRow.name = name;
                newRow.data = [];
                newRow.comment = commentInput.value.trim();

                for (const culture of tableData.getCultures()) {
                    const cultureFixed = culture ? culture : "default";
                    const cultureInput = this.dialogContainer.querySelector(`#valueInput_${cultureFixed}`);
                    const newData = new ResourceData();
                    newData.language = culture;
                    newData.value = cultureInput.value.trim();
                    newRow.data.push(newData);
                }

                tableDrawer.addNewRow(newRow, tableData);

                this.dialogContainer.hidden = true;
                this.dialogConfirmButton.onclick = null;
                dialogInput.oninput = null;
            };

            this.dialogContainer.hidden = false;
        };
    }
}