/**
 * The PhotoSelector class is for creating a type of photo that is used in the upload component.
 * One of the important features of this class is file selection and image cutting.
 *
 * This file depends on cropper library.
 */
let imageSelected = {};

class PhotoSelector {

    /**
     * Set initial values
     *
     * @param config Input value for initial settings
     */
    constructor(config = {}) {

        let self = this;
        let id = this.generateID();
        let options = Object.assign({
            id: id,
            type: 'base64',
            url: null,
            base64: null,
            aspectRatio: 3 / 4,
            upload: false,
            accept: ['.png', '.jpg', '.webp'],
            onInit: function () {
            },
            onSelect: function () {
            },
            onChange: function () {
            },
            onReadFile: function () {
            },
            onDoneCrop: function () {
            },
            onCrop: function () {
            },
            onCropZoom: function () {
            },
            onCancel: function () {
            },
            onCropDistory: function () {
            },
            onUploadSuccess: function(_class){
            },
            onUploadError: function(_class, error){
            }
            // set default options
        }, config);

        this.id = options.id;
        this.options = options;
        this.inputFile = $(`<input type="file" id="${id}">`);
        this.cropFrame = null;
        this.blob = null;
        this.base64 = options.base64;
        this.url = options.url;
        this.temp = null;
        this.uploading = false;

        // init function
        this.init();

    }

    /**
     * init function
     */
    init() {

        // set variables
        let self = this;

        // run scripts init bafore run other scripts
        this.options.onInit(this);

        imageSelected[this.id] = this;
        this.inputFile.attr('accept', this.options.accept.join(','));
        this.inputFile.on('change', function () {
            if (this.files && this.files[0]) {
                var reader = new FileReader();
                reader.readAsDataURL(this.files[0]);
                reader.onload = function (e) {
                    self.base64 = e.target.result;
                    self.options.onReadFile(self);
                    self.crop();
                }
            }
            self.options.onChange(self);
        });

    }

    /**
     * Change the ID of the current object in global variable imageSelected
     *
     * @param id
     */
    changeID(newID, oldID) {
        imageSelected[newID] = this;
        delete imageSelected[oldID];
    }

    /**
     * Select file from system
     */
    chooseFile() {

        // run scripts select bafore run other scripts
        this.options.onSelect();

        // open file selector
        this.inputFile.click();

    }

