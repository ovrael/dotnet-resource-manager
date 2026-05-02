export default class ActionsDrawer {

    // Dialog
    dialogContainer = document.getElementById("dialogContainer");

    dialogConfirmButton = document.getElementById(
        "askDialogConfirmButton",
    );
    dialogCancelButton = document.getElementById(
        "askDialogCancelButton",
    );

    // Actions
    addValueButton = document.getElementById("addValueButton");

    init() {
        this.#initAddValueAction();
    }

    #initAddValueAction() {

        this.dialogContainer.innerHTML = `
        <div id="askDialogTitle" class="ask-dialog-title">
        Ask user for something
        </div>
        <div id="askDialogContent" class="ask-dialog-content">
            <div id="askDialogText" class="ask-dialog-text"></div>
            <div id="askDialogInputContainer" hidden>
            <input
                id="askDialogInput"
                type="text"
                style="width: 100%; box-sizing: border-box"
            />
            </div>
        </div>
        <div id="askDialogActions" class="ask-dialog-actions">
            <button
            id="askDialogCancelButton"
            class="ask-dialog-action-button cancel-button"
            >
            Cancel
            </button>
            <button
            id="askDialogConfirmButton"
            class="ask-dialog-action-button confirm-button"
            >
            OK
            </button>
        </div>
      `;


        const dialogInput = document.getElementById("askDialogInput");


        addValueButton.onclick = (event) => {

            this.dialogCancelButton.onclick = (event) => {
                this.dialogContainer.hidden = true;
                this.dialogConfirmButton.onclick = null;
                dialogInput.oninput = null;
            };

            const dialogTitle = document.getElementById("askDialogTitle");
            const dialogText = document.getElementById("askDialogText");
            const dialogInputContainer = document.getElementById(
                "askDialogInputContainer",
            );

            dialogTitle.innerText = "Add new resource value";
            dialogText.innerText = "Enter name for new resource value:";
            dialogInputContainer.hidden = false;
            dialogInput.value = ``;
            dialogInput.placeholder = `Value name`;

            dialogInput.oninput = (event) => {
                const name = dialogInput.value.trim();
                if (name.length === 0) {
                    this.dialogContainer.classList.remove("good-input");
                    this.dialogContainer.classList.add("bad-input");
                    this.dialogConfirmButton.disabled = true;
                    return;
                }

                const existingRow = tableData.resourceByName(name);
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

                tableData.addResource(newRow);

                const rowElement = createRowElement(newRow);
                resourceTable.appendChild(rowElement);

                this.dialogContainer.hidden = true;
                this.dialogConfirmButton.onclick = null;
                dialogInput.oninput = null;
            };

            this.dialogContainer.hidden = false;
        };
    }
}