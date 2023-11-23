/**
 * The popup class is used to create a popup on the screen
 */
class PopupJS {

    /**
     * All basic settings and popup creation are executed in this function
     *
     * @param config Input value for initial settings
     */
    constructor(config = {}) {

        let self = this;
        let options = Object.assign({
            class: '',
            onBeforeGenerate: function () { },
            onAfterGenerate: function () { },
            onBeforeDistory: function () { },
            onAfterDistory: function () { },
        }, config);

        this.options = options;
        this.frame = $('<div class="popup-js ' + options.class + '"></div>');
        this.overlay = $('<div class="popup-overlay"></div>');
        this.content = $('<div class="popup-content"></div>');
        this.overlay.on('click', function () { self.distory(); });
        this.frame.append([this.overlay, this.content]);

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
        bodyOverflowController(true);

        setTimeout(function () { self.frame.addClass('visible') }, 3);
        setTimeout(function () { self.frame.find('button')[0].focus(); }, 60);

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
        setTimeout(function () {
            self.frame.remove();
            bodyOverflowController();
        }, 160);

        // run script after distory
        this.options.onAfterDistory(this);

    }

}