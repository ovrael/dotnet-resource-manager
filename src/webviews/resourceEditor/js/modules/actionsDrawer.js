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

    // Buttons
    addValueButton = document.getElementById("addValueButton");
    addCultureButton = document.getElementById("addCultureButton");

    init(tableDrawer, tableData) {
        this.#initAddValueAction(tableDrawer, tableData);
        this.#initAddCultureAction(tableDrawer, tableData);
    }

    #initAddValueAction(tableDrawer, tableData) {
        this.addValueButton.onclick = (event) => {

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
                this.#hideDialog();
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

                this.#hideDialog();

            };

            this.dialogContainer.hidden = false;
        };
    }

    #initAddCultureAction(tableDrawer, tableData) {
        this.addCultureButton.onclick = (event) => {

            const dialogContent = DialogBuilder.createAddCultureDialog(tableData.getCultures());

            this.dialogContainer.innerHTML = dialogContent;


            this.dialogConfirmButton = document.getElementById(
                "dialogConfirmButton",
            );
            this.dialogCancelButton = document.getElementById(
                "dialogCancelButton",
            );

            const cultureInput = this.dialogContainer.querySelector("#cultureInput");

            this.dialogCancelButton.onclick = (event) => {
                this.#hideDialog();
            };

            cultureInput.oninput = (event) => {
                const culture = cultureInput.value.trim();
                if (culture.length === 0) {
                    this.dialogContainer.classList.remove("good-input");
                    this.dialogContainer.classList.add("bad-input");
                    this.dialogConfirmButton.disabled = true;
                    return;
                }

                const existingCulture = tableData.getCulture(culture);
                if (existingCulture === undefined) {
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
                const culture = cultureInput.value.trim();
                if (culture.length === 0) {
                    cultureInput.placeholder = `Culture name length should be greater than 0 ;)`;
                    return;
                }

                tableDrawer.addNewCulture(culture, tableData);

                this.#hideDialog();
            };

            this.dialogContainer.hidden = false;
        };
    }

    #hideDialog() {
        this.dialogConfirmButton.onclick = null;
        this.dialogCancelButton.onclick = null;
        this.dialogContainer.replaceChildren([]);
        this.dialogContainer.hidden = true;
    }
}