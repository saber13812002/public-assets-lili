class MediaLibrary {

    constructor(options = {}) {

        // options
        this.options = Object.assign({
            type: 'photo', // photo | video | audio
            accept: ['*'],
            saveUrl: null,
            fetchUrl: null,
            uploadUrl: null,
            deleteUrl: null,
            updateUrl: null,
            openOnLibrary: true,
            uploadWithUrl: false,
            useTitle: true,
            titleRequired: false,
            useTag: true,
            useDescription: true,
            multiple: false,
            limit: 10,
            limitSize: 10,
            cropRatio: 3 / 4,
            translate: {},
            data: {},
            onSave: function (data) {
            },
            onSaveError: function (error) {
            },
        }, options);

        this.translate = Object.assign({
            title: 'Media Library',
            library: 'Library',
            upload: 'Upload',
            uploading: 'Uploading...',
            saveWait: 'please wait...',
            selected: 'selected',
            save: 'Apply',
            cancel: 'Cancel',
            notFound: 'Not found item.',
            errorConnect: 'Can not connect to server.',
            uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> your file',
            uploadZoneDescription: 'Allowed format: PNG, JPG (Up to: 1 photo/10 Mb)',
            uploadZoneNoSelected: 'Please select an item',
            uploadZoneFieldTitle: 'Title',
            uploadZoneFieldTitlePlaceholder: 'Enter Title',
            uploadZoneFieldDesc: 'Description',
            uploadZoneFieldDescPlaceholder: 'Enter Description',
            uploadZoneFieldTags: 'Tags',
            uploadZoneFieldTagsPlaceholder: 'Enter Tags',
            uploadZoneFieldTagsAdd: 'Add Tag',
            uploadZoneFieldTagsSave: 'Save Tag',
            uploadZoneUploadButton: 'Upload',
            uploadZoneCancelButton: 'Cancel Upload',
            editFormTitle: 'Edit',
            editFormSaveButton: 'Save',
            editFormCancelButton: 'Cancel',
            editFormCropButton: 'Crop',
        }, this.options.translate);

        this.frame = this.frameElement();
        this.gridLibrary = this.gridLibraryElement();
        this.uploadZone = this.uploadZoneElement();
        this.loading = $('<div class="center-content"><div class="loader"></div></div>');
        this.tabLibrary = $(`<button type="button" class="tab ${this.options.openOnLibrary ? 'active' : ''}">${this.translate.library}</button>`);
        this.tabUpload = $(`<button type="button" class="tab ${this.options.openOnLibrary ? '' : 'active'}">${this.translate.upload}</button>`);
        this.saveButton = $(`<button type="button" class="btn btn-primary">${this.translate.save}</button>`);
        this.cancelButton = $(`<button type="button" class="btn">${this.translate.cancel}</button>`);
        this.itemSelected = [];
        this.items = [];
        this.uploading = false;
        this.fileUrl = null;

        // append element to view
        $('body').append(this.frame);
        bodyOverflowController(true);

        this.init();

    }

    // fetch init data from server and set global events
    init() {

        const self = this;

        // add loading for start fetch data
        this.frame.find('.content').append(this.loading);

        // fetch data from server
        $.ajax({
            url: this.options.fetchUrl,
            type: "GET",
            data: this.options.data,
            success: function (data) {
                self.items = data;
                self.loading.remove();
                self.frame.find('.header .actions').append([self.tabLibrary, self.tabUpload]);
                self.frame.find('.content').append([self.gridLibrary, self.uploadZone]);
                self.frame.find('.footer').append([self.cancelButton, self.saveButton]);
                self.generateItem();
            },
            error: function (error) {
                self.loading.remove();
                self.frame.find('.content').append(`<div class="center-content">${self.translate.errorConnect}</div>`);
                self.frame.find('.footer').append([self.cancelButton]);
            },
        });

        this.tabUpload.on('click', function () {
            self.uploadZone.show();
            self.gridLibrary.hide();
            self.tabUpload.addClass('active');
            self.tabLibrary.removeClass('active');

            if (self.uploading) {
                self.frame.find('.footer button').show();
                self.saveButton.hide();
                self.cancelButton.hide();
            }
        })

        this.tabLibrary.on('click', function () {
            self.uploadZone.hide();
            self.gridLibrary.show();
            self.tabLibrary.addClass('active');
            self.tabUpload.removeClass('active');

            if (self.uploading) {
                self.frame.find('.footer button').hide();
                self.saveButton.show();
                self.cancelButton.show();
            }
        })

        this.saveButton.on('click', function () {

            if (self.itemSelected.length === 0) {
                self.alertPopUp('danger', self.translate.uploadZoneNoSelected);
                return;
            }

            self.saveButton.addClass('disable');
            $(this).html(self.translate.saveWait);

            $.ajax({
                url: self.options.saveUrl,
                type: "POST",
                data: {
                    selected: self.itemSelected,
                    data: self.options.data,
                },
                success: function (data) {
                    self.saveButton.removeClass('disable').html(self.translate.save);
                    self.options.onSave(data);
                    self.dispose();
                },
                error: function (error) {
                    self.alertPopUp('danger', 'A problem occurred, please try again');
                    self.saveButton.removeClass('disable').html(self.translate.save);
                    self.options.onSaveError(error);
                },
            });

        })

        this.cancelButton.on('click', function () {
            self.dispose();
        })

    }

    // remove media library
    dispose() {
        $('.audio-card.play .pause-btn').trigger('click');

        this.frame.remove();
        bodyOverflowController();
    }

    // generate library item and upload zone item
    generateItem() {
        const self = this;

        if (this.items.length === 0) return;

        this.gridLibrary.html('');
        this.items.forEach(function (item) {

            let isSelected = false;

            // check selected item and add on selected variable
            if (self.itemSelected.length < self.options.limit) {
                if (self.options.multiple && item.selected) {
                    self.itemSelected.push(item.id);
                    isSelected = true;
                }
                else if (self.itemSelected.length === 0 && item.selected) {
                    self.itemSelected.push(item.id);
                    isSelected = true;
                }
            }

            const itemElement = $(`<div class="item ${isSelected ? 'selected' : ''}" data-id="${item.id}">
                <div class="item-content">
                    <div class="item-info">
                        <div class="title"></div><div class="tags"></div>
                        <div class="selected">${self.translate.selected}</div>
                    </div>
                    <div class="item-actions">
                        <button type="button" class="remove ignore"><i class="icon-trash-2"></i></button>
                        <button type="button" class="edit ignore"><i class="icon-edit"></i></button>
                    </div>
                </div>
            </div>`);

            // add item to gallery
            if (self.options.type === 'photo') itemElement.prepend(self.photoItem(item));
            else if (self.options.type === 'video') itemElement.prepend(self.videoItem(item));
            else if (self.options.type === 'audio') itemElement.prepend(self.audioItem(item));
            else itemElement.prepend(self.otherItems(item));

            // add info
            itemElement.find('.item-info .title').html(item.title);
            itemElement.find('.item-info .tags').html(item.tags.join(', '));

            itemElement.on('click', '*.ignore', function () {
                return false;
            })

            itemElement.on('click', 'button.remove', function () {
                let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                let btnCancel = $('<button type="button" class="btn btn-full">Cancel</button>');
                let popup = addAlertPopup({
                    class: '',
                    type: 'icon', // icon or avatar
                    status: 'warning', // success, danger, info or warning
                    title: 'Should the file be deleted?',
                    actionElements: [btnCancel, btnOk], // element object
                    actionLayout: 'horizontal', // horizontal or vertical
                });

                btnOk.on('click', function () {
                    btnOk.addClass('disable').html('Waiting...');
                    btnCancel.hide();

                    $.ajax({
                        url: self.options.deleteUrl,
                        type: "POST",
                        data: item,
                        success: function (data) {
                            let indexToRemove = self.itemSelected.indexOf(item.id);
                            self.itemSelected.splice(indexToRemove, 1);
                            $('.audio-card.play .pause-btn').trigger('click');
                            itemElement.remove();
                            popup.distory();
                        },
                        error: function (error) {
                            popup.distory();
                            self.alertPopUp('danger', 'The file could not be deleted. Check your internet connection and try again.');
                        },
                    });
                });

                btnCancel.on('click',function(){
                    popup.distory();
                })

            })

            itemElement.on('click', 'button.edit', function () {
                self.editElement(item);
            })

            itemElement.on('click', function () {

                // select and deselect
                if ($(this).hasClass('selected')) {

                    $(this).removeClass('selected');
                    let indexToRemove = self.itemSelected.indexOf($(this).data('id'));
                    self.itemSelected.splice(indexToRemove, 1);

                } else {

                    if (self.itemSelected.length >= self.options.limit) {
                        self.alertPopUp('danger', `You are allowed to choose ${self.options.limit} items.`);
                        return;
                    }

                    // multiple
                    if (self.options.multiple) {
                        $(this).addClass('selected');
                        self.itemSelected.push($(this).data('id'));
                    } else {
                        self.gridLibrary.find('.item').removeClass('selected');
                        $(this).addClass('selected');
                        self.itemSelected = [$(this).data('id')];
                    }

                }

            });

            self.gridLibrary.append(itemElement);

        });

        initAudioCard();
    }

    // get frame element (main body)
    frameElement() {
        const self = this;
        const element = $(`<div class="media-library">
            <div class="inner-wrapper">
                <div class="header">
                    <div class="title">${this.translate.title}</div>
                    <div class="actions"></div>
                </div>
                <div class="content type-${this.options.type}"></div>
                <div class="footer"></div>
            </div>
            <div class="overlay"></div>
        </div>`);

        // close frame
        element.on('click', '.overlay', function () {
            self.dispose();
        })

        return element;
    }

    // get grid library zone element
    gridLibraryElement() {
        return $(`<div class="grid-library" style="display: ${this.options.openOnLibrary ? 'grid' : 'none'}"></div>`);
    }

    // get upload zone element
    uploadZoneElement() {
        const self = this;
        const maxFileSize = parseInt(this.options.limitSize) * 1024 * 1024;
        const element = $(`<div class="upload-zone" style="display: ${this.options.openOnLibrary ? 'none' : 'flex'}">
            <div class="zone-content"></div>
            <div class="zone-info">
                <i class="icon-upload"></i>
                <div class="title">${this.translate.uploadZoneTitle}</div>
                <div class="description">${this.translate.uploadZoneDescription}</div>
            </div>
            
        </div>`);

        // check active url mode
        if(self.options.uploadWithUrl){
            element.append('<div class="url-file"><input type="text" placeholder="Enter the url of the file"><button type="button" class="btn btn-primary">Go</button></div>');
        }

        // start drag mode for upload dragged files
        // disabled open new tab with drop file and set class drag mode
        element.on('dragover', function (e) {
            e.preventDefault();
            element.addClass('draged');
        });

        // remove class drag mode
        element.on('dragleave dragend', function (e) {
            element.removeClass('draged');
        });

        // drop file on zone
        element.on('drop', function (e) {
            e.preventDefault();
            element.removeClass('draged');
            if(e.target.tagName.toLowerCase() !== 'div') return;

            uploadFile(e.originalEvent.dataTransfer.files);
        });

        // start choose file with click on zone
        // set file accept (format)
        const fileSelector = $(`<input type="file"/>`);
        if (self.options.type === 'photo') fileSelector.attr('accept', ['.png', '.jpg'].join(','));
        else if (self.options.type === 'video') fileSelector.attr('accept', ['.mp4'].join(','));
        else if (self.options.type === 'audio') fileSelector.attr('accept', ['.mp3'].join(','));
        else fileSelector.attr('accept', self.options.accept.join(','));

        // click on zone and open file explorer (select file for upload)
        element.on('click', function (e) {
            if (self.uploading) return;
            if(e.target.tagName.toLowerCase() !== 'div') return;
            fileSelector.val('');
            fileSelector.trigger('click');
        });

        element.on('click','.url-file button',function(){
            const val = element.find('.url-file input').val();

            // check url has empty
            if(val.trim() === '') {
                self.alertPopUp('danger', 'Please enter the url');
                return;
            }

            // check value is url
            if(!self.isValidURL(val)) {
                self.alertPopUp('danger', 'The url format is incorrect');
                return;
            }

            self.fileUrl = val;
            element.find('.url-file input').val('');
            self.zonePreview(null);
        })

        // control selected file for upload (change event on file input)
        fileSelector.on('change', function () {
            uploadFile(this.files);
        });

        // uploadFile is the main function.
        // In this function, it checks things like volume control, format and upload status.
        // It also uses the PhotoSelector class for the type of images.
        // Note that information is not sent in this function
        function uploadFile(files) {

            // If no file is selected, the processing stops
            if (files.length === 0) return;

            // check file is uploaded
            if (self.uploading) {
                self.alertPopUp('danger', `A file is being uploaded, please continue the process after uploading the file.`);
                return;
            }

            // check length files
            if (files.length > 1) {
                self.alertPopUp('danger', `Only one file can be uploaded. After uploading one file, you can upload other files.`);
                return;
            }

            // Checking the file format and file size
            for (let i = 0; i < files.length; i++) {

                // check file type
                if (self.options.type === 'photo') {
                    if (!(files[i].type === 'image/jpeg' || files[i].type === 'image/png')) {
                        self.alertPopUp('danger', `You are allowed to use jpg and png format`);
                        return;
                    }
                } else if (self.options.type === 'video') {
                    if (files[i].type !== 'video/mp4') {
                        self.alertPopUp('danger', `You are allowed to use mp4 format`);
                        return;
                    }
                } else if (self.options.type === 'audio') {
                    if (files[i].type !== 'audio/mpeg') {
                        self.alertPopUp('danger', `You are allowed to use mp3 format`);
                        return;
                    }
                } else{
                    const fileFormatMatch = files[i].name.match(/\.([a-zA-Z0-9]+)$/);
                    if(self.options.accept[0] !== '*') {
                        if (!self.options.accept.includes(fileFormatMatch[0])) {
                            self.alertPopUp('danger', `You are not authorized to use this format`);
                            return;
                        }
                    }
                }

                // check file size
                if (files[i].size > maxFileSize) {
                    self.alertPopUp('danger', `The maximum allowed size is ${self.options.limitSize}MB`);
                    return;
                }

            }

            // If the file type is an image, it is mandatory to cut it, and after cutting the image,
            // the file preview section is executed.
            if (self.options.type === 'photo') {
                let reader = new FileReader();
                let image = new PhotoSelector({
                    aspectRatio: self.options.cropRatio,
                    onDoneCrop: function (_class) {
                        self.zonePreview(_class.blob, files[0].name);
                    }
                });

                reader.readAsDataURL(files[0]);
                reader.onload = function (e) {
                    image.base64 = e.target.result;
                    image.crop();
                }

                return;
            }

            // If none of the conditions are executed, finally this code is executed to preview the file.
            self.zonePreview(files);

        }

        return element;
    }

    // In this function, it sends the formData value to the server and applies the result.
    zoneAjax(formData, editMode) {
        const self = this;

        self.uploadZone.find('.zone-content').css('overflow', 'hidden');
        self.uploadZone.find('.zone-content').append(`<div class="zone-loading"><div class="loader"></div><div class="progress-bar"><div class="progress-percent"><span>0</span>%</div><div class="progress-track"><div class="progress-track-processed"></div></div></div></div>`);
        self.frame.find('.footer button.btn-upload, .edit-form .footer button').addClass('disable');
        self.frame.find('.edit-form .edit-content').append(`<div class="edit-loading"><div class="loader"></div></div>`);
        self.uploadZone.find('.zone-content')[0].scrollTop = 0;

        if(formData.get('file') === 'false') self.frame.find('.edit-loading').append(`<span>${this.translate.saveWait}</span>`);
        else self.frame.find('.edit-loading').append(`<div class="progress-bar"><div class="progress-percent"><span>0</span>%</div><div class="progress-track"><div class="progress-track-processed"></div></div></div>`);

        $.ajax({
            url: editMode ? self.options.updateUrl : self.options.uploadUrl,
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
                            self.uploadZone.find('.zone-loading .progress-percent span, .edit-loading .progress-percent span').html(percent.toFixed(0));
                            self.uploadZone.find('.zone-loading .progress-track-processed, .edit-loading .progress-track-processed').width(percent+"%");
                        }
                    }, false);
                }
                return xhr;
            },
            success: function (data) {

                if(editMode){
                    self.items.forEach(function(item,index){
                        if(self.items[index].id == data.id){
                            self.items[index] = data;
                        }
                    })
                } else {
                    self.items = [data, ...self.items];
                }
                self.itemSelected = [];
                self.fileUrl = null;
                self.generateItem();

                self.uploadZone.hide();
                self.gridLibrary.show();
                self.tabLibrary.addClass('active');
                self.tabUpload.removeClass('active');

                // change status
                self.uploading = false;
                self.frame.find('.footer button.btn-upload').remove();
                self.frame.find('.footer button').show();
                self.uploadZone.find('.zone-content').html('').hide();
                self.uploadZone.find('.zone-info').show();
                self.uploadZone.find('.url-file').show();
                self.frame.find('.edit-form').remove();
                self.frame.find('.edit-form .footer button').removeClass('disable');
                self.frame.find('.edit-form .edit-content .edit-loading').remove();

            },
            error: function (error) {

                // change status
                self.uploading = false;
                self.frame.find('.footer button.btn-upload').remove();
                self.frame.find('.footer button').show();
                self.uploadZone.find('.zone-content').html('').hide();
                self.uploadZone.find('.zone-info').show();
                self.uploadZone.find('.url-file').show();
                self.frame.find('.edit-form .footer button').removeClass('disable');
                self.frame.find('.edit-form .edit-content .edit-loading').remove();

                self.alertPopUp('danger', `There is a problem in sending information. Please check your internet connection and try again.`);

            },
        });
    }

    editElement(item) {
        const self = this;
        const element = $(`<div class="edit-form">
            <div class="header">
                <div class="title">${this.translate.editFormTitle} ${item.id}</div>
                <div class="actions">
                    <button type="button" class="close"><i class="icon-close"></i></button>
                </div>
            </div>
            <div class="edit-content">
                <div class="edit-preview"></div>
                <div class="edit-inner-form"></div>
            </div>
            <div class="footer">
                <button type="button" class="btn cancel">${this.translate.editFormCancelButton}</button>
                <button type="button" class="btn btn-primary save">${this.translate.editFormSaveButton}</button>
            </div>
        </div>`);
        let file = false;
        let blobUrl = false;

        self.frame.find('.inner-wrapper').append(element);

        // add preview file
        if(self.options.type === 'external') element.find('.edit-preview').append(`<a href="${item.url}" target="_blank"><i class="icon-link"></i>${item.url}</a>`);
        else if (self.options.type === 'photo') {
            element.find('.edit-preview').append(`<img src="${item.url}" />`);
            element.find('.edit-preview').append(`<button type="button" class="btn btn-primary btn-full crop">${this.translate.editFormCropButton}</button>`);
        } else if (self.options.type === 'audio') element.find('.edit-preview').append(`<audio controls><source src="${item.url}" type="audio/mpeg"></audio>`);
        else if (self.options.type === 'video') element.find('.edit-preview').append(`<video autoplay loop controls><source src="${item.url}" type="video/mp4"></video>`);
        else element.find('.edit-preview').append(`<div class="other-file"><i class="icon-document"></i><div class="file-name">${item.name}</div></div>`);

        // add preview fields
        if (self.options.useTitle) element.find('.edit-inner-form').append(self.zoneFieldTitle(item.title));
        if (self.options.useDescription) element.find('.edit-inner-form').append(self.zoneFieldDescription(item.description));
        if (self.options.useTag) element.find('.edit-inner-form').append(self.zoneFieldTags(item.tags));

        // cancel edit file
        element.on('click', '.footer button.cancel, .header button.close', function () {
            element.remove();
        })

        // crop image
        element.on('click', '.edit-preview button.crop', function () {
            let image = new PhotoSelector({
                type: 'url',
                url: blobUrl ? blobUrl : item.url,
                aspectRatio: self.options.cropRatio,
                onDoneCrop: function (_class) {
                    blobUrl = URL.createObjectURL(_class.blob);
                    file = _class.blob;
                    element.find('.edit-preview img').attr('src', blobUrl)
                }
            });

            image.crop();
        })

        // save file
        element.on('click', '.footer button.save', function () {

            // Checking the title value. If it is empty in the video and audio types, it gives an error
            if (self.options.titleRequired && $('[name=title]').val().trim() === '') {
                $('[name=title]').parents('label').addClass('error');
                self.alertPopUp('danger', `Title cannot be empty, please fill it`);
                return;
            }

            // FormData is used to send values to the server. Its values may vary based on the type and conditions.
            let formData = new FormData();
            formData.append('file', file);
            formData.append('id', item.id);
            formData.append('data', self.options.data);

            element.find('input').each(function () {
                const input = $(this);
                const inputName = input.attr('name');

                // ignore without name
                if (inputName === undefined) return;

                // add input in form data
                formData.append(inputName, input.val());
            });

            // request to server
            self.zoneAjax(formData, true);

        })

    }

    // In this function, the control preview section is created and controls the events and internal sections.
    zonePreview(files, name = null) {
        const self = this;
        const upload = $(`<button type="button" class="btn btn-primary btn-upload">${this.translate.uploadZoneUploadButton}</button>`);
        const cancel = $(`<button type="button" class="btn btn-upload">${this.translate.uploadZoneCancelButton}</button>`);
        const preview = $(`<div class="zone-form">
            <div class="zone-preview"></div>
            <div class="zone-inner-form"></div>
        </div>`);

        // change upload status (In the file selection process,
        // the user cannot upload another file until the upload is complete.)
        self.uploading = true;

        // change view
        self.frame.find('.footer button').hide();
        self.uploadZone.find('.zone-info').hide();
        self.uploadZone.find('.url-file').hide();
        self.uploadZone.find('.zone-content').show();
        self.frame.find('.footer').append([cancel, upload]);

        // add preview file
        if(files === null) preview.find('.zone-preview').append(`<a href="${self.fileUrl}" target="_blank"><i class="icon-link"></i>${self.fileUrl}</a>`);
        else if (self.options.type === 'photo') preview.find('.zone-preview').append(`<img src="${URL.createObjectURL(files)}" />`);
        else if (self.options.type === 'audio') preview.find('.zone-preview').append(`<audio controls><source src="${URL.createObjectURL(files[0])}" type="audio/mpeg"></audio>`);
        else if (self.options.type === 'video') preview.find('.zone-preview').append(`<video autoplay loop controls><source src="${URL.createObjectURL(files[0])}" type="video/mp4"></audio>`);
        else preview.find('.zone-preview').append(`<div class="other-file"><i class="icon-document"></i><div class="file-name">${files[0].name}</div></div>`);

        // add preview fields
        if (self.options.useTitle) preview.find('.zone-inner-form').append(self.zoneFieldTitle());
        if (self.options.useDescription) preview.find('.zone-inner-form').append(self.zoneFieldDescription());
        if (self.options.useTag) preview.find('.zone-inner-form').append(self.zoneFieldTags());

        // cancel upload file
        cancel.on('click', function () {
            cancel.remove();
            upload.remove();
            self.frame.find('.footer button').show();
            self.uploadZone.find('.zone-info').show();
            self.uploadZone.find('.url-file').show();
            self.uploadZone.find('.zone-content').html('').hide();
            self.uploading = false;
        })

        // upload file
        upload.on('click', function () {

            // Checking the title value. If it is empty in the video and audio types, it gives an error
            if (self.options.titleRequired && $('[name=title]').val().trim() === '') {
                $('[name=title]').parents('label').addClass('error');
                self.alertPopUp('danger', `Title cannot be empty, please fill it`);
                return;
            }

            // FormData is used to send values to the server. Its values may vary based on the type and conditions.
            let formData = new FormData();
            formData.append('file', files);
            formData.append('filename', name);
            formData.append('fileUrl', self.fileUrl);
            formData.append('data', self.options.data);

            preview.find('input').each(function () {
                const input = $(this);
                const inputName = input.attr('name');

                // ignore without name
                if (inputName === undefined) return;

                // add input in form data
                formData.append(inputName, input.val());
            });

            // request to server
            self.zoneAjax(formData);

        })

        // add preview to zone
        self.uploadZone.find('.zone-content').html('').append(preview);
    }

    // This function creates the title field
    zoneFieldTitle(value = '') {
        const element = $(`<label><span>${this.translate.uploadZoneFieldTitle}:</span><input type="text" name="title" placeholder="${this.translate.uploadZoneFieldTitlePlaceholder}" value="${value}"></label>`);

        if(this.options.titleRequired) {
            element.on('input change', 'input', function () {
                if ($(this).val().trim() === '') $(this).parents('label').addClass('error');
                else $(this).parents('label').removeClass('error');
            })
        }

        return element;
    }

    // This function creates the description field
    zoneFieldDescription(value = '') {
        return $(`<label><span>${this.translate.uploadZoneFieldDesc}:</span><textarea name="description" placeholder="${this.translate.uploadZoneFieldDescPlaceholder}">${value}</textarea></label>`)
    }

    // This function creates the add tag field with all its events and states
    zoneFieldTags(tags = []) {
        const self = this;
        const element = $(`<div class="zone-tags">
            <div class="label">${this.translate.uploadZoneFieldTags}:</div>
            <div class="tags"></div>
            <div class="tags-form">
                <input type="text" placeholder="${this.translate.uploadZoneFieldTagsPlaceholder}">
                <button type="button" class="btn btn-primary">${this.translate.uploadZoneFieldTagsAdd}</button>
            </div>
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
            if(_this.attr('data-for')===undefined) {
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
                _this.html(self.translate.uploadZoneFieldTagsAdd);
                return;
            }

            // start add new element
            // create element
            const item = $(`<div class="item">
                <span>${input.val().trim()}</span>
                <i class="icon-trash trash"></i>
                <i class="icon-edit edit"></i>
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
                _this.html(self.translate.uploadZoneFieldTagsSave);
            })

            input.val('').focus();
            element.find('.tags').append(item).css('display', 'flex');

        });

        tags.forEach(function (vtag) {
            element.find('.tags-form input').val(vtag);
            element.find('.tags-form button').trigger('click');
        })

        return element;
    }

    // We use alert popup to announce different situations to the user. It is usually used to display errors
    alertPopUp(status, title){
        $('input, select, textarea, button').blur();

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

    // This method checks whether the entered text is a url or not
    isValidURL(str) {
        try {
            new URL(str);
            return true;
        } catch (error) {
            return false;
        }
    }

    // get photo item
    photoItem(item) {
        return $(`<img src="${item.thumbnail}" alt="image">`);
    }

    // get video item
    videoItem(item) {
        return $(`<img src="${item.thumbnail}" alt="image">`);
    }

    // get audio item
    audioItem(item) {
        return $(`<div class="audio-card" data-src="${item.url}">
            <div class="card-content">
                <div class="card-title" itemprop="name">${item.title}</div>
                <div class="card-time">
                    <meta itemprop="duration" content="T2M10S">
                    <span class="current-time">00:00</span> / <span>${item.duration}</span>
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
        </div>`);
    }

    // get other item
    otherItems(item){
        return $(`<div class="other-file"><i class="icon-document"></i><div class="file-name">${item.title}</div></div>`);
    }

}