// This class is used to select a file and returns data with a standard structure.
// One of the tasks of this class is to do various things on the file, for example cropping the photo.
// Note that this class is defined when the file value is given to it in the default values, it will no longer open the file selection window.
class FileSelector {

    // Set initial values
    constructor(options = {}) {

        // set default options
        this.options = Object.assign({
            files: null,
            ratio: ['3/4'],
            limitSize: 10,
            multiple: false,
            wizard: false,
            tags: false,
            title: false,
            description: false,
            upload: false,
            uploadUrl: null,
            data: {},
            accept: ['*'],
            onUpload: function (response, file, data) {
            },
            onDone: function (file, data) {
            },
            // set default options
        }, options);

        this.input = $(`<input type="file" accept="${this.options.accept.join(', ')}" ${this.options.multiple ? 'multiple' : ''}>`);
        this.file = null;
        this.url = null;
        this.format = null;
        this.base64 = null;
        this.uploading = false;
        this.view = null;

        // init function
        this.initial();

    }

    // The difference between initial and constructor is in their tasks. constructor is for initialization and initial
    // is to use methods and work with the class.
    // Separating these 2 items is for better understanding of the code.
    initial() {

        const self = this;

        // This command is executed when a file has not been introduced to the class and there is a need to
        // select a file from the system
        if (this.options.files === null) {
            this.input.trigger('click');
            this.input.on('change', function (e) {

                // check format
                if(self.options.accept[0] !== '*'){
                    const format = this.files[0].name.match(/\.([a-zA-Z0-9]+)$/);
                    if(!self.options.accept.includes(format[0])){
                        self.alertPopUp('danger', `The file format is not valid`);
                        return;
                    }
                }

                // check file size
                if (this.files[0].size > (self.options.limitSize  * 1024 * 1024)) {
                    self.alertPopUp('danger', `The maximum allowed size is ${self.options.limitSize}MB`);
                    return;
                }

                self.file = this.files[0];
                self.url = URL.createObjectURL(self.file);
                self.format = self.getFormatFile(self.file.name);
                self.viewElement();
            });
            return;
        }

        // check format
        if(self.options.accept[0] !== '*'){
            const format = this.options.files[0].name.match(/\.([a-zA-Z0-9]+)$/);
            if(!self.options.accept.includes(format[0])){
                self.alertPopUp('danger', `The file format is not valid`);
                return;
            }
        }

        // check file size
        if (this.options.files[0].size > (self.options.limitSize  * 1024 * 1024)) {
            self.alertPopUp('danger', `The maximum allowed size is ${self.options.limitSize}MB`);
            return;
        }

        // These commands are executed when a file has been introduced to the class and there is no need to
        // select the file from the operating system
        this.file = this.options.files[0];
        self.url = URL.createObjectURL(self.file);
        self.format = self.getFormatFile(self.file.name);
        self.viewElement();

    }

    // This method is used to destroy the main frame and free the memory
    // Note that this method will not work if a file is being uploaded
    destroy() {

        // Checking the status of uploading and creation of view
        if (this.uploading || this.view === null) return;

        this.view.find('.audio-card').trigger('destroy');
        URL.revokeObjectURL(this.url);
        this.view.remove();
        bodyOverflowController();

    }

    // This method create main view element (main popup)
    viewElement() {
        const self = this;
        const element = $('<div class="file-selector"><div class="overlay"></div><div class="selector-frame"></div></div>');
        const header = $(`<div class="frame-header">Preview</div>`);
        const content = $('<div class="frame-content"></div>');
        const footer = $('<div class="frame-footer"></div>');
        const buttonCancel = $('<button type="button" class="btn cancel">Cancel</button>');
        const buttonBack = $('<button type="button" class="btn back">Back</button>');
        const buttonNext = $('<button type="button" class="btn btn-primary next">Next</button>');
        const buttonUpload = $('<button type="button" class="btn btn-primary upload">Upload</button>');
        const buttonDone = $('<button type="button" class="btn btn-primary done">Done</button>');

        // create frame preview
        if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(this.format)) content.append(this.cropElement());
        else if (['mp4', 'webm'].includes(this.format)) content.append(this.videoElement());
        else if (['mp3'].includes(this.format)) content.append(this.audioElement());
        else content.append(this.fileElement());

