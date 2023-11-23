/**
 * This class creates a popup in the form of a page
 */
class AppScreen {

    /**
     * All basic settings and popup creation are executed in this function
     *
     * @param config Input value for initial settings
     */
    constructor(config = {}) {

        let _default = {
            id: '',
            class: '',
            showAppBar: true,
            showFooter: false,
            appBarTitle: '',
            appBarLeadingBtnIconClass: '',
            appBarLeadingBtnCallback: function () { },
            appBarActionBtnIconClass: '',
            appBarActionBtnCallback: function () { },
            appBarActionLinkText: '',
            appBarActionLinkCallback: function () { },
            beforeGenerate: function () { },
            afterGenerate: function () { },
            beforeDistory: function () { },
            afterDistory: function () { }
        };

        config = { ..._default, ...config };
        let self = this;

        this.frame = $('<div class="app-screen"></div>');
        this.frame.addClass(config.class);
        this.frame.attr('id', config.id);
        this.content = $('<div class="app-screen-content"></div>');
        this.innerContent = $('<div class="app-screen-inner-content"></div>');
        this.beforeGenerate = config.beforeGenerate;
        this.afterGenerate = config.afterGenerate;
        this.beforeDistory = config.beforeDistory;
        this.afterDistory = config.afterDistory;

        // appbar title
        if (config.showAppBar) {
            this.appbar = $('<div class="app-bar"></div>');
            this.appbarContainer = $('<div class="app-bar-container"></div>');
            this.appbarLeading = $('<div class="leading"></div>');
            this.appbarTitle = $('<div class="app-bar-title"></div>');
            this.appbarActions = $('<div class="actions"></div>');

            this.appbarTitleText = $(`<span>${config.appBarTitle}</span>`);
            this.appbarLeadingBtn = $(`<button type="button" class="btn btn-icon"><i class="${config.appBarLeadingBtnIconClass}"></i></button>`);
            this.appbarLeadingBtn.on('click', function () { config.appBarLeadingBtnCallback(self); });
            this.appbarActionBtn = $(`<button type="button" class="btn btn-icon"><i class="${config.appBarActionBtnIconClass}"></i></button>`);
            this.appbarActionBtn.on('click', function () { config.appBarActionBtnCallback(self); });
            this.appbarActionLink = $(`<a href="#">${config.appBarActionLinkText}</a>`);
            this.appbarActionLink.on('click', function () { config.appBarActionLinkCallback(self); return false; });

            this.appbarTitle.append(this.appbarTitleText);
            this.appbarLeading.append(this.appbarLeadingBtn);
            this.appbarActions.append([this.appbarActionBtn, this.appbarActionLink]);
            this.appbarContainer.append([this.appbarLeading, this.appbarTitle, this.appbarActions]);
            this.appbar.append(this.appbarContainer);
        }

        // footer
        if (config.showFooter) {
            this.footer = $('<div class="app-screen-footer"></div>');
        }

        // generate modal screen
        this.generate();

    }

    /**
     * generate element and append to body
     */
    generate() {

        let frame = this.frame;

        // run scripts before generate app screen
        this.beforeGenerate(this);

        this.content.append([this.innerContent, this.footer]);
        frame.append([this.appbar, this.content]);
        $('body').append(this.frame);
        setTimeout(function () { frame.addClass('visible'); }, 1);

        // run scripts after generate app screen
        this.afterGenerate(this);

    }

    /**
     * Destroying the popup is done with this function
     */
    distory() {

        let frame = this.frame;

        // run scripts before distory app screen
        this.beforeDistory(this);

        this.frame.removeClass('visible');
        setTimeout(function () { frame.remove(); }, 160);

        // run scripts after distory app screen
        this.afterDistory(this);

    }

}