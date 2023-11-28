/**
 * This file contains all the events and commands related to the dashboard section.
 */
"use strict";


(function ($) {

    let DOC = $(document);
    let WINDOW = $(window);
    let resizeCallback = [];
    let _lazyLoadingGlobal;

    // TODO window resize
    WINDOW.resize(function () {
        resizeCallback.forEach(function (callback, index) {
            callback();
        })
    })

    // TODO document ready
    DOC.ready(function () {

        // TODO control desktop and mobile visiblity
        resizeCallback.push(controlllDesktopAndMobileVisibility);
        controlllDesktopAndMobileVisibility();

        // This condition is to keep the sidebar open and closed while switching pages
        if(localStorage.getItem('ds_side_minimal') === 'on' && WINDOW.width() > 768){
            $('#sidebar').addClass('minimal');
            $('#main').css({paddingLeft: 80});
        }

        // open menu
        DOC.on('click', '#btn_ds_open_menu', function () {

            // The menu is executable at a breakpoint of 768px
            if (WINDOW.width() <= 768) {
                $('#btn_ds_open_menu').hide();
                $('#btn_ds_close_menu').show();
                $('#header, #sidebar').addClass('active');
                $('#sidebar').addClass('animate');
            }else{
                if($('#sidebar').hasClass('minimal')) {
                    $('#sidebar').removeClass('minimal');
                    $('#main').removeAttr('style');
                    localStorage.setItem('ds_side_minimal', 'off');
                }
                else {
                    $('#sidebar').addClass('minimal');
                    $('#main').css({paddingLeft: 80});
                    localStorage.setItem('ds_side_minimal', 'on');
                }
            }

        });

        // mouse enter on menu item
        DOC.on('mouseenter','#sidebar .menu li',function(){
            // if (!$('#sidebar').hasClass('minimal')) return;
            if($('#sidebar').hasClass('active')) return;
            if (WINDOW.width() > 992 && !$('#sidebar').hasClass('minimal')) return;

            const viewport = this.getBoundingClientRect();
            $(this).find('span').css({
                top: viewport.y,
                display: 'block',
            })
        })

        // mouse leave on menu item
        DOC.on('mouseleave','#sidebar .menu li',function(){
            $(this).find('span').removeAttr('style');
        })

        // close menu
        DOC.on('click', '#btn_ds_close_menu', function () {
            $('#btn_ds_open_menu').show();
            $('#btn_ds_close_menu').hide();
            $('#header, #sidebar').removeClass('active');
            setTimeout(function () {
                $('#sidebar').removeClass('animate');
            }, 160);
        });


        // log out from dashboard
        DOC.on('click', '.btn-ds-log-out', function () {

            let btnNo = $('<button type="button" class="btn btn-full btn-primary">No</button>');
            let btnYes = $('<button type="button" class="btn btn-full">Yes</button>');

            let popup = addAlertPopup({
                class: '',
                type: 'icon', // icon or avatar
                status: 'danger', // success, danger, info or warning
                title: `Are you sure you want to log out?`,
                actionElements: [btnNo, btnYes], // element object
                actionLayout: 'horizontal', // horizontal or vertical
            });

            btnNo.on('click', function () {
                popup.distory();
            });

            btnYes.on('click', function () {
                popup.distory();
            });

            // disable link
            return false;

        });

        // notification read more
        DOC.on('click', '.notification-read-more', function () {

            let status = $(this).data('status');
            let label = $(this).data('label');
            let content = $(this).data('content');
            let link = $(this).data('link');
            let linkLabel = $(this).data('link-label');

            addNotificationModal(status, label, content, link ? link : 'ok', linkLabel);

            // disable redirect
            return false;

        });

        // chart generator
        $('.activity-chart').each(function () {

            let wrapper = $(this);
            let id = uniqueID();
            let data = wrapper.data('values');
            let autoGenerate = wrapper.data('auto-generate');
            let xSteps = getDayStepsChart();

            if (autoGenerate) {
                data = generateChartData();
            } else if (!data) {
                data = [];
            }

            wrapper.append(`<canvas style="max-height:280px" id="${id}"></canvas>`);
            let chart = new Chart(id, {
                type: "line",
                data: {
                    labels: xSteps,
                    datasets: [{
                        data: data,
                        borderColor: "#4d92f9",
                        backgroundColor: "rgba(26,115,248,0.1)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                    }]
                },
                options: {
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    plugins: {
                        legend: {display: false,},
                        decimation: {
                            enabled: false,
                            algorithm: 'min-max',
                        },
                    },
                    elements: {
                        point: {
                            radius: 0
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                callback: function (val, index) {
                                    if (xSteps[index] == '') return;
                                    else return xSteps[index];
                                }
                            }
                        }
                    },
                }
            });

            wrapper.on('update', function (a, b) {
                chart.data.datasets.forEach((dataset) => {
                    // generate new data
                    if (autoGenerate) {
                        dataset.data = generateChartData();
                    } else {
                        // add script for create new data
                    }
                });
                chart.update();
            });

        });

        // remove connection
        DOC.on('click', '.btn-remove-connection', function () {

            let _this = $(this);
            let id = _this.data('id');
            let name = _this.data('name');
            let avatar = _this.data('avatar');
            let btnRemove = $('<button type="button" class="btn btn-full btn-primary">Remove</button>');
            let btnCancel = $('<button type="button" class="btn btn-full">Cancel</button>');

            let popup = addAlertPopup({
                class: '',
                type: 'avatar', // icon or avatar
                status: 'warning', // success, danger, info or warning
                avatar: avatar, // avatar url
                title: `Are you sure you want to remove ${name} from your connections?`,
                actionElements: [btnCancel, btnRemove], // element object
                actionLayout: 'horizontal', // horizontal or vertical
            });

            btnCancel.on('click', function () {
                popup.distory();
            });

            btnRemove.on('click', function () {
                $.ajax({
                    url: env.baseURL + 'your url',
                    type: 'post',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: '',
                    success: function (result, status, xhr) {
                        popup.distory();
                    },
                    error: function (xhr, status, error) {
                        popup.distory();
                    },
                });
            });

        });

        // send connection to model. connection mini in connection page
        DOC.on('click', '.connection-request-sent', function () {

            let _this = $(this);
            let id = _this.data('id');
            let name = _this.data('name');
            let btnOK = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
            let popup = addAlertPopup({
                class: '',
                type: 'icon', // icon or avatar
                status: 'warning', // success, danger, info or warning
                title: `${name} must accept it first`,
                content: `Liliana team will review it and you will be notified of the result.`,
                actionElements: [btnOK], // element object
                actionLayout: 'horizontal', // horizontal or vertical
            });

            btnOK.on('click', function () {
                popup.distory();
            });

            // disable link
            return false;

        });

        // Requests received. connection mini in connection page
        DOC.on('click', '.connection-request-recieved', function () {

            let _this = $(this);
            let id = _this.data('id');
            let name = _this.data('name');
            let btnConfirm = $('<button type="button" class="btn btn-full btn-primary">Confirm</button>');
            let btnDelete = $('<button type="button" class="btn btn-full">Delete</button>');
            let popup = addAlertPopup({
                class: '',
                type: 'icon', // icon or avatar
                status: 'warning', // success, danger, info or warning
                title: name,
                content: `<b>${name}</b> has requested to connect with you as <b>Family.</b>`,
                actionElements: [btnDelete, btnConfirm], // element object
                actionLayout: 'horizontal', // horizontal or vertical
            });

            btnConfirm.on('click', function () {
                $.ajax({
                    url: env.baseURL + 'your url',
                    type: 'post',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: '',
                    success: function (result, status, xhr) {
                        popup.distory();
                    },
                    error: function (xhr, status, error) {
                        popup.distory();
                    },
                });
            });

            btnDelete.on('click', function () {
                $.ajax({
                    url: env.baseURL + 'your url',
                    type: 'post',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: '',
                    success: function (result, status, xhr) {
                        popup.distory();
                    },
                    error: function (xhr, status, error) {
                        popup.distory();
                    },
                });
            });

            // disable link
            return false;

        });

        // connect to model
        DOC.on('click', '.btn-connect', function () {

            let btnSubmit = $('<button type="button" class="btn btn-full btn-primary disable">Submit</button>');
            let btnCancel = $('<button type="button" class="btn btn-full">Cancel</button>');
            let radioButtons = $(
                `<div class="field field-type-radio-2">
                    <div class="field-content">
                        <label>
                            <input type="radio" name="connection_relation" id="connection_relation" value="family">
                            <div class="checkmark"></div>
                            <span>Family</span>
                        </label>
                    </div>
                </div>
                <div class="field field-type-radio-2">
                    <div class="field-content">
                        <label>
                            <input type="radio" name="connection_relation" id="connection_relation" value="friend">
                            <div class="checkmark"></div>
                            <span>Friend</span>
                        </label>
                    </div>
                </div>
                <div class="field field-type-radio-2">
                    <div class="field-content">
                        <label>
                            <input type="radio" name="connection_relation" id="connection_relation" value="colleague">
                            <div class="checkmark"></div>
                            <span>Colleague</span>
                        </label>
                    </div>
                </div>
                <div class="field field-type-radio-2">
                    <div class="field-content">
                        <label>
                            <input type="radio" name="connection_relation" id="connection_relation" value="other">
                            <div class="checkmark"></div>
                            <span>Other</span>
                        </label>
                    </div>
                </div>`
            );

            let popup = addAlertPopup({
                class: 'alert-connect',
                type: 'icon', // icon or avatar
                status: 'link', // success, danger, info or warning
                title: 'Selecte the Relation Type:',
                content: radioButtons,
                actionElements: [btnCancel, btnSubmit], // element object
                actionLayout: 'horizontal', // horizontal or vertical
            });

            radioButtons.find('input').on('change', function () {
                let optionSelected = $(this).val();
                btnSubmit.removeClass('disable');
            });

            btnSubmit.on('click', function () {
                popup.distory();
            })

            btnCancel.on('click', function () {
                popup.distory();
            })

        });

        // Remove images from the gallery.
        DOC.on('click', '.btn-remove-photo-gallery', function () {
            let wrapper = $(this).find('span');
            wrapper.html('Removed');
            wrapper.prepend('<i class="icon-close"></i>');
            $(this).addClass('danger');
        });

        let baseFormData = {};
        if($('body').hasClass('edit-page')){
            baseFormData = getAreaFieldData($('#ds_content'), true);
        }

        // add alert popup for exit page
        window.addEventListener('beforeunload', function (e) {
            if($('body').hasClass('edit-page')){
                const confirmationMessage = 'Do you want to leave the page?';
                let params = getAreaFieldData($('#ds_content'));

                if(JSON.stringify(params)!==JSON.stringify(baseFormData)) {
                    e.returnValue = confirmationMessage;
                    return confirmationMessage;
                }

            }
            $('.page-loading').addClass('visible');
        });

        // save edit form
        DOC.on('click', '.btn-save-edit-form', function () {

            const _this = $(this);
            const page = _this.data('page');
            const content = $(`.white-box`);
            const fields = content.find('.field');
            let isFailde = false;

            clearFocus();
            fields.each(function (index, item) {
                const pro = new ProValidation();
                const sts = pro.singleValidate(item);

                if($(item).parents('[data-dependency-show=false]').length > 0) return;

                if (isFailde === false && !sts) isFailde = true;
            });

            // check table repeater
            $('.table-repeater').each(function(){
                const _this = $(this);
                const dataRequired = _this.data('required');
                const inputValue = _this.find('.table-repeater-input').val();
                let dataObjected = false;

                if(_this.parents('[data-dependency-show=false]').length > 0) return;
                if(dataRequired !== true) return;

                try {
                    dataObjected = JSON.parse(inputValue);
                }catch (e) {
                    dataObjected = [];
                }

                if(dataObjected.length === 0) {
                    isFailde = true;
                    _this.find('.repeater-table').addClass('error');
                }
            });

            if (isFailde) return false;

            // start send data
            $(this).html('Saving...').addClass('disable');
            let sendData = getAreaFieldData($('#ds_content'));
            $.ajax({
                url: env.baseURL +  "/api/uploadphoto",
                type: "POST",
                data: {
                    page: page,
                    fields: sendData,
                },
                success: function(data) {
                    baseFormData = sendData;
                    let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'success', // success, danger, info or warning
                        title: 'Your request was sent Successfully.',
                        actionElements: [btnOk], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });

                    btnOk.on('click', function () {
                        popup.distory();
                    });
                    _this.html('Save').removeClass('disable');
                },
                error: function(error){
                    let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'danger', // success, danger, info or warning
                        title: 'Your request encountered an error.',
                        actionElements: [btnOk], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });

                    btnOk.on('click', function () {
                        popup.distory();
                    });
                    _this.html('Save').removeClass('disable');
                }
            });

        });

        // check change user info
        DOC.on('click', '.see-change-form', function () {

            let data = $(this).data('change');
            let changeLogList = $('<div class="change-log-list"></div>');
            data.forEach(function(item){
                let itemObject = $(`<div class="change-log-item">`+
                `<div class="change-log-header"><div class="change-log-field">${item.label}</div><div class="change-log-status ${item.status}"></div></div>`+
                `<div class="change-log-content"><div class="change-log-old">${item.current}</div><i class="change-log-icon icon-arrow-right-1"></i><div class="change-log-new">${item.pending}</div></div>`+
                `</div>`);

                switch (item.status){
                    case 'no-approved':
                        itemObject.find('.change-log-status').append(['<i class="icon-close"></i>', '<span>No Approved</span>']);
                        break;
                    case 'expired':
                        itemObject.find('.change-log-status').append(['<i class="icon-close"></i>', '<span>Expired</span>']);
                        break;
                    case 'review':
                        itemObject.find('.change-log-status').append(['<i class="icon-refresh-cw"></i>', '<span>In Review</span>']);
                        break;
                    case 'approved':
                        itemObject.find('.change-log-status').append(['<i class="icon-check"></i>', '<span>Approved</span>']);
                        break;
                }

                if(!item.visibility){
                    itemObject.find('.change-log-old').html(`<button type="button" class="image-preview-eye-button" data-images="${JSON.stringify(item.current).replaceAll('"','"')}"><i class="icon-eye"></i></button>`);
                    itemObject.find('.change-log-new').html(`<button type="button" class="image-preview-eye-button" data-images="${JSON.stringify(item.pending).replaceAll('"','"')}"><i class="icon-eye"></i></button>`);
                }

                changeLogList.append(itemObject);
            })

            addNotificationModal('change', 'Your changes are being reviewed.', changeLogList);

            // disable link
            return false;

        });

        // crop image with click on crop button in custom action
        DOC.on('click','.gallery-custom-action .base-action button.crop',function(){
            let parent = $(this).parents('.item-image');

            let photoSelector = new PhotoSelector({
                id: 12,
                type: 'url',
                url: parent.attr('data-img-url'),
                onDoneCrop: function (_class) {
                    const url = URL.createObjectURL(_class.blob);
                    const formData = new FormData();
                    formData.append('file', _class.blob);
                    formData.append('id', parent.attr('data-img-id'));
                    parent.append('<div class="item-loading"><div class="loader"></div><div class="progress-bar"><div class="progress-percent"><span>0</span>%</div><div class="progress-track"><div class="progress-track-processed"></div></div></div></div>');

                    $.ajax({
                        url: env.baseURL +  "/api/uploadphoto",
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
                                        parent.find('.item-loading .progress-percent span').html(percent.toFixed(0));
                                        parent.find('.item-loading .progress-track-processed').width(percent+"%");
                                    }
                                }, false);
                            }
                            return xhr;
                        },
                        success: function(data) {
                            parent.find('.item-loading').remove();
                            parent.find('img').attr('src',url);
                            parent.attr('data-img-url',url);
                        },
                        error: function(error){
                            // parent.find('.item-loading').remove();
                            let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                            let popup = addAlertPopup({
                                class: '',
                                type: 'icon', // icon or avatar
                                status: 'danger', // success, danger, info or warning
                                title: 'Something went wrong, please check your internet connection and try again',
                                actionElements: [btnOk], // element object
                                actionLayout: 'horizontal', // horizontal or vertical
                            });

                            btnOk.on('click', function () {
                                popup.distory();
                            });
                        }
                    });
                }
            });

            photoSelector.crop();

        })

        // remove image with click on remove button in custom action
        DOC.on('click','.gallery-custom-action .base-action button.remove',function(){
            let parent = $(this).parents('.item-image');
            let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
            let btnCancel = $('<button type="button" class="btn btn-full">Cancel</button>');
            let popup = addAlertPopup({
                class: '',
                type: 'icon', // icon or avatar
                status: 'warning', // success, danger, info or warning
                title: 'Should the file be deleted?',
                actionElements: [btnCancel ,btnOk], // element object
                actionLayout: 'horizontal', // horizontal or vertical
            });

            btnOk.on('click', function () {
                btnOk.addClass('disable').html('Waiting...');
                btnCancel.hide();
                $.ajax({
                    url: env.baseURL + "/",
                    type: "POST",
                    data: {id: parent.attr('data-img-id')}, // You can pass additional data if needed
                    success: function(data) {
                        const itemContent = $(`<div class="item-content">
                        <div class="empty-label">There is no photo for ${parent.parents('.gallery-item').find('.item-title').html()}.</div>
                        <div class="empty-description">
                            We will be in touch very soon.You complete your main information! You can complete your profile now or complete it later in your dashboard!
                        </div>
                        <a href="./gallery-upload.html" class="btn btn-icon-left">
                            <span><i class="icon-upload"></i>Select or Upload Photo</span>
                        </a>
                    </div>`);
                        popup.distory();
                        parent.parents('.gallery-item').append(itemContent);
                        parent.remove();
                    },
                    error: function(error){
                        popup.distory();
                        let btnOk1 = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                        let popup1 = addAlertPopup({
                            class: '',
                            type: 'icon', // icon or avatar
                            status: 'danger', // success, danger, info or warning
                            title: 'Something went wrong, please check your internet connection and try again',
                            actionElements: [btnOk1], // element object
                            actionLayout: 'horizontal', // horizontal or vertical
                        });

                        btnOk1.on('click', function () {
                            popup1.distory();
                        });
                    }
                });
            });

            btnCancel.on('click', function () {
                popup.distory();
            });

        })

        // replace image with click on replace button in custom action
        DOC.on('click','.gallery-custom-action .base-action button.replace',function(){
            let parent = $(this).parents('.item-image');
            let itemSelected = $(this).parents('.gallery-item');
            let ratio = itemSelected.data('ratio');

            new MediaLibrary({
                type: 'photo',
                limitSize: 10,
                titleRequired: false,
                cropRatio: ratio?ratio:3/4,
                saveUrl: env.baseURL +  '/api/gallery/photo-save',
                fetchUrl: env.baseURL +  '/api/gallery/photo/',
                uploadUrl: env.baseURL +  '/api/gallery/photo-upload',
                data: {id: parent.attr('data-img-id')},
                translate: {
                    uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> your photo',
                    uploadZoneDescription: 'Allowed format: JPG, PNG (Up to: 1 photo/10 Mb)',
                },
                onSave: function(data){
                    itemSelected.find('.item-image').remove();
                    itemSelected.append(data);
                },
            });

        })

        // click on button select or upload
        DOC.on('click','.page-gallery button.btn-select-or-upload',function(){
            let itemSelected = $(this).parents('.gallery-item');
            let ratio = itemSelected.data('ratio');

            new MediaLibrary({
                type: 'photo',
                limitSize: 10,
                titleRequired: false,
                cropRatio: ratio?ratio:3/4,
                saveUrl: env.baseURL +  '/api/gallery/photo-save',
                fetchUrl: env.baseURL +  '/api/gallery/photo/',
                uploadUrl: env.baseURL +  '/api/gallery/photo-upload',
                data: {for: itemSelected.attr('data-for')},
                translate: {
                    uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> your photo',
                    uploadZoneDescription: 'Allowed format: JPG, PNG (Up to: 1 photo/10 Mb)',
                },
                onSave: function(data){
                    itemSelected.find('.item-content').remove();
                    itemSelected.append(data);
                },
            });

        })

        // click on button select or upload other photo
        DOC.on('click','#btn_upload_other_photo',function(){
            new MediaLibrary({
                type: 'photo',
                limitSize: 10,
                titleRequired: false,
                multiple: true,
                limit: 20,
                cropRatio: '3/4,4/3',
                saveUrl: env.baseURL +  '/api/gallery/photo-save',
                fetchUrl: env.baseURL +  '/api/gallery/photo/',
                uploadUrl: env.baseURL +  '/api/gallery/photo-upload',
                data: {},
                translate: {
                    uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> your photo',
                    uploadZoneDescription: 'Allowed format: JPG, PNG (Up to: 1 photo/10 Mb)',
                },
                onSave: function(data){
                    $('#other_list_items .box-list ul').html(data);
                },
            });
        })

        // click on button select or upload job experiences photo
        DOC.on('click','#btn_upload_job_exp_photo',function(){
            new MediaLibrary({
                type: 'photo',
                limitSize: 20,
                titleRequired: false,
                multiple: true,
                limit: 500,
                cropRatio: '3/4,4/3',
                saveUrl: env.baseURL +  '/api/gallery/photo-save',
                fetchUrl: env.baseURL +  '/api/gallery/photo/',
                uploadUrl: env.baseURL +  '/api/gallery/photo-upload',
                data: {},
                translate: {
                    uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> your Job Experiences photo',
                    uploadZoneDescription: 'Allowed format: JPG, PNG (Up to: 1 photo/20 Mb)',
                },
                onSave: function(data){
                    $('#job_exp_list_items .box-list ul').html(data);
                },
            });
        })

        // click on button select or upload skill photo
        DOC.on('click','#btn_upload_skill_photo',function(){
            new MediaLibrary({
                type: 'photo',
                limitSize: 20,
                titleRequired: false,
                multiple: true,
                limit: 500,
                cropRatio: '3/4,4/3',
                saveUrl: env.baseURL +  '/api/gallery/photo-save',
                fetchUrl: env.baseURL +  '/api/gallery/photo/',
                uploadUrl: env.baseURL +  '/api/gallery/photo-upload',
                data: {},
                translate: {
                    uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> your Skill photo',
                    uploadZoneDescription: 'Allowed format: JPG, PNG (Up to: 1 photo/20 Mb)',
                },
                onSave: function(data){
                    $('#skill_list_items .box-list ul').html(data);
                },
            });
        })

        DOC.on('click','#gallery_replace_video',function(){
            $('#your_video').parents('.video-upload-drop-zone').trigger('click');
        })

        // start edit tag in page edit media
        let tagIndexEditMedia = $('.page-gallery-edit-media .tags .tags-item a').length;

        // click on edit or add new tag button
        DOC.on('click','.page-gallery-edit-media .tags .tags-form button',function(){
            const _this = $(this);
            const input = $('.tags .tags-form input');

            // check input is empty
            if (input.val().trim() === '') {
                let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                let popup = addAlertPopup({
                    class: '',
                    type: 'icon', // icon or avatar
                    status: 'danger', // success, danger, info or warning
                    title: 'The tag value cannot be empty',
                    actionElements: [btnOk], // element object
                    actionLayout: 'horizontal', // horizontal or vertical
                });

                btnOk.on('click', function () {
                    popup.distory();
                });
                return;
            }

            // check before exist value
            let tagFind = false;
            if(_this.attr('data-for')===undefined) {
                $('.tags .tags-item input').each(function () {
                    if ($(this).val().trim().toLowerCase() === input.val().trim().toLowerCase()) {
                        tagFind = $(this).val();
                        return;
                    }
                })
                if (tagFind !== false) {
                    let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'danger', // success, danger, info or warning
                        title: 'The tag cannot be duplicated',
                        actionElements: [btnOk], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });

                    btnOk.on('click', function () {
                        popup.distory();
                    });
                    return;
                }
            }

            // check is edit mode
            if (_this.attr('data-for')) {
                const inputSelected = $(`[name="${_this.attr('data-for')}"]`);
                inputSelected.val(input.val().trim());
                inputSelected.parents('a').find('span').html(input.val().trim());

                // reset
                input.val('').focus();
                _this.removeAttr('data-for');
                _this.html('Add Tag');
                return;
            }

            // start add new item
            // create item object
            const tagItem = $(`<a>
                <span>${input.val().trim()}</span>
                <input type="hidden" name="tag[${tagIndexEditMedia++}]" value="${input.val().trim()}"/>
                <i class="icon-trash trash"></i>
                <i class="icon-edit edit"></i>
            </a>`);

            // append to view
            $('.tags .tags-item').append(tagItem);
            input.val('').focus();

        })

        // add new tag with click on key enter (input element)
        DOC.on('keydown','.page-gallery-edit-media .tags .tags-form input',function(e){
            if(e.keyCode === 13) {
                e.preventDefault();
                $('.tags .tags-form button').trigger('click');
            }
        })

        // remove tag
        DOC.on('click','.page-gallery-edit-media .tags .tags-item i.trash',function(){
            $(this).parents('a').remove();
        })

        // edit tag
        DOC.on('click','.page-gallery-edit-media .tags .tags-item i.edit',function(){
            const itemSelected = $(this).parents('a');
            const input = $('.tags .tags-form input');
            const button = $('.tags .tags-form button');

            input.val(itemSelected.find('input').val()).focus();
            button.attr('data-for', itemSelected.find('input').attr('name'));
            button.html('Save Tag');
        })

        // show alert for de-check account visibility
        DOC.on('click','#account_visibility',function(e){

            const element = $(this);
            const status = element.prop('checked');

            // check is checked
            if(status) return;

            e.preventDefault();
            let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
            let btnCancel = $('<button type="button" class="btn btn-full">Cancel</button>');
            let popup = addAlertPopup({
                class: '',
                type: 'icon', // icon or avatar
                status: 'warning', // success, danger, info or warning
                title: 'If you deselect the \'account visibility\' option, your account will not be shown on our website.',
                actionElements: [btnCancel, btnOk], // element object
                actionLayout: 'horizontal', // horizontal or vertical
            });

            btnCancel.on('click', function () {
                element.prop('checked',true).trigger('change');
                popup.distory();
            });

            btnOk.on('click', function () {
                element.prop('checked',false).trigger('change');
                popup.distory();
            });

        })

        // audio card set preventDefault in edit media
        DOC.on('click','.page-gallery-edit-media .audio-card button',function(e){
            e.preventDefault()
        })

        // open preview table repeater in user info page (just this page)
        DOC.on('click','.page-user-info .live-table-repeater button.preview',function(e){
            const dataString = $(this).attr('data-value');
            let data = [];

            try {
                const dataObject = JSON.parse(dataString);
                data = dataObject;
            }catch (e){
                console.log('Can not decode data.');
            }

            const view = $(`<div class="table-repeater-form-view preview-mode">
                <div class="repeater-inner-wrapper">
                    <div class="repeater-title">Preview</div>
                    <div class="repeater-content"></div>
                    <div class="repeater-footer"><button type="button" class="btn btn-primary ok">Ok</button></div>
                </div>
                <div class="repeater-overlay"></div>
            </div>`);

            if(data.type === 'image'){
                view.addClass('photo-content');
                view.find('.repeater-content').append('<div class="preview-grid"></div>');
                view.find('.preview-grid').attr('data-count', data.value.length);
                data.value.forEach(function(item){
                    view.find('.preview-grid').append(`<div class="grid-item"><img src="${item}"/></div>`);
                })
            }else {
                view.addClass('any-content');
                view.find('.repeater-content').append(data.value);
            }

            // close form
            view.on('click','.repeater-footer button.ok, .repeater-overlay',function(){
                view.remove();
            })

            $('body').append(view);
        })

        DOC.on('click','.white-box.expand-event .white-box-header',function(e){
            if($(e.target).parents('.white-box-actions').length > 0) return;

            const element = $(this).parents('.white-box');

            if(element.hasClass('active')){
                element.removeClass('active');
            }else{
                $('.white-box.expand-event').removeClass('active');
                element.addClass('active');
            }
        })

    });

    // change chart result with year change
    DOC.on('change', '.filter-years-input input', function () {
        let _this = $(this);
        let chart = _this.parents('.white-box').find('.activity-chart');
        chart.trigger('update', _this.val());
    })

    // close photo guide
    DOC.on('click', '.btn-close-photo-guide', function () {
        $('.light-box').remove();
    });

    // TODO Video Gallery Events
    // Trigger events that are related to the gallery page. They are usually used to open the media library

    // open media library for (other video)
    DOC.on('click', '#upload_new_other_video, #other_video_list .replace-new-video', function (e) {
        e.preventDefault();

        new MediaLibrary({
            type: 'video',
            limitSize:20,
            data: {
                type: "other-video",
                id: $(this).data('id'),
            },
            uploadWithUrl: true,
            multiple: !$(this).hasClass('replace-new-video'),
            openOnLibrary: $(this).hasClass('replace-new-video'),
            saveUrl: env.baseURL +  '/api/gallery/video-save',
            fetchUrl: env.baseURL +  '/api/gallery/video/',
            uploadUrl: env.baseURL +  '/api/gallery/video-upload',
            translate: {
                uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> other video',
                uploadZoneDescription: 'Allowed format: MP4 (Up to: 1 photo/20 Mb)',
            },
            onSave: function(data){
                $('#other_video_list .box-list ul').html(data);
            },
        });

    });

    // open media library for (polaroid video)
    DOC.on('click', '#upload_new_polaroid_video, #polaroid_video_list .replace-new-video', function (e) {
        e.preventDefault();

        new MediaLibrary({
            type: 'video',
            limitSize:50,
            data: {
                type: "polaroid-video",
                id: $(this).data('id'),
            },
            uploadWithUrl: true,
            multiple: !$(this).hasClass('replace-new-video'),
            openOnLibrary: $(this).hasClass('replace-new-video'),
            saveUrl: env.baseURL +  '/api/gallery/video-save',
            fetchUrl: env.baseURL +  '/api/gallery/video/',
            uploadUrl: env.baseURL +  '/api/gallery/video-upload',
            translate: {
                uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> polaroid video',
                uploadZoneDescription: 'Allowed format: MP4 (Up to: 1 photo/50 Mb)',
            },
            onSave: function(data){
                $('#polaroid_video_list .box-list ul').html(data);
            }
        });

    });

    // open media library for (polaroid video)
    DOC.on('click', '#upload_new_introduction_video, #introduction_video_list .replace-new-video', function (e) {
        e.preventDefault();

        new MediaLibrary({
            type: 'video',
            limitSize:50,
            data: {
                type: "introduction-video",
                id: $(this).data('id'),
            },
            uploadWithUrl: true,
            multiple: !$(this).hasClass('replace-new-video'),
            openOnLibrary: $(this).hasClass('replace-new-video'),
            saveUrl: env.baseURL +  '/api/gallery/video-save',
            fetchUrl: env.baseURL +  '/api/gallery/video/',
            uploadUrl: env.baseURL +  '/api/gallery/video-upload',
            translate: {
                uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> introduction video',
                uploadZoneDescription: 'Allowed format: MP4 (Up to: 1 photo/50 Mb)',
            },
            onSave: function(data){
                $('#introduction_video_list .box-list ul').html(data);
            }
        });

    });

    // open media library for (job exp video)
    DOC.on('click', '#upload_new_job_exp_video, #job_exp_video_list .replace-new-video', function (e) {
        e.preventDefault();

        new MediaLibrary({
            type: 'video',
            limitSize:70,
            limit: 500,
            data: {
                type: "job-experiences-video",
                id: $(this).data('id'),
            },
            uploadWithUrl: true,
            multiple: !$(this).hasClass('replace-new-video'),
            openOnLibrary: $(this).hasClass('replace-new-video'),
            saveUrl: env.baseURL +  '/api/gallery/video-save',
            fetchUrl: env.baseURL +  '/api/gallery/video/',
            uploadUrl: env.baseURL +  '/api/gallery/video-upload',
            translate: {
                uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> Job Experiences video',
                uploadZoneDescription: 'Allowed format: MP4 (Up to: 1 photo/70 Mb)',
            },
            onSave: function(data){
                $('#job_exp_video_list .box-list ul').html(data);
            }
        });

    });

    // open media library for (skill video)
    DOC.on('click', '#upload_new_skills_video, #skills_video_list .replace-new-video', function (e) {
        e.preventDefault();

        new MediaLibrary({
            type: 'video',
            limitSize:70,
            limit: 500,
            data: {
                type: "skill-video",
                id: $(this).data('id'),
            },
            uploadWithUrl: true,
            multiple: !$(this).hasClass('replace-new-video'),
            openOnLibrary: $(this).hasClass('replace-new-video'),
            saveUrl: env.baseURL +  '/api/gallery/video-save',
            fetchUrl: env.baseURL +  '/api/gallery/video/',
            uploadUrl: env.baseURL +  '/api/gallery/video-upload',
            translate: {
                uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> Skills video',
                uploadZoneDescription: 'Allowed format: MP4 (Up to: 1 photo/70 Mb)',
            },
            onSave: function(data){
                $('#skills_video_list .box-list ul').html(data);
            }
        });

    });

    // remove video item
    DOC.on('click','.page-video-gallery .box-list a.remove',function(e){
        e.preventDefault();

        const _this = $(this);
        const itemSelected = _this.parents('.li');
        const id = _this.attr('data-id');

        clearFocus();
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
            clearFocus();

            $.ajax({
                url: env.baseURL +  "/",
                type: "POST",
                data: id,
                success: function(data) {
                    popup.distory();
                    itemSelected.remove();
                },
                error: function(error){
                    popup.distory();
                    let btnOk2 = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup2 = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'danger', // success, danger, info or warning
                        title: 'Something went wrong, please check your internet connection and try again',
                        actionElements: [btnOk2], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });
                    btnOk2.on('click',function(){
                        popup2.distory();
                    })
                }
            });
        });

        btnCancel.on('click',function(){
            popup.distory();
        })
    })

    // TODO Voice Gallery Events
    // For the voice page, there are events for opening the media library and deleting the voice

    // open media library for (Voice)
    DOC.on('click', '#upload_new_voice', function (e) {
        e.preventDefault();

        new MediaLibrary({
            type: 'audio',
            multiple: true,
            openOnLibrary: false,
            saveUrl: env.baseURL +  '/api/gallery/audio-save',
            fetchUrl: env.baseURL +  '/api/gallery/audio/',
            uploadUrl: env.baseURL +  '/api/gallery/audio-upload',
            translate: {
                uploadZoneTitle: '<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> your audio',
                uploadZoneDescription: 'Allowed format: MP3 (Up to: 1 photo/10 Mb)',
            },
            onSave: function(data){
                $('.page-voice-gallery .gallery-grid').prepend(data);
                initAudioCard();
            }
        });

    });

    // remove audio item
    DOC.on('click','.page-voice-gallery .gallery-grid button.remove',function(e){
        e.preventDefault();

        const _this = $(this);
        const itemSelected = _this.parents('.gallery-item');
        const id = _this.attr('data-id');

        clearFocus();
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
            clearFocus();

            $.ajax({
                url: env.baseURL +  "/",
                type: "POST",
                data: id,
                success: function(data) {
                    popup.distory();
                    itemSelected.remove();
                },
                error: function(error){
                    popup.distory();
                    let btnOk2 = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup2 = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'danger', // success, danger, info or warning
                        title: 'Something went wrong, please check your internet connection and try again',
                        actionElements: [btnOk2], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });
                    btnOk2.on('click',function(){
                        popup2.distory();
                    })
                }
            });
        });

        btnCancel.on('click',function(){
            popup.distory();
        })
    })

    // TODO Security & Privacy Event
    // A custom mode is needed for the security & privacy page fields. If the new password has been entered,
    // the password fields are mandatory

    // check with on input
    DOC.on('input','#new_password, #confirm_new_password, #current_password',function(){
        if($('body').hasClass('page-security-privacy')){
            const newPassword = $('#new_password');
            const confirmNewPassword = $('#confirm_new_password');
            const currentPassword = $('#current_password');
            let requiredFieldStatus = false;

            if(newPassword.val().trim() !== '') requiredFieldStatus = true;
            else {
                requiredFieldStatus = false;
                newPassword.parents('.form-section-content').find('.field').removeClass('field--invalid field--valid');
                newPassword.parents('.form-section-content').find('.field-error-msg').removeClass('active');
                newPassword.parents('.form-section-content').find('.password-strength').removeClass('active');
                newPassword.parents('.form-section-content').find('#password_hint_new_password').show();
            }

            newPassword.parents('.field').data('required', requiredFieldStatus);
            confirmNewPassword.parents('.field').data('required', requiredFieldStatus);
            currentPassword.parents('.field').data('required', requiredFieldStatus);

        }
    })

    // TODO Verify Socials
    // This event is for social network account verification. By using data-type features, the verification type is
    // specified and data-target is used to receive the input value.

    // click on verify button
    DOC.on('click','.btn-social-verify',function(){
        const _button = $(this);
        const type = _button.data('type');
        const target = $(_button.data('target'));
        const target2 = $(_button.data('target-2'));
        const data = {
            type: type,
            value: target.val(),
            value2: target2.val(),
        };

        _button.html('Waiting...').addClass('disable');
        $.ajax({
            url: env.baseURL +  "/api/uploadphoto",
            type: "POST",
            data: data,
            success: function(data) {
                _button.html('Verify').removeClass('disable');
                const buttonVerify = $('<button type="button" class="btn btn-full btn-primary">Verify</button>');
                const content = $('<div class="row row-gap-16"><div class="col-12">Enter the code sent in the section</div><div class="col-12"><div class="field field-type-nr-input" data-type="text" data-required="true" data-required-type="verifycode">' +
                    '<div class="field-content"><label for="verify_code">Verify Code <span class="field-required-star">*</span></label>' +
                    '<input type="text" id="verify_code"></div></div>' +
                    '<div class="field-error-msg" id="field_error_verify_code"></div></div><div class="col-12"><a href="#" class="form-resend-timer">Send Again<span> After <span class="timer">2:00</span></span></a></div></div>');

                let popupForm = addAlertPopup({
                    class: '',
                    type: 'icon', // icon or avatar
                    status: 'success', // success, danger, info or warning
                    title: 'Code sent successfully.',
                    actionElements: [buttonVerify], // element object
                    content: content,
                    actionLayout: 'horizontal', // horizontal or vertical
                    onDistory: function(){
                        content.find('.form-resend-timer').trigger('clear');
                    }
                });

                content.find('.form-resend-timer').on('click',function(){
                    if($(this).hasClass('timer-active')) return;
                    $.ajax({
                        url: env.baseURL +  "/api/uploadphoto",
                        type: "POST",
                        data: data,
                        success: function(data) {
                            content.find('.form-resend-timer').trigger('resend');
                        },
                        error: function(error){}
                    });
                })

                fieldDetector();
                initResendTimer();

                buttonVerify.on('click',function(){
                    const pro = new ProValidation();
                    const sts = pro.singleValidate(content.find('.field'));

                    if(!sts) {
                        content.find('.field').addClass('field--invalid');
                        return;
                    }

                    buttonVerify.html('Waiting...').addClass('disable');
                    $.ajax({
                        url: env.baseURL +  "/api/uploadphoto",
                        type: "POST",
                        data: data,
                        success: function(data) {
                            popupForm.distory();
                            buttonVerify.html('Verify').removeClass('disable');
                            content.find('.form-resend-timer').trigger('resend');
                            setTimeout(function(){
                                const btnOK = $('<button type="button" class="btn btn-full btn-primary">OK</button>');
                                let popup2 = addAlertPopup({
                                    class: '',
                                    type: 'icon', // icon or avatar
                                    status: 'success', // success, danger, info or warning
                                    title: 'Your account has been successfully verified',
                                    actionElements: [btnOK], // element object
                                    actionLayout: 'horizontal', // horizontal or vertical
                                });
                                btnOK.on('click',function(){
                                    popup2.distory();
                                })
                            },250)
                        },
                        error: function(error){
                            popupForm.distory();
                            buttonVerify.html('Verify').removeClass('disable');
                            setTimeout(function(){
                                const btnOK = $('<button type="button" class="btn btn-full btn-primary">OK</button>');
                                let popup2 = addAlertPopup({
                                    class: '',
                                    type: 'icon', // icon or avatar
                                    status: 'danger', // success, danger, info or warning
                                    title: 'Something went wrong, please check your internet connection and try again',
                                    actionElements: [btnOK], // element object
                                    actionLayout: 'horizontal', // horizontal or vertical
                                });
                                btnOK.on('click',function(){
                                    popup2.distory();
                                })
                            },250)
                        }
                    });
                })
            },
            error: function(error){
                _button.html('Verify').removeClass('disable');
                const btnOK = $('<button type="button" class="btn btn-full btn-primary">OK</button>');
                let popup2 = addAlertPopup({
                    class: '',
                    type: 'icon', // icon or avatar
                    status: 'danger', // success, danger, info or warning
                    title: 'Something went wrong, please check your internet connection and try again',
                    actionElements: [btnOK], // element object
                    actionLayout: 'horizontal', // horizontal or vertical
                });
                btnOK.on('click',function(){
                    popup2.distory();
                })
            }
        });


    })

    // TODO Mini Circle Progress
    // This feature is used to display progress. Note that its range is from 0 to 100

    // check exist progress bar and run
    if($('.mini-circle-progress').length > 0) {
        let items = document.querySelectorAll('.mini-circle-progress');
        const counters = Array(items.length);
        const intervals = Array(items.length);
        counters.fill(0);
        items.forEach((number, index) => {
            intervals[index] = setInterval(() => {
                if (counters[index] == parseInt(number.dataset.num)) {
                    clearInterval(intervals[index]);
                } else {
                    counters[index] += 1;
                    number.style.background = "conic-gradient(#0D0D0D calc(" + counters[index] + "%), #E9E9E9 0deg)";
                    number.setAttribute('data-value', counters[index] + "%");
                    number.innerHTML = counters[index] + "%";
                }
            }, 15);
        });
    }

    // TODO Window Load Event
    // Items that need to be executed after the page load is completed are placed in this section

    // window load
    WINDOW.on('load', function () {

        // lazy loading image
        if (typeof LazyLoad != 'undefined') {
            _lazyLoadingGlobal = new LazyLoad({
                class_applied: "lz-applied",
                class_loading: "lz-loading",
                class_loaded: "lz-loaded",
                class_error: "lz-error",
                class_entered: "lz-entered",
                class_exited: "lz-exited",
            });
        }

        // remove page loading
        setTimeout(function () {
            $('.page-loading').removeClass('visible');
            $('body').css('visibility', 'visible');
        }, 300);

    });

    WINDOW.on("pageshow", function(event) {
        if (event.originalEvent.persisted) {
            // Removing loading after loading the page from stretched mode (return to the previous page)
            // remove page loading
            setTimeout(function () {
                $('.page-loading').removeClass('visible');
                $('body').css('visibility', 'visible');
            }, 300);
        }
    });

    // TODO Functions
    // This section contains the functions that are supposed to be used publicly in this file and most likely
    // do more than one thing.

    /**
     * generate unique id
     *
     * @returns {string}
     */
    function uniqueID() {
        let a = new Uint32Array(3);
        window.crypto.getRandomValues(a);
        return (performance.now().toString(36) + Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g, "");
    }

    // This function disables all focus. It is usually used for parts that need to remove the focus from
    // (input, textarea, select and button) so that nothing happens if the user unconsciously touches buttons
    // like Enter and Space.
    // For example, if a button is clicked to create an AlertPopUp, by pressing Enter again, the Alert should
    // not be created again, so we must remove the focus.
    function clearFocus(){
        $('input, select, textarea, button, a').blur();
    }

    /**
     * Responsive control of elements that have class (visible-desktop and visible-mobile).
     */
    function controlllDesktopAndMobileVisibility() {

        // window size
        let size = WINDOW.width();

        if (size <= 576) {
            $('.visible-desktop').attr('data-dependency-show', 'false');
            $('.visible-mobile').attr('data-dependency-show', 'true');
        } else {
            $('.visible-desktop').attr('data-dependency-show', 'true');
            $('.visible-mobile').attr('data-dependency-show', 'false');
        }

    }

    /**
     * This function puts the days of the year in an array so that the first day is the name of the month and the other days are an empty text.
     * This function is used for charts.
     *
     * @param _year The year you want its days to be created
     * @returns {*[]}
     */
    function getDayStepsChart(_year = null) {

        let temp = [];
        let _moment = _year ? moment(_year) : moment();

        for (let i = 0; i < 12; i++) {

            let month = _moment.set('month', i);
            let days = _moment.daysInMonth();

            for (let d = 1; d <= days; d++) {
                temp.push(d == 1 ? month.format('MMM') : '');
            }

        }

        return temp;

    }

    /**
     * This function creates a random value for the chart
     *
     * @returns {*[]}
     */
    function generateChartData() {

        let temp = [];
        let shift = 0;
        let range = 10;

        for (let i = 0; i < 365; i++) {
            let rand = Math.floor((Math.random() * 100) + 1);
            let replaced = rand;

            if (rand <= shift + range && rand >= shift - range) replaced = rand;
            else if (rand > shift + range) replaced = shift + range;
            else if (rand < shift - range) replaced = shift - range;

            temp.push({x: i, y: replaced});
            shift = replaced;
        }

        return temp;

    }

    /**
     * This function is for creating notification with specific structure using modalside.
     * The commands of this function depend on the modal-side.js file
     *
     * @param status {string} To specify the icon and its color. values: success, danger, info and warning
     * @param label {string} Notification label
     * @param content {*} Notification content (String or Object)
     * @param link {string} This value is to change the type of close notification button to link
     * @param linkLabel {string} Label of the link
     * @returns {ModalSide} The return type is ModalSide and is usually used to add an element to the Modal or destroy it
     */
    function addNotificationModal(status, label, content, link = false, linkLabel = null) {

        let labelTag = $('<div class="notification-label"></div>');
        let contentTag = $('<div class="notification-content"></div>');
        let modal = new ModalSide({
            class: 'notification-modal',
            appbarTitle: status === 'change'? 'Changes' : 'Notification',
            actions: link != false,
            onClose: function (cls) {
                cls.distory();
            },
            onBeforeGenerate: function (cls) {

                // icon status
                switch (status) {
                    case 'success':
                        cls.innerContent.append('<i class="icon-tick notification-icon success"></i>');
                        break;
                    case 'danger':
                        cls.innerContent.append('<i class="icon-alert-triangle notification-icon danger"></i>');
                        break;
                    case 'info':
                        cls.innerContent.append('<i class="icon-info notification-icon info"></i>');
                        break;
                    case 'change':
                        cls.innerContent.append('<i class="icon-sand-watch notification-icon info"></i>');
                        break;
                    case 'warning':
                        cls.innerContent.append('<i class="icon-alert-triangle notification-icon warning"></i>');
                        break;
                }

                // append label and content
                cls.innerContent.append(labelTag);
                cls.innerContent.append(contentTag);
                labelTag.append(label);
                contentTag.append(content);

                // link
                if (link == 'ok') {
                    let btn = $(`<button type="button" class="btn btn-primary btn-full">Ok</button>`);
                    btn.on('click', function () {
                        cls.distory();
                    });
                    cls.actions.append(btn);
                } else if (link) {
                    let btn = $(`<a href="${link}" class="btn btn-primary btn-full btn-icon-right"><span>${linkLabel}<i class="icon-arrow-right-1"></i></span></a>`);
                    btn.on('click', function () {
                        cls.distory();
                    });
                    cls.actions.append(btn);
                }

            }
        });

        return modal;

    }

})(jQuery);
