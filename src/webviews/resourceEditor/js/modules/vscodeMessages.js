class Message {
    /** @type {string} */type = "";
    /** @type {Object} */data = {};
}

class VSCode {
    postMessage(/** @type {Message} */ message) { };
}

export default class VSCodeMessages {

    /** @type {VSCode} */
    #vscodeApi;

    constructor(vscodeApi) {
        this.#vscodeApi = vscodeApi;
    }

    textareaChange( /** @type {HTMLTextAreaElement} */textarea) {
        this.#vscodeApi.postMessage({
            type: "textareaChange",
            data: {
                name: textarea.dataset.name,
                prevname: textarea.dataset.prevname,
                type: textarea.dataset.type,
                culture: textarea.dataset.culture,
                value: textarea.value,
            }
        });
    }

}