    /**
     * Creating a cutting box and using a cropper, as well as setting the events of different parts of the box,
     * such as the done button, close button, and overlay
     */
    crop() {

        let self = this;

        const uploadButton = $('<button type="button" class="btn btn-primary upload">Upload</button>');
        const cancelButton = $('<button type="button" class="btn cancel">Cancel</button>');
        const doneButton = $('<button type="button" class="btn btn-primary done">Done</button>');
        const loading = $('<div class="crop-loading"><div class="loader-mini"></div><div class="progress-bar"><div class="progress-percent"><span>0</span>%</div><div class="progress-track"><div class="progress-track-processed"></div></div></div></div>')
        this.cropFrame = $(
            `<div class="crop-frame">
                <div class="overlay"></div>
                <div class="crop-content">
                    <div class="crop-header">Crop your photo:</div>
                    <div class="crop-inner-content">
                        <img src="${this.options.type === 'url'? this.url : this.base64}" style="max-height:200px;">
                    </div>
                    <div class="crop-footer">
                        <div class="crop-zoom-level">
                            <div class="crop-zoom-label">Zoom</div>
                            <div class="crop-zoom-progress">
                                <input type="range" min="0" max="100" value="0">
                            </div>
                        </div>
                        <div class="crop-actions"></div>
                    </div>
                </div>
            </div>`
        );

        if(this.options.upload !== false) this.cropFrame.find('.crop-footer .crop-actions').append([cancelButton,uploadButton]);
        else this.cropFrame.find('.crop-footer .crop-actions').append([doneButton]);

        // crop image
        let image = this.cropFrame.find('img');
        image.on('load',function(){
            let ratioBase = self.options.aspectRatio;

            if(typeof ratioBase === 'boolean'){
                ratioBase = ratioBase?null:3/4;
            }

            image.cropper({
                movable: true,
                dragMode: 'move',
                zoomOnWheel: false,
                aspectRatio: ratioBase,
                minContainerWidth: self.cropFrame.find('.crop-inner-content').width(),
                minContainerHeight: 360,
                viewMode: 2,
                cropend: function (event) {
                    let imageData = image.cropper('getCroppedCanvas').toDataURL();
                    self.temp = imageData;
                    self.options.onCrop(self);
                },
                ready: function () {
                    let imageData = image.cropper('getCroppedCanvas').toDataURL();
                    self.options.base64 = imageData; // default
                    self.base64 = imageData; // default
                    self.temp = imageData;
                }
            });

            // check ratios
            if(typeof self.options.aspectRatio === "string"){
                let ratios = self.options.aspectRatio.split(',');

                // use for single ratio
                if(ratios.length === 1) {
                    image.cropper('setAspectRatio', eval(ratios[0]));
                }

                // use for multi ratio
                if(ratios.length > 1) {
                    self.cropFrame.find('.crop-footer').prepend(`<div class="crop-ratios">
                        <div class="crop-ratios-label">Ratios:</div>
                        <div class="crop-ratios-items"></div>
                    </div>`);

                    image.cropper('setAspectRatio', eval(ratios[0]));

                    for (let i = 0;i<ratios.length;i++){
                        let btnRatio = $(`<button type="button">${ratios[i].replace('/','x').toUpperCase()}</button>`);
                        self.cropFrame.find('.crop-ratios-items').append(btnRatio);

                        btnRatio.on('click',function(){
                            self.cropFrame.find('.crop-ratios-items button').removeClass('active');
                            $(this).addClass('active');
                            if(ratios[i].toLowerCase() === 'free') image.cropper('setAspectRatio', []);
                            else image.cropper('setAspectRatio', eval(ratios[i]));
                            self.temp = image.cropper('getCroppedCanvas').toDataURL();
                        });
                    }

                    // active default button
                    self.cropFrame.find('.crop-ratios-items button:nth-child(1)').addClass('active');
                }

            }
        });

        // add click on done button
        doneButton.on('click', function () {
            if (self.temp) {
                self.options.base64 = self.temp;
                self.base64 = self.temp;
                self.blob = self.dataURItoBlob(self.temp);
                self.temp = null;
            }
            self.options.onDoneCrop(self);
            self.cropDistory();
        });

        // add click on upload
        uploadButton.on('click',function(){
            self.uploading = true;
            self.cropFrame.find('.crop-content').append(loading);
            loading.show();

            // upldate class variables
            if (self.temp) {
                self.options.base64 = self.temp;
                self.base64 = self.temp;
                self.blob = self.dataURItoBlob(self.temp);
                self.temp = null;
            }

            // ajax upload
            const formData = new FormData();
            formData.append('file', self.blob);

            $.ajax({
                url: self.options.upload,
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
                                loading.find('.progress-percent span').html(percent.toFixed(0));
                                loading.find('.progress-track-processed').width(percent+"%");
                            }
                        }, false);
                    }
                    return xhr;
                },
                success: function(data) {
                    self.changeID(data['id'], self.id);

                    self.id = data['id'];
                    self.url = data['url'];
                    self.options.type = 'url';
                    self.options.base64 = null;
                    self.options.id = data['id'];
                    self.options.url = data['url'];
                    self.base64 = null;
                    self.blob = null;

                    self.uploading = false;
                    loading.remove();
                    self.options.onUploadSuccess(self);
                    self.cropDistory();
                },
                error: function(error){
                    loading.hide();
                    self.options.onUploadError(self, error);
                    alert('Something went wrong, please check your internet connection and try again');
                }
            });

        })

        // add click on cancel
        cancelButton.on('click',function(){
            self.cropDistory();
        })

        this.cropFrame.find('.crop-zoom-progress input').on('input', function () {
            image.cropper('zoomTo', $(this).val() / 10);
            self.options.onCropZoom(self);
        });

        this.cropFrame.find('.overlay').on('click', function () {
            self.cropDistory();
            self.options.onCancel(self);
        });

        var cropper = image.data('cropper');
        $('body').append(this.cropFrame);
        bodyOverflowController(true);

    }

    /**
     * Destroy the box cropper
     */
    cropDistory() {
        if(this.uploading) return;

        this.cropFrame.remove();
        this.options.onCropDistory(this);
        bodyOverflowController();
    }

    /**
     * Generate unique id for save in global variable imageSelected
     *
     * @returns {string}
     */
    generateID() {
        let a = new Uint32Array(3);
        window.crypto.getRandomValues(a);
        return (performance.now().toString(36) + Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g, "");
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