        // create frame wizard
        if (this.options.wizard) content.append(this.wizardElement());

        // Add buttons to the footer with different conditions
        footer.append(buttonCancel);
        if (this.options.wizard) {
            footer.append([buttonBack, buttonNext]);
            buttonBack.hide();
            buttonUpload.hide();
            buttonDone.hide();
        }
        if (this.options.upload) footer.append(buttonUpload);
        else footer.append(buttonDone);

        // add event on overlay and cancel for remove element
        element.on('click', '.overlay, .frame-footer .cancel', function () {
            self.destroy();
        })

        // add event on button next and control visibility buttons
        buttonNext.on('click', function () {
            content.find('.frame-wizard').show();
            content.find('.frame-preview').hide();
            header.html('Information');
            buttonCancel.hide();
            buttonNext.hide();
            buttonUpload.show();
            buttonDone.show();
            buttonBack.show();
        })

        // add event on button back and control visibility buttons
        buttonBack.on('click', function () {
            content.find('.frame-wizard').hide();
            content.find('.frame-preview').show();
            header.html('Preview');
            buttonUpload.hide();
            buttonDone.hide();
            buttonBack.hide();
            buttonCancel.show();
            buttonNext.show();
        })

        const onClickFinal = function (e) {

            // check value input title
            if (self.view.find('.selector-frame input[name="title"]').length > 0) {
                if (self.view.find('.selector-frame input[name="title"]').val().trim() === '') {
                    self.alertPopUp('danger', 'The title cannot be empty');
                    return;
                }
            }

            // click on done
            if ($(this).hasClass('done')) {
                self.options.onDone(self.base64 !== null ? self.dataURItoBlob(self.base64) : self.file, self.getWizardFormData());
                self.destroy();
                return;
            }

            // upload to server
            // FormData is used to send values to the server. Its values may vary based on the type and conditions.
            let formData = new FormData();
            formData.append('file', self.base64 !== null ? self.dataURItoBlob(self.base64) : self.file);
            formData.append('data', self.getWizardFormData());

            self.uploading = true;
            buttonUpload.blur();
            buttonDone.blur();
            element.find('.selector-frame').append('<div class="frame-loading"><div class="loader-mini"></div>' +
                '<div class="progress-bar"><div class="progress-percent"><span>0</span>%</div><div class="progress-track"><div class="progress-track-processed"></div></div></div> ' +
                '</div>');

            $.ajax({
                url: self.options.uploadUrl,
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener("progress", function (e) {
                            if (e.lengthComputable) {
                                var percent = (e.loaded / e.total) * 100;
                                element.find('.frame-loading .progress-percent span').html(percent.toFixed(0));
                                element.find('.frame-loading .progress-track-processed').width(percent+"%");
                            }
                        }, false);
                    }
                    return xhr;
                },
                success: function (data) {
                    self.uploading = false;
                    self.options.onUpload(data, self.base64 !== null ? self.dataURItoBlob(self.base64) : self.file, self.getWizardFormData())
                    element.find('.frame-loading').remove();
                    self.destroy();
                },
                error: function (error) {
                    self.uploading = false;
                    self.alertPopUp('danger', `There is a problem in sending information. Please check your internet connection and try again.`);
                    element.find('.frame-loading').remove();
                },
            });

        }
        buttonUpload.on('click', onClickFinal)
        buttonDone.on('click', onClickFinal)

        // append elements
        element.find('.selector-frame').append([header, content, footer]);
        $('body').append(element);
        bodyOverflowController(true);
        this.view = element;
        initAudioCard();
    }

    // This method creates preview and crop image. Crop related events are in this method.
    // With each update, the crop data is updated in the base64 variable
    cropElement() {

        let self = this;
        const framePreview = $(
            `<div class="frame-preview">
                <div class="crop-wrapper"><img src="${this.url}" style="max-height:200px;"></div><div class="ratio-wrapper"></div>
                <div class="crop-zoom-level"><div class="crop-zoom-label">Zoom</div><div class="crop-zoom-progress"><input type="range" step="1" min="0" max="100" value="0"></div></div>
            </div>`
        );

        // crop image
        let image = framePreview.find('.crop-wrapper img');
        image.on('load', function () {

            image.cropper({
                movable: true,
                dragMode: 'move',
                zoomOnWheel: false,
                aspectRatio: self.options.ratio.length > 0 ? eval(self.options.ratio[0]) : [],
                minContainerWidth: framePreview.find('.crop-wrapper').width(),
                minContainerHeight: 360,
                viewMode: 2,
                cropend: function (event) {
                    self.base64 = image.cropper('getCroppedCanvas').toDataURL();
                },
                ready: function () {
                    self.base64 = image.cropper('getCroppedCanvas').toDataURL();
                }
            });

            // add event for change zoom
            framePreview.find('.crop-zoom-progress input').on('input', function () {
                image.cropper('zoomTo', parseFloat($(this).val()) / 10);
            });

            // check ratios
            if (self.options.ratio.length > 1) {
                const ratios = $(`<div class="crop-ratios"><div class="crop-ratios-label">Ratios:</div><div class="crop-ratios-items"></div></div>`);

                for (let i = 0; i < self.options.ratio.length; i++) {
                    let btnRatio = $(`<button type="button">${self.options.ratio[i].replace('/', 'x').toUpperCase()}</button>`);
                    ratios.find('.crop-ratios-items').append(btnRatio);
                    btnRatio.on('click', function () {
                        ratios.find('button').removeClass('active');
                        $(this).addClass('active');
                        if(self.options.ratio[i].toLowerCase() === 'free') image.cropper('setAspectRatio', []);
                        else image.cropper('setAspectRatio', eval(self.options.ratio[i]));
                        self.base64 = image.cropper('getCroppedCanvas').toDataURL();
                    });
                }

                // active default button
                ratios.find('button:nth-child(1)').addClass('active');
                framePreview.find('.ratio-wrapper').append(ratios)
            }
        });

        return framePreview;

    }

    // This method creates a preview of a video file
    videoElement() {
        return $(`<div class="frame-preview"><video autoplay loop controls><source src="${this.url}" type="video/mp4"></audio></div>`);
    }

    // This method creates a preview of a audio file
    audioElement() {
        return $(`<div class="frame-preview">
            <div class="audio-card" data-src="${this.url}">
                <div class="card-content">
                    <div class="card-title" itemprop="name">${this.file.name}</div>
                    <div class="card-time">
                        <meta itemprop="duration" content="T2M10S">
                        <span class="current-time">00:00</span> / <span>00:00</span>
                    </div>
                </div>
                <div class="card-controllers">
                    <button class="btn btn-icon play-btn" aria-label="Play Voice"><i class="icon-play"></i></button>
                    <button class="btn btn-icon pause-btn" aria-label="Pause Voice"><i class="icon-pause"></i></button>
                    <div class="slider-control">
                        <input type="range" min="0" max="100" value="0">
                        <div class="slider-track"><div class="slider-track-process"></div><div class="slider-track-buffer"></div></div>
                    </div>
                    <div class="card-volume">
                        <div class="card-volume-progress">
                            <input type="range" min="0" max="1" step="0.01" value="1">
                            <div class="slider-track"><div class="slider-track-process" style="width: 100%;"></div><div class="slider-track-buffer"></div></div>
                        </div>
                        <button class="btn btn-icon volume-mute-btn" aria-label="Pause Voice"><i class="icon-silence"></i></button>
                        <button class="btn btn-icon volume-on-btn" aria-label="Pause Voice"><i class="icon-audio"></i></button>
                    </div>
                </div>
                <div class="card-loading"><div class="loader-mini"></div></div>
            </div>
        </div>`);
    }

    // This method creates a preview of a file with a different format
    fileElement() {
        return $(`<div class="frame-preview"><div class="other-file"><i class="icon-document"></i><div class="file-name">${this.file.name}</div></div></div>`)
    }

    // This method creates the visor form
    wizardElement() {
        const element = $('<div class="frame-wizard" style="display: none;"></div>');

        if (this.options.title) element.append(this.wizardFieldTitle());
        if (this.options.description) element.append(this.wizardFieldDescription());
        if (this.options.tags) element.append(this.wizardFieldTags());

        return element;
    }

    // This method is used to create the title field. The event related to checking whether it is empty is
    // created in this method. (This field is required)
    wizardFieldTitle() {
        const element = $(`<label><span>Title:</span><input type="text" name="title" placeholder="Enter Title"></label>`);

        element.on('input change', 'input', function () {
            if ($(this).val().trim() === '') $(this).parents('label').addClass('error');
            else $(this).parents('label').removeClass('error');
        })

        return element;
    }

    // This method is used to create the description field.
    wizardFieldDescription() {
        return $(`<label><span>Description:</span><textarea name="description" placeholder="Enter Description" rows="3"></textarea></label>`)
    }

    // This function creates the add tag field with all its events and states
    wizardFieldTags() {
        const self = this;
        const element = $(`<div class="tags-wrapper">
            <div class="label">Tags:</div><div class="tags"></div>
            <div class="tags-form"><input type="text" placeholder="Enter Tag"><button type="button" class="btn btn-primary">Add Tag</button></div>
        </div>`);

        // tag index controller
        let i = 0;

        element.on('keydown', '.tags-form input', function (e) {
            if (e.keyCode === 13) element.find('.tags-form button').trigger('click');
        })

        element.on('click', '.tags-form button', function () {
            const _this = $(this);
            const input = element.find('.tags-form input');

            // check input is empty
            if (input.val().trim() === '') {
                self.alertPopUp('danger', `The tag value cannot be empty`);
                return;
            }

            // check before exist value
            if (_this.attr('data-for') === undefined) {
                let tagFind = false;
                element.find(`.tags input`).each(function () {
                    if ($(this).val().trim().toLowerCase() === input.val().trim().toLowerCase()) {
                        tagFind = $(this).val();
                        return;
                    }
                })
                if (tagFind !== false) {
                    self.alertPopUp('danger', `The tag cannot be duplicated`);
                    return;
                }
            }

            // check is edit mode
            if (_this.attr('data-for')) {
                const inputSelected = element.find(`[name="${_this.attr('data-for')}"]`);
                inputSelected.val(input.val().trim());
                inputSelected.parents('.item').find('span').html(input.val().trim());

                // reset
                input.val('');
                _this.removeAttr('data-for');
                _this.html('Add Tag');
                return;
            }

            // start add new element
            // create element
            const item = $(`<div class="item">
                <span>${input.val().trim()}</span><i class="icon-trash trash"></i><i class="icon-edit edit"></i>
                <input type="hidden" name="tags[${i++}]" value="${input.val().trim()}"/>
            </div>`);

            item.on('click', '.trash', function () {
                $(this).parents('.item').remove();

                if (element.find('.tags .item').length === 0) element.find('.tags').hide();
            })

            item.on('click', '.edit', function () {
                const itemSelected = $(this).parents('.item');

                input.val(itemSelected.find('input').val());
                _this.attr('data-for', itemSelected.find('input').attr('name'));
                _this.html('Save Tag');
            })

            input.val('').focus();
            element.find('.tags').append(item).css('display', 'flex');

        });

        return element;
    }

    // This method checks all the inputs in the wizard and returns their name and value as a key: value object.
    getWizardFormData() {
        const data = {};

        this.view.find('input, textarea').each(function () {
            if ($(this).attr('name') === undefined) return;
            data[$(this).attr('name')] = $(this).val();
        })

        return data;
    }

    // This method receives the file name and returns its format
    getFormatFile(filename) {
        const fileFormatMatch = filename.match(/\.([a-zA-Z0-9]+)$/);

        if (fileFormatMatch) return fileFormatMatch[1];
        else return null;
    }

    // We use alert popup to announce different situations to the user. It is usually used to display errors
    alertPopUp(status, title) {
        let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
        let popup = addAlertPopup({
            class: '',
            type: 'icon', // icon or avatar
            status: status, // success, danger, info or warning
            title: title,
            actionElements: [btnOk], // element object
            actionLayout: 'horizontal', // horizontal or vertical
        });

        btnOk.on('click', function () {
            popup.distory();
        });
    }

    // convert base64 to blob
    dataURItoBlob(dataURI) {
        const binary = atob(dataURI.split(',')[1]);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/png'});
    }

}