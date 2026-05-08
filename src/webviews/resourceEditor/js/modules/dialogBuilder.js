export class DialogBuilder {

    static dialogTemplate = `
    <div id="dialogTitle" class="dialog-title">
        [DIALOG_TITLE]
        </div>
        <div id="dialogContent" class="dialog-content">
            [DIALOG_CONTENT]
        </div>
        <div id="dialogActions" class="dialog-actions">
            <button
            id="dialogCancelButton"
            class="dialog-action-button cancel-button"
            >
            Cancel
            </button>
            <button
            id="dialogConfirmButton"
            class="dialog-action-button confirm-button"
            >
            OK
            </button>
        </div>
        `;

    static createAddValueDialog(cultures) {

        const title = "Add new resource value";

        let content = `
        <div>
            <div id="dialogText" class="dialog-text"> Resource name: </div>
            <input
                id="valueNameInput"
                type="text"
                style="width: 100%; box-sizing: border-box"
                placeholder="Value name"
            />
        </div>
        <div id="dialogText" class="dialog-text"> Cultures: </div>
        `;

        for (let i = 0; i < cultures.length; i++) {
            const culture = cultures[i] ? cultures[i] : "default";

            content += `
            <div>
                <span class="dialog-text"> ${culture}:  </span>
                <input
                    id="valueInput_${culture}"
                    type="text"
                    style="width: 100%; box-sizing: border-box"
                    placeholder="Value for culture ${culture}"
                    data-culture="${culture}"
                />
            </div>
            `;
        }

        content += `
        <div>
            <div class="dialog-text"> Comment: </div>
            <input
                id="commentInput"
                type="text"
                style="width: 100%; box-sizing: border-box"
                placeholder="Comment for value"
            />
        </div>
        `;

        let dialogText = `${this.dialogTemplate}`;

        dialogText = dialogText.replace("[DIALOG_TITLE]", title);
        dialogText = dialogText.replace("[DIALOG_CONTENT]", content);

        return dialogText;
    }

    static createAddCultureDialog(/**@type {string[]}*/cultures) {

        const title = "Add new resource culture";

        let content = `
        <div>
            <div id="dialogText" class="dialog-text"> Culture: </div>
            <input
                id="cultureInput"
                type="text"
                style="width: 100%; box-sizing: border-box"
                placeholder="Culture name"
            />
        </div>
        <div id="dialogText" class="dialog-text"> Already existing cultures: ${cultures.map(f => !f ? "default" : f).join(",")} </div>
        `;

        let dialogText = `${this.dialogTemplate}`;

        dialogText = dialogText.replace("[DIALOG_TITLE]", title);
        dialogText = dialogText.replace("[DIALOG_CONTENT]", content);

        return dialogText;
    }




}