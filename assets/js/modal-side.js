/**
 * ModalSide class is used to create modal from the side
 */
class ModalSide {

    /**
     * All basic settings and ModalSide creation are executed in this function
     *
     * @param config Input value for initial settings
     */
    constructor(config = {}) {

        let self = this;
        let options = Object.assign({
            class: '',
            appbar: true,
            actions: false,
            appbarTitle: '',
            onClose: function () { },
            onBeforeGenerate: function () { },
            onAfterGenerate: function () { },
            onBeforeDistory: function () { },
            onAfterDistory: function () { },
        }, config);

        this.options = options;
        this.frame = $('<div class="modal-side ' + options.class + '"></div>');
        this.overlay = $('<div class="modal-overlay"></div>');
        this.content = $('<div class="modal-content"></div>');
        this.innerContent = $('<div class="modal-inner-content"></div>');
        this.actions = $('<div class="modal-actions"></div>');
        this.overlay.on('click', function () { self.distory(); });
        this.frame.append([this.overlay, this.content]);
        this.content.append(this.innerContent);

        // appbar
        if (options.appbar) {

            let appbar = $(
                `<div class="app-bar">
                    <div class="app-bar-container">
                        <div class="app-bar-title">${options.appbarTitle}</div>
                        <div class="actions">
                            <button class="btn btn-icon close-modal" aria-label="Close">
                                <i class="icon-close"></i>
                            </button>
                        </div>
                    </div>
                </div>`
            );

            appbar.find('.actions .close-modal').on('click', function () {
                self.options.onClose(self);
            })

            this.content.prepend(appbar);

        }

        // actions
        if (options.actions) {
            this.content.append(this.actions);
        }

        // generate
        this.generate();

    }

    /**
     * generate element and append to body
     */
    generate() {

        let self = this;

        // run script before generate
        this.options.onBeforeGenerate(this);

        $('body').append(this.frame);
        setTimeout(function () { self.frame.addClass('visible') }, 1);

        // run script after generate
        this.options.onAfterGenerate(this);

    }

    /**
     * Destroying the popup is done with this function
     */
    distory() {

        let self = this;

        // run script before distory
        this.options.onBeforeDistory(this);

        this.frame.removeClass('visible');
        setTimeout(function () { self.frame.remove() }, 160);

        // run script after distory
        this.options.onAfterDistory(this);

    }

}