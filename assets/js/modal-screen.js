/**
 * The ModalScreen class is used to create the modal
 */
class ModalScreen {

    /**
     * All basic settings and ModalScreen creation are executed in this function
     *
     * @param config Input value for initial settings
     */
    constructor(config = {}) {

        let _default = {
            id: '',
            class: '',
            title: '',
            layout: '1',
            showHeader: true,
            showFooter: false,
            closeBtnIconClass: 'icon-close',
            closeBtnCallback: function () { },
            beforeGenerate: function () { },
            afterGenerate: function () { },
            beforeDistory: function () { },
            afterDistory: function () { }
        };

        config = { ..._default, ...config };
        let self = this;

        this.frame = $(`<div class="modal-screen layout-${config.layout}"></div>`);
        this.frame.addClass(config.class);
        this.frame.attr('id', config.id);
        this.overlay = $('<div class="overlay"></div>');
        this.content = $('<div class="modal-screen-content"></div>');
        this.innerContent = $('<div class="modal-screen-inner-content"></div>');
        this.beforeGenerate = config.beforeGenerate;
        this.afterGenerate = config.afterGenerate;
        this.beforeDistory = config.beforeDistory;
        this.afterDistory = config.afterDistory;

        this.overlay.on('click', function () { self.distory(); });

        // header
        if (config.showHeader) {
            this.header = $('<div class="modal-screen-header"></div>');
            this.headerTitle = $(`<div class="title">${config.title}</div>`);
            this.headerClose = $(`<button type="button" class="btn btn-icon"><i class="${config.closeBtnIconClass}"></i></button>`);

            this.headerClose.on('click', function () { config.closeBtnCallback(self); });
            this.header.append([this.headerTitle, this.headerClose]);
        }

        // footer
        if (config.showFooter) {
            this.footer = $('<div class="modal-screen-footer"></div>');
        }

        // generate modal screen
        this.generate();

    }

    /**
     * generate element and append to body
     */
    generate() {

        let frame = this.frame;

        // run scripts before generate modal screen
        this.beforeGenerate(this);

        this.content.append([this.header, this.innerContent, this.footer]);
        frame.append([this.content, this.overlay]);
        $('body').append(this.frame);
        bodyOverflowController(true);
        setTimeout(function () { frame.addClass('visible'); }, 1);

        // run scripts after distory modal screen
        this.afterGenerate(this);

    }

    /**
     * Destroying the popup is done with this function
     */
    distory() {

        let frame = this.frame;

        // run scripts before distory modal screen
        this.beforeDistory(this);

        this.frame.removeClass('visible');
        setTimeout(function () {
            frame.remove();
            bodyOverflowController();
        }, 160);

        // run scripts after distory modal screen
        this.afterDistory(this);

    }

}