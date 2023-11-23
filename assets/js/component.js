/**
 * This file contains all the events and commands related to the dashboard section.
 */
"use strict";

// global variable
let currentSelect = null;

// new element repeater
let elementRepeater = [];

/**
 * generate unique id
 *
 * @returns {string}
 */
function uid() {
    let a = new Uint32Array(3);
    window.crypto.getRandomValues(a);
    return (performance.now().toString(36) + Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g, "");
};

// scripts
(function ($) {

    // run scripts after ready document
    $(document).ready(function () {

        // start window full height
        // init function
        initWinFullHeight();

        // With this function, you can give the page height to all the elements that have the win-full-height class
        function initWinFullHeight(){
            $('.win-full-height').height($(window).height());
        }

        // set function on window resize
        $(window).resize(initWinFullHeight);

        // start tabs component
        // init tabs
        initTabs();

        // defined initial function
        function initTabs(){
            $('.tabs').each(function () {

                const _this = $(this);
                const tabActive = _this.data('active');

                // define tab selector function
                const tabSelect = function (id) {
                    _this.find(`.tabs-item li`).removeClass('active');
                    _this.find(`.tabs-item #${id}`).addClass('active');
                    _this.find(`.tab-content-item`).removeClass('active');
                    _this.find(`.tab-content-item[data-tab-target="${id}"]`).addClass('active');
                }

                // select defualt tab
                tabSelect(tabActive);

                // switch tab
                _this.find('.tabs-item li').on('click', function () {
                    tabSelect($(this).attr('id'));
                });

            });
        }

        // heading box
        $('.heading-box').each(function () {

            const _this = $(this);
            const _autoSize = _this.data('auto-size');
            const _col = _this.data('col');

            /**
             * Setting the width of the items in the heading box at the breaking point of 576px
             */
            const resize = function () {
                const width = $(window).width();
                const boxWidth = _this.find('.heading-content').width();

                // breakpoint
                if (width <= 576) {
                    _this.find('.heading-content > *').width((boxWidth - 16) / _col);
                } else {
                    _this.find('.heading-content > *').width('auto');
                }
            }

            // With auto-size enabled in the heading box attribute, items will be columnarized
            if (_autoSize) {
                // change window size
                $(window).resize(resize);

                resize();
            }

        });

        // Add the model to the bookmark by clicking the Add bookmark button in the model card
        $(document).on('click', '.btn-add-model-to-bookmark', function (e) {
            // this comment use for change status button (active, de-active)
            let card = $(this).parents('.model-card');
            const modelID = card.data('id');
            const storageData = localStorage.getItem('bookmark');

            // In the first step, it is checked whether the model has already been in the bookmark or not
            if(card.hasClass('item-bookmarked') && storageData !==  null){
                let temp = storageData.split(',');
                temp = temp.filter(function(element) {
                    return element !== modelID.toString();
                });
                localStorage.setItem('bookmark',temp);
                card.removeClass('item-bookmarked');
            } else if(storageData){ // In the second step, it is checked whether the bookmark was in localStorage or not
                const temp = storageData.split(',');
                temp.push(modelID);
                localStorage.setItem('bookmark',temp);
                card.addClass('item-bookmarked');
            }else{ // In the third step, if localStorage does not exist for the bookmark, it will be created
                localStorage.setItem('bookmark',[modelID]);
                card.addClass('item-bookmarked')
            }

            return false;
        });

        // The items inside the element are filtered with the filter-area class.
        // This operation is performed using the options defined by the filter-option class.
        $('.filter-area').each(function () {

            const _this = $(this);
            const _activeFilter = _this.data('active-filter');

            /**
             * This function is used to filter items
             *
             * @param filter The value to be filtered
             */
            const setFilter = function (filter) {
                let items = _this.find(`.filter-item`);

                // resets
                _this.find('.filter-option').removeClass('active');
                items.hide();

                if (filter == 'all') {
                    _this.find(`.filter-option[data-filter="all"]`).addClass('active');
                    items.show();
                } else {
                    _this.find(`.filter-option[data-filter="${filter}"]`).addClass('active');
                    items.each(function () {

                        let item = $(this);
                        let dataFilter = item.data('filter').split(',');

                        if ($.inArray(filter, dataFilter) !== -1) item.show();

                    })
                }

            }

            // set default
            if (_activeFilter) setFilter(_activeFilter);

            // set with click on option
            _this.find('.filter-option').on('click', function () {
                setFilter($(this).data('filter'));
                return false;
            });

        });

        // accordion
        $('.accordion').each(function () {

            const _this = $(this);

            _this.find('.accordion-content').hide();
            _this.find('.accordion-header').on('click', function () {

                const _parent = $(this).parent();
                const _hasActive = _parent.hasClass('active');

                _this.find('.accordion-item').removeClass('active');
                _this.find('.accordion-content').slideUp();

                if (!_hasActive) {
                    _parent.addClass('active');
                    _parent.find('.accordion-content').slideDown();
                }

                return false;
            });

        });

        // start read more and less
        // init read more
        initReadMore();

        // initial read more function
        function initReadMore(){
            $('.read-more-element').each(function(){
                const element = $(this);
                const lengthDesktop = element.data('length-desktop');
                const lengthMobile = element.data('length-mobile');
                const text = element.text();
                const windowWidth = $(window).width();

                // check is detected
                if(element.data('detect')) return;
                element.attr('data-detect', true);

                element.on('show',function(){
                    element.html(text);
                    element.append('<span class="read-more-button">Less</span>');
                })

                element.on('less',function(){
                    if(windowWidth > 576){
                        if(text.length > lengthDesktop){
                            element.html(text.substring(0, lengthDesktop)+ '...');
                            element.append('<span class="read-more-button">Read More</span>');
                        }
                    }else if(text.length > lengthMobile){
                        element.html(text.substring(0, lengthMobile)+ '...');
                        element.append('<span class="read-more-button">Read More</span>');
                    }
                })

                element.on('click','.read-more-button',function(){
                    if(element.hasClass('active')){
                        element.removeClass('active');
                        element.trigger('less');
                    }else{
                        element.addClass('active');
                        element.trigger('show');
                    }
                })

                // set default
                element.trigger('less');

            })
        }

        // light box
        initLightBox();
        function initLightBox(){
            let lightBoxObject = {};
            let lightBoxItems = $('[data-light-box]');
            lightBoxItems.each(function (index) {

                lightBoxObject[index] = {
                    tags: $(this).find('.light-box-tags').clone(),
                    description: $(this).find('.light-box-description').clone(),
                }

                $(this).attr('data-object-id',index);
                $(this).find('.light-box-tags, .light-box-description').remove();
                $(this).on('click', function (e) {
                    e.preventDefault();

                    // config
                    let _this = $(this);
                    let currentIndex = index;
                    let id = _this.data('light-box');
                    let type = _this.data('light-box-type');
                    let selector = _this.data('light-box-selector');
                    let isNavigator = $(`[data-light-box=${id}]`).length > 1;
                    let isClose = _this.data('light-box-close');
                    let link = _this.attr('href');
                    let objectID = _this.attr('data-object-id');

                    // variable default
                    isClose = isClose == undefined ? true : isClose;

                    // elements
                    let prev = $('<button class="prev"><i class="icon-arrow-left"></i></button>');
                    let next = $('<button class="next"><i class="icon-arrow-right"></i></button>');
                    let close = $('<button class="close"><i class="icon-close"></i></button>');
                    let Oops = $('<div class="error-msg">Ooops!</div>');
                    let loading = $('<div class="loading"></div>');
                    let lightBox = $('<div class="light-box"></div>');
                    let overlay = $('<div class="overlay"></div>');
                    let content = $('<div class="light-box-content"></div>');
                    let innerContent = $('<div class="light-box-inner-content"></div>');
                    let createContent = function () {
                        switch (type) {
                            case 'image':
                                let img = $(`<img src="${link}">`);
                                img.on('load', function () {
                                    loading.parent().append([img, convertSpanToLink(lightBoxObject[objectID].tags), lightBoxObject[objectID].description]);
                                    lightBoxObject[objectID].description.width(img.width());
                                    lightBoxObject[objectID].tags.width(img.width());
                                    loading.remove();
                                });

                                return loading;
                                break;
                            case 'video':
                                let videoElement = $(`<div><video controls loop autoplay><source src="${link}" type="video/mp4"></video></div>`);
                                videoElement.append([convertSpanToLink(lightBoxObject[objectID].tags), lightBoxObject[objectID].description]);

                                return videoElement;
                                break;
                            case 'iframe':
                                return $(`<iframe src"${link}"></iframe>`);
                                break;
                            case 'element':
                                let element = document.querySelector(selector);
                                return $(element.outerHTML).css('display', 'block');
                                break;
                            default:
                                return false;
                                break;
                        }
                    }

                    function convertSpanToLink(elm){
                        elm.find('span').each(function(){
                            $(this).parent().append(`<a href="${$(this).data('href')}">${$(this).html()}</a>`);
                            $(this).remove();
                        })

                        return elm;
                    }

                    /**
                     * Move between items with the same ID. This function goes to the next item by default
                     *
                     * @param _index current item index
                     * @param next Specifies whether the item should move forward or backward
                     */
                    let pnFind = function (_index, next = true) {

                        let i = _index;
                        let loopStatus = true;

                        while (loopStatus) {

                            // loop controller
                            i = next ? ++i : --i;
                            if (i > lightBoxItems.length - 1) i = 0;
                            if (i < 0) i = lightBoxItems.length - 1;

                            if (_index == i) {
                                loopStatus = false;
                            } else {

                                let _item = $(lightBoxItems[i]);
                                if (_item.data('light-box') == id) {
                                    currentIndex = i;
                                    id = _item.data('light-box');
                                    type = _item.data('light-box-type');
                                    selector = _item.data('light-box-selector');
                                    link = _item.attr('href');
                                    objectID = _item.attr('data-object-id');
                                    let _contentGenerated = createContent();
                                    innerContent.html([_contentGenerated ? close : null, _contentGenerated ? _contentGenerated : Oops]);
                                    loopStatus = false;

                                    $.each([close, overlay], function () {
                                        this.on('click', function () {
                                            lightBox.remove();
                                        });
                                    });
                                }
                            }

                        }

                    }

                    // events
                    $.each([close, overlay], function () {
                        this.on('click', function () {
                            lightBox.remove();
                        });
                    });

                    // Go to the next item
                    next.on('click', function () {
                        pnFind(currentIndex);
                    });

                    // Go to the prev item
                    prev.on('click', function () {
                        pnFind(currentIndex, false);
                    });

                    // generate
                    lightBox.append([content, overlay]);
                    content.append([isNavigator ? prev : null, innerContent, isNavigator ? next : null]);
                    let _contentGenerated = createContent();
                    innerContent.append([isClose && _contentGenerated ? close : null, _contentGenerated ? _contentGenerated : Oops]);
                    $('body').append(lightBox);

                    return false;

                });
            });
        }

        // init audio card
        initAudioCard();

        // start table repeater
        // init table repeater
        initTableRepeater($(document));

        // defined initial function
        function initTableRepeater(_dom){
            let popupView = null;
            _dom.find('.table-repeater').each(function(){
                const _this = $(this);
                const form = _this.find('.repeater-form');
                const table = _this.find('.repeater-table');
                const columns = tableRepeaterDetectField(_this, form);
                const formHtml = form.html();

                // check is detected
                if(_this.data('detect')) return;
                _this.attr('data-detect', true);

                // build header
                tableRepeaterBuildHeader(table, columns);
                tableRepeaterBuildRowBody(_this, table, columns);

                // remove form
                form.remove();
                bodyOverflowController();

                // open popup form
                _this.on('click', '.repeater-add-item',function(){
                    tableRepeaterBuildPopUpView(_this, formHtml, table, columns);
                })

                // open popup form edit
                _this.on('click', 'button.edit',function(){
                    const index = $(this).parents('tr').attr('data-index');
                    tableRepeaterBuildPopUpView(_this, formHtml, table, columns, index);
                })

                // remove item
                _this.on('click', 'button.remove',function(){
                    let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let btnCancel = $('<button type="button" class="btn btn-full">Cancel</button>');
                    let popup = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'warning', // success, danger, info or warning
                        title: 'Should the item be deleted?',
                        actionElements: [btnCancel, btnOk], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });

                    btnOk.on('click', function () {
                        const index = $(this).parents('tr').attr('data-index');
                        tableRepeaterRemoveItem(_this, index);
                        tableRepeaterBuildRowBody(_this, table, columns);
                        popup.distory();
                    });

                    btnCancel.on('click', function () {
                        popup.distory();
                    });
                })

                // rebuild table
                _this.on('rebuild',function(){
                    tableRepeaterBuildRowBody(_this, table, columns);
                })

                // live view
                _this.on('rebuildLive',function(){
                    const liveID = _this.attr('data-live');
                    const liveElement = $(`#${liveID}`);
                    const liveTable = liveElement.find('.repeater-table');

                    liveElement.find('thead').html('');
                    liveElement.find('tbody').html('');
                    tableRepeaterBuildHeader(liveTable, columns, false);
                    tableRepeaterBuildRowBody(_this, liveTable, columns, false);
                })

                // open popup
                _this.on('openPopup',function(){
                    tableRepeaterBuildPopUpView(_this, formHtml, table, columns);
                })

                // close popup (form popup and preview popup)
                _this.on('closePopup',function(){
                    if(popupView === null) return;
                    popupView.remove();
                    bodyOverflowController();
                })

                // check in initial live view
                if(_this.attr('data-live') !== undefined){
                    _this.trigger('rebuildLive');
                }

            })

            // detect field from form. _element is form object(jquery)
            function tableRepeaterDetectField(_root, _element){
                const fields = {};

                // foreach on all fields
                _element.find('.field').each(function(){
                    const field = $(this);
                    const type = field.data('type');
                    let input = field.find('input');

                    if(type === 'textarea') input = field.find('textarea');
                    if(type === 'select') input = field.find('select');

                    let inputName = input.attr('name');
                    fields[inputName] = {
                        type: type,
                        label: field.find('label').text().replace('*','').trim(),
                        visible: field.hasClass('table-visible'),
                        preview: field.hasClass('table-preview'),
                        custom: field.data('col-name'),
                    }
                });

                // check custom columns
                const customColumns = _root.data('custom-column') === undefined? [] : _root.data('custom-column');
                customColumns.forEach(function(col){
                    fields[col['name']] = {
                        type: 'custom',
                        label: col['text'],
                        visible: true,
                        preview: false,
                        custom: undefined,
                    }
                })

                return fields;
            }

            // build table header
            function tableRepeaterBuildHeader(_table, _columns, _actions = true){
                const row = $('<tr></tr>');
                const keys = Object.keys(_columns);

                keys.forEach(function(key){
                    const item = _columns[key];

                    // check use in visible
                    if(item.visible === false || item.custom !== undefined) return;

                    // append default
                    row.append(`<td>${item.label}</td>`);
                })

                if(_actions) row.append(`<td class="col-actions"></td>`);

                _table.find('thead').html('');
                _table.find('thead').append(row);
            }

            // build table row body
            function tableRepeaterBuildRowBody(_root, _table, _columns, _actions = true){
                const data = tableRepeaterTryDecodeData(_root.find('.table-repeater-input').val());
                const keys = Object.keys(_columns);
                const tableBody = _table.find('tbody');

                // clear any html in tbody
                _table.find('tbody').html('');
                _table.find('.empty-message').remove();

                // check empty
                if(data.length === 0){
                    _table.append('<div class="empty-message">There is no item</div>');
                    _root.addClass('is-empty');
                    return;
                } else _root.removeClass('is-empty');

                // create element
                data.forEach(function(_item, _index){
                    const row = $(`<tr data-index="${_index}"></tr>`)

                    // build column
                    keys.forEach(function(_key){
                        const column = _columns[_key];

                        // check use in visible
                        if(column.visible === false) return;

                        // Columns that are custom should stop processing for the column because there is no field
                        // with the name of a custom column.
                        if(_item[_key] === undefined) return;

                        // custom column
                        if(column.custom){
                            if(row.find(`td.repeater-col-${column.custom}`).length === 0){
                                row.append(`<td class="repeater-col-${column.custom}"><span class="table-cell-label">${column.label}:</span><span>${_item[_key].text === ''? '-':_item[_key].text}</span></td>`)
                            }else if(_item[_key].text !== ''){
                                row.find(`td.repeater-col-${column.custom}`).html(`<span class="table-cell-label">${column.label}:</span><span>${_item[_key].text}</span>`);
                            }

                            return;
                        }

                        // check preview
                        if(column.preview === true){
                            const previewButton = $(`<td><span class="table-cell-label">${column.label}:</span><button type="button" class="preview" data-index="${_index}" data-field="${_key}"><i class="icon-eye"></i></button></td>`);

                            // open preview form
                            previewButton.on('click', 'button.preview',function(){
                                const index = $(this).attr('data-index');
                                const field = $(this).attr('data-field');
                                tableRepeaterBuilderPopUpPreview(_root, index, field);
                            })

                            row.append(previewButton);
                            return;
                        }

                        // build image
                        if(column.type === 'upload'){
                            const tdElement = $('<td><span class="table-cell-label">${column.label}:</span></td>');

                            if(_item[_key].text.length === 0) tdElement.append('-');
                            else {
                                _item[_key].text.forEach(function(_i, _d){
                                    if(['photo','video','audio'].includes(_i.type)) tdElement.append(`<img src="${_i.thumbnail}"/>`);
                                    else tdElement.append((_d > 0? ', ' : '') + _i.name);
                                })
                            }

                            row.append(tdElement);
                            return;
                        }

                        row.append(`<td><span class="table-cell-label">${column.label}:</span><span>${_item[_key].text === ''? '-':_item[_key].text}</span></td>`);
                    })

                    // add actions
                    if(_actions) {
                        row.append(`<td class="col-actions">
                        <span class="table-cell-label">Actions:</span>
                        <div class="repeater-row-actions">
                            <button type="button" class="edit"><i class="icon-edit"></i></button>
                            <button type="button" class="remove"><i class="icon-trash-2"></i></button>
                        </div>
                    </td>`);
                    }

                    tableBody.append(row);
                })

            }

            // It checks whether the data is healthy or not and returns the value
            function tableRepeaterTryDecodeData(data){
                try{
                    return JSON.parse(data);
                }catch (e){
                    return [];
                }
            }

            // Create popup form for new item or edit item
            function tableRepeaterBuildPopUpView(_root, _html, _table, _columns, _index = null){
                const name = _root.data('name');
                const data = tableRepeaterTryDecodeData(_root.find('.table-repeater-input').val());
                const view = $(`<div class="table-repeater-form-view">
                    <div class="repeater-inner-wrapper">
                        <div class="repeater-title">${_index === null? 'Add New' : 'Edit'}${name === undefined? '' : ' '+name}</div>
                        <div class="repeater-content"></div>
                        <div class="repeater-footer">
                            <button type="button" class="btn cancel">Cancel</button>
                            <button type="button" class="btn btn-primary apply">${_index === null? 'Add New' : 'Save'}</button>
                        </div>
                    </div>
                    <div class="repeater-overlay"></div>
                </div>`);
                popupView = view;
                const applyButton = view.find('.repeater-footer button.apply');

                if(_root.data('class')) view.addClass(_root.data('class'));

                if(_index === null) {
                    view.find('.repeater-footer').append(`<button type="button" class="btn btn-primary continue">Add & exit</button>`);
                }

                // close form
                view.on('click','.repeater-footer button.cancel, .repeater-overlay',function(){
                    view.remove();
                    bodyOverflowController();
                    popupView = null;
                })

                // save form
                view.on('click','.repeater-footer button.apply, .repeater-footer button.continue',function(){

                    // check validate forms
                    if(tableRepeaterFieldsValidator(view)) return;

                    const formDataObject = tableRepeaterInputsValueToObject(view);
                    const saveStatus = tableRepeaterSaveItem(_root, formDataObject, _index);

                    // check data is saved
                    if(!saveStatus) return;

                    // rebuild body
                    tableRepeaterBuildRowBody(_root, _table, _columns);

                    if($(this).hasClass('continue') || _index !== null){
                        view.remove();
                        bodyOverflowController();
                        popupView = null;
                    }else{
                        view.find('.repeater-content').html(_html);
                        fieldDetector();
                        initUploadDropZone();
                        initDependencyCheck();
                        initTabs();

                        // show message item added
                        applyButton.html('Item added').addClass('success');
                        setTimeout(function(){
                            applyButton.html(_index === null? 'Add New' : 'Save').removeClass('success');
                        },1500);
                    }

                })

                // add html and set data
                view.find('.repeater-content').html(_html);
                if(_index !== null) {
                    Object.keys(data[_index]).forEach(function (item) {
                        const input = view.find(`[name="${item}"]`);
                        const field = input.parents('.field');
                        const type = field.data('type');

                        input.val(data[_index][item].input);
                        if(type === 'select') {
                            input.find(`option`).removeAttr("selected");
                            input.attr('data-value', data[_index][item].input);
                            input.attr('data-default-value', data[_index][item].input);
                            data[_index][item].input.split(',').forEach(function(optionsValue){
                                input.find(`option[value="${optionsValue}"]`).attr("selected", "selected");
                            })
                        }else if(type === 'upload'){
                            const dataDefaultText = data[_index][item].text;
                            field.find('.upload-drop-zone').attr('data-default',dataDefaultText === ''? '' : JSON.stringify(dataDefaultText));
                        }

                    })
                }

                $('body').append(view);
                bodyOverflowController(true);
                fieldDetector();
                initUploadDropZone();
                initDependencyCheck();
                initTabs();
            }

            // Create preview popup. The fields that are specified
            function tableRepeaterBuilderPopUpPreview(_root, _index, _field){
                const data = tableRepeaterTryDecodeData(_root.find('.table-repeater-input').val());
                const view = $(`<div class="table-repeater-form-view preview-mode">
                    <div class="repeater-inner-wrapper">
                        <div class="repeater-title">Preview</div>
                        <div class="repeater-content"></div>
                        <div class="repeater-footer"><button type="button" class="btn btn-primary ok">Ok</button></div>
                    </div>
                    <div class="repeater-overlay"></div>
                </div>`);
                popupView = view;

                if(_root.data('preview-class')) view.addClass(_root.data('preview-class'));

                if(data[_index][_field].type === 'upload'){
                    let useGrid = false;
                    let appendItems = [];

                    data[_index][_field].text.forEach(function(item){
                        if(item.type === 'photo'){
                            useGrid = true;
                            appendItems.push(`<div class="grid-item"><img src="${item.thumbnail}"/></div>`);
                        } else if(item.type === 'video'){
                            useGrid = true;
                            appendItems.push(`<div class="grid-item"><video autoplay loop controls><source src="${item.url}" type="video/mp4"></video></div>`);
                        } else if(item.type === 'audio'){
                            useGrid = true;
                            appendItems.push(`<div class="grid-item"><audio controls><source src="${item.url}" type="audio/mpeg"></audio></div>`);
                        } else{
                            appendItems.push(`<div><a href="${item.url}" target="_blank">${item.url}</a></div>`);
                        }
                    })

                    if(useGrid){
                        view.addClass('photo-content');
                        view.find('.repeater-content').append('<div class="preview-grid"></div>');
                        view.find('.preview-grid').attr('data-count',data[_index][_field].text.length);
                        view.find('.preview-grid').append(appendItems);
                    }else view.find('.repeater-content').append(appendItems);

                }else {
                    view.addClass('any-content');
                    view.find('.repeater-content').append(data[_index][_field].text);
                }

                // close form
                view.on('click','.repeater-footer button.ok, .repeater-overlay',function(){
                    view.remove();
                    bodyOverflowController();
                    popupView = null;
                })

                view.find('.repeater-content').append(data[_index][_field]);
                $('body').append(view);
                bodyOverflowController(true);
            }

            // Convert the value of the fields to json
            function tableRepeaterInputsValueToObject(_element){
                const fields = _element.find('.field');
                const _object = {};

                fields.each(function(){
                    const field = $(this);
                    const type = field.data('type');
                    let input = field.find('input, textarea');
                    let value = input.val();
                    let text = value;

                    if(type === 'select') text = input.attr('data-label');
                    else if(type === 'upload') {
                        const uploadZone = input.parents('.upload-drop-zone').attr('data-default');
                        text = uploadZone? JSON.parse(uploadZone) : [];
                    }

                    let inputName = input.attr('name');

                    let dependencyElement = field.parents('[data-dependency]');
                    if(dependencyElement.length > 0){
                        if(dependencyElement.attr('data-dependency-show') === 'true') text = text;
                        else text = '';
                    }

                    _object[inputName] =  {
                        type: type,
                        input: value,
                        text: text,
                    }

                })

                return _object;
            }

            // data storage Edit data or add
            function tableRepeaterSaveItem(_root, _data, _index = null){
                const data = tableRepeaterTryDecodeData(_root.find('.table-repeater-input').val());
                const dataString = JSON.stringify(_data).toLowerCase();
                let uniqueData = _root.data('unique');
                let exclusiveData = _root.data('exclusive');
                let exclusiveValue = _root.data('exclusive-value');
                let exclusiveEmptyElementCheck = _root.data('exclusive-empty-element-check');
                let uniqueErrorMessage = _root.data('unique-message');
                let exclusiveErrorMessage = _root.data('exclusive-message');
                let duplicateErrorMessage = _root.data('duplicate-message');
                let isDuplicated = false;
                let isUnique = true;
                let isExclusive = false;

                // foreach on items and check with new item
                data.forEach(function(item, itemIndex){
                    if(itemIndex == _index) return;

                    if(uniqueData){
                        let uniqueArray = uniqueData.split(',');
                        uniqueArray.forEach(function(_i){
                            if(item[_i].input === _data[_i].input) isUnique = false;
                        });
                    }

                    if(JSON.stringify(item).toLowerCase() === dataString){
                        isDuplicated = true;
                        return;
                    }
                })

                // check exclusive
                if(exclusiveData && data[0]){
                    if(data[0][exclusiveData].input === exclusiveValue) isExclusive = true;
                    else if(_data[exclusiveData].input === exclusiveValue) isExclusive = true;
                }

                // Check selected fields for unique value
                if(!isUnique || isExclusive) {
                    let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'danger', // success, danger, info or warning
                        title: uniqueErrorMessage? uniqueErrorMessage : 'Selected values do not require storage',
                        actionElements: [btnOk], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });
                    btnOk.on('click', function () {
                        popup.distory();
                    });
                    return false;
                }

                // show message exclusive
                if(exclusiveEmptyElementCheck){
                    const elementCheck = $(`#${exclusiveEmptyElementCheck}`).val();
                    if(elementCheck !== undefined && elementCheck !== '' && _data[exclusiveData].input === exclusiveValue){
                        let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                        let popup = addAlertPopup({
                            class: '',
                            type: 'icon', // icon or avatar
                            status: 'danger', // success, danger, info or warning
                            title: exclusiveErrorMessage? exclusiveErrorMessage : 'Selected values do not require storage',
                            actionElements: [btnOk], // element object
                            actionLayout: 'horizontal', // horizontal or vertical
                        });
                        btnOk.on('click', function () {
                            popup.distory();
                        });
                        return false;
                    }
                }

                // show error if is duplicated
                if(isDuplicated){
                    let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup = addAlertPopup({
                        class: '',
                        type: 'icon', // icon or avatar
                        status: 'danger', // success, danger, info or warning
                        title: duplicateErrorMessage? duplicateErrorMessage : 'The tag cannot be duplicated',
                        actionElements: [btnOk], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });

                    btnOk.on('click', function () {
                        popup.distory();
                    });

                    return false;
                }

                if(_index !== null) data[_index] = _data;
                else data.push(_data);

                _root.removeClass('is-empty');
                _root.find('.table-repeater-input').val(JSON.stringify(data)).trigger('change');
                _root.find('.repeater-table').removeClass('error');

                return true;
            }

            // delete data
            function tableRepeaterRemoveItem(_root, _index){
                const data = tableRepeaterTryDecodeData(_root.find('.table-repeater-input').val());
                data.splice(_index, 1);

                if(data.length === 0) {
                    _root.addClass('is-empty');
                    _root.find('.table-repeater-input').val(null).trigger('change');

                    if(_root.data('required')) _root.find('.repeater-table').addClass('error');
                }
                else _root.find('.table-repeater-input').val(JSON.stringify(data)).trigger('change');
            }

            // Validation of form fields
            function tableRepeaterFieldsValidator(_element){
                const fields = _element.find('.field');
                let isFailde = false;
                let notEmpty = false;

                fields.each(function (index, item) {
                    const pro = new ProValidation();
                    const sts = pro.singleValidate(item);

                    if($(item).find('input, textarea').val().trim() !== '') notEmpty = true;

                    if($(item).parents('[data-dependency-show=false]').length > 0) return;

                    if (isFailde === false && !sts) isFailde = true;
                });

                if (isFailde) return true;

                if(!notEmpty) return true;

                return false;
            }

        }

        // Calling the fieldDetector function causes all fields to be identified and initialized.
        // Precedence in calling this function is important and must come before any other event related to the fields
        fieldDetector();

        // Apply date picker on the field
        $(document).on('focus', '.field input.field-datepicker', function () {

            let input = $(this);
            let field = $(this).parents('.field');
            let minDate = input.attr('data-min-date');
            let labelElement = field.find('label').clone();

            labelElement.find('*').remove();
            new DatePicker({
                date: input.val(),
                title: labelElement.text(),
                parent: field,
                minDate: minDate,
                closeBtnIcon: 'icon-calendar',
                submitBtnCallback: function (_this) {
                    const limitObject = input.attr('data-limit-object');

                    input.val(_this.input.val()).trigger('change');
                    if(limitObject !== undefined){
                        $(limitObject).val('');
                        $(limitObject).attr('data-min-date',_this.input.val());
                        $(limitObject).parents('.field').removeClass('field--invalid field--valid');
                    }
                    _this.distory();
                },
                closeBtnCallback: function (_this) {
                    if ($(window).width() < 576) _this.distory();
                },
                beforeGenerate: function (cls) {
                    field.addClass('field--focus field--lv-label');
                },
                beforeDistory: function (cls) {
                    const proValidation = new ProValidation();
                    const groupContainr =field.parents('.field-group-validations');
                    proValidation.singleValidate(field[0]);

                    // validation
                    if (input.val() === '') {
                        field.removeClass('field--focus field--lv-label');
                        groupContainr.find('.field').removeClass('field--focus field--lv-label');
                    }
                }
            });

        });

        // Apply wheel date picker on the field
        $(document).on('focus', '.field input.field-wheel-datepicker', function () {

            let input = $(this);
            let field = $(this).parents('.field');
            let labelElement = field.find('label').clone();

            labelElement.find('*').remove();
            input.blur();

            new DatePicker({
                mode: 'wheel',
                date: input.val(),
                title: labelElement.text(),
                parent: field,
                closeBtnIcon: 'icon-calendar',
                submitBtnCallback: function (_this) {
                    input.val(_this.input.val()).trigger('change');
                    _this.distory();
                },
                closeBtnCallback: function (_this) {
                    if ($(window).width() < 576) _this.distory();
                },
                beforeGenerate: function (cls) {
                    field.addClass('field--focus field--lv-label');
                },
                beforeDistory: function (cls) {
                    const proValidation = new ProValidation();
                    const groupContainr =field.parents('.field-group-validations');
                    proValidation.singleValidate(field[0]);

                    // validation
                    if (input.val() === '') {
                        field.removeClass('field--focus field--lv-label');
                        groupContainr.find('.field').removeClass('field--focus field--lv-label');
                    }
                }
            });

        });

        // Apply time picker on the field
        $(document).on('focus', '.field input.field-wheel-timepicker', function () {

            let input = $(this);
            let field = $(this).parents('.field');
            let minDate = input.attr('data-min-date');
            let labelElement = field.find('label').clone();

            labelElement.find('*').remove();
            input.blur();
            new DatePicker({
                type: 'time',
                mode: 'wheel',
                date: input.val(),
                minDate: minDate,
                title: labelElement.text(),
                parent: field,
                closeBtnIcon: 'icon-clock',
                submitBtnCallback: function (_this) {
                    const limitObject = input.attr('data-limit-object');

                    input.val(_this.input.val()).trigger('change');
                    if(limitObject !== undefined){
                        $(limitObject).val('');
                        $(limitObject).attr('data-min-date',_this.input.val());
                        $(limitObject).parents('.field').removeClass('field--invalid field--valid');
                    }
                    _this.distory();
                },
                closeBtnCallback: function (_this) {
                    if ($(window).width() < 576) _this.distory();
                },
                beforeGenerate: function (cls) {
                    field.addClass('field--focus field--lv-label');
                },
                beforeDistory: function (cls) {
                    const proValidation = new ProValidation();
                    const groupContainr =field.parents('.field-group-validations');
                    proValidation.singleValidate(field[0]);

                    // validation
                    if (input.val() === '') {
                        field.removeClass('field--focus field--lv-label');
                        groupContainr.find('.field').removeClass('field--focus field--lv-label');
                    }
                }
            });

        });

        // This event is used to detect that an element has been clicked outside. It is usually used for the select field
        $(document).mouseup(function (e) {
            var container = currentSelect;
            // check current select is null
            if (!container) return false;
            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.removeClass('field--focus field--lv-label');
                container.find('.field-select-options').trigger('destroy');
                currentSelect = null;

                // check field validation new version
                const proValidation = new ProValidation();
                proValidation.singleValidate(container[0]);
            }
        });

        // next step btn progress indicator.
        $(document).on('click', '.progress-indicator .next-step', function (e) {

            const content = $(`.step-content`);
            const fields = content.find('.field');
            let isFailde = false;

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

        });

        // show and hide password field
        $(document).on('click', '.field-show-password', function () {

            let field = $(this).parents('.field');
            let input = field.find('input');

            if (input.attr('type') == 'password') {
                input.attr('type', 'text');
                $(this).addClass('active');
            } else {
                input.attr('type', 'password');
                $(this).removeClass('active');
            }

        });

        $(document).on('submit', '.form-validation-on-submit', function () {

            const form = $(this);
            const fields = form.find('.field');
            let hasFaildeField = false;

            fields.each(function(index,item){
                const _ProValidation = new ProValidation();
                const _ValidateResult = _ProValidation.singleValidate(item);

                if (hasFaildeField === false && !_ValidateResult) hasFaildeField = true;
            });

            // check has error and disable send form data
            if(hasFaildeField) return false;

        });

        // init resend timer
        initResendTimer();

        // upload drop-zone
        // upload drop-zone is used to receive files from the user and it gives the user modes such as drag and drop
        // and file selection by clicking.
        initUploadDropZone();
        function initUploadDropZone(){
            $('.upload-drop-zone').each(function () {

                const zoneElement = $(this);
                const inputElement = zoneElement.find('input');
                const field = zoneElement.parents('.field');
                const uploadZoneFile = field.parent().find('.upload-drop-zone-file');
                const label = zoneElement.find('label');

                let accept = zoneElement.data('accept');
                let ratio = zoneElement.data('ratio');
                let wizard = zoneElement.data('wizard');
                let wizardTitle = zoneElement.data('wizard-title');
                let wizardDescription = zoneElement.data('wizard-desc');
                let wizardTags = zoneElement.data('wizard-tag');
                let limitCount = zoneElement.data('limit-count');
                let limitSize = zoneElement.data('limit-size');
                let editMode = zoneElement.data('edit-mode');
                let editType = zoneElement.data('edit-type');
                let viewMore = zoneElement.data('view-more');
                // get default use in getData function. you can set default with data-default

                // This condition checks if events have already been set on the element
                if(zoneElement.data('detect')) return;
                zoneElement.attr('data-detect',true);

                // open file browser
                zoneElement.on('click', function () {
                    if(editMode){
                        let formatDesc = '';
                        if(editType === 'photo') formatDesc = 'PNG, JPG';
                        else if(editType === 'video') formatDesc = 'MP4';
                        else if(editType === 'audio') formatDesc = 'MP3';
                        else formatDesc = accept;
                        new MediaLibrary({
                            type: editType,
                            accept: accept.split(','),
                            openOnLibrary: true,
                            limitSize: limitSize === undefined? 10 : parseFloat(limitSize),
                            cropRatio: ratio === undefined? [] : ratio,
                            saveUrl: 'https://liliana.asensive.ir/api/uploadphoto/',
                            fetchUrl: 'https://liliana.asensive.ir/api/gallery/photo/',
                            uploadUrl: 'https://liliana.asensive.ir/api/gallery/photo-upload',
                            translate: {
                                uploadZoneTitle: `<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> ${editType}`,
                                uploadZoneDescription: `Allowed format: ${formatDesc} (Up to: 1 photo/${limitSize} Mb)`,
                            },
                            onSave: function(_data){
                                pushData(_data);
                                updatePreview();
                            },
                        });
                        return;
                    }

                    if(checkLimitCount()) selectFile();
                });

                // Identifying when a dragged file is placed on the element
                zoneElement.on('dragover', function (e) {
                    e.preventDefault();
                    zoneElement.addClass('active--draged');
                });

                // Cancel the drag
                zoneElement.on('dragleave dragend', function (e) {
                    zoneElement.removeClass('active--draged');
                });

                // Identify the dragged files and upload them
                zoneElement.on('drop', function (e) {
                    e.preventDefault();

                    let files = e.originalEvent.dataTransfer.files;
                    const format = files[0].name.match(/\.([a-zA-Z0-9]+)$/);

                    // check limit count
                    if(checkLimitCount()){
                        if(files.length === 1){
                            selectFile(files);
                        }else{
                            let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                            let popup = addAlertPopup({
                                class: '',
                                type: 'icon', // icon or avatar
                                status: 'danger', // success, danger, info or warning
                                title: `You can only drop one file`,
                                actionElements: [btnOk], // element object
                                actionLayout: 'horizontal', // horizontal or vertical
                            });

                            btnOk.on('click', function () {
                                popup.distory();
                            });
                        }
                    }

                    zoneElement.removeClass('active--draged');
                });

                // add reset view listener
                zoneElement.on('reset',function(){
                    updatePreview();
                })

                // click on change file, for use set data-limit-count = 1
                uploadZoneFile.on('click','.change-image',function(){

                    if(editMode){
                        const data = getData();

                        let formatDesc = '';
                        if(data[0].type === 'photo') formatDesc = 'PNG, JPG';
                        else if(data[0].type === 'video') formatDesc = 'MP4';
                        else if(data[0].type === 'audio') formatDesc = 'MP3';
                        new MediaLibrary({
                            type: data[0].type,
                            data: {
                                id: data[0].id,
                            },
                            openOnLibrary: true,
                            limitSize: limitSize === undefined? 10 : parseFloat(limitSize),
                            cropRatio: ratio === undefined? [] : ratio,
                            saveUrl: 'https://liliana.asensive.ir/api/uploadphoto/',
                            fetchUrl: 'https://liliana.asensive.ir/api/gallery/photo/',
                            uploadUrl: 'https://liliana.asensive.ir/api/gallery/photo-upload',
                            translate: {
                                uploadZoneTitle: `<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> ${data[0].type}`,
                                uploadZoneDescription: `Allowed format: ${formatDesc} (Up to: 1 photo/${limitSize} Mb)`,
                            },
                            onSave: function(_data){
                                updateData(data[0].id, _data);
                                updatePreview();
                            },
                        });
                        return;
                    }

                    selectFile();
                })

                // This command applies the default value if defined
                if(zoneElement.attr('data-default')){
                    updateInputValue();
                    updatePreview()
                }

                // This file checks whether the number of uploaded files has been completed or not
                // The return value of true means to be allowed to select the file
                function checkLimitCount(){
                    const count = inputElement.val().trim() === ''? 0 : inputElement.val().split(',').length;

                    if(count >= (limitCount === undefined? 1 : limitCount)){
                        let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                        let popup = addAlertPopup({
                            class: '',
                            type: 'icon', // icon or avatar
                            status: 'danger', // success, danger, info or warning
                            title: `You are allowed to upload ${limitCount} photos`,
                            actionElements: [btnOk], // element object
                            actionLayout: 'horizontal', // horizontal or vertical
                        });

                        btnOk.on('click', function () {
                            popup.distory();
                        });

                        // no allow
                        return false;
                    }

                    // allowed
                    return true;
                }

                // This function is used to get default information. With each update, this information is updated and
                // you can receive the updated data
                function getData(){
                    let data = [];

                    try {
                        data = JSON.parse(zoneElement.attr('data-default'));
                    }catch (e){ data = []; }

                    return data;
                }

                // This function is used to add a value
                function pushData(data){
                    const currentData = limitCount === 1? [] : getData();
                    currentData.push(data);

                    inputElement.val(currentData.map(function(item){return item.id}).join(',')).trigger('change');
                    zoneElement.attr('data-default', JSON.stringify(currentData));
                }

                // This function is used to update a value
                function updateData(id, data){
                    let currentData = getData();
                    currentData = currentData.map(function(item){
                        if(item.id === id) return data;
                        else return item;
                    })

                    inputElement.val(currentData.map(function(item){return item.id}).join(',')).trigger('change');
                    zoneElement.attr('data-default', JSON.stringify(currentData));
                }

                // This function is used to remove a value
                function removeData(id){
                    let currentData = getData();
                    currentData = currentData.filter(function(item){return item.id !== id});

                    inputElement.val(currentData.map(function(item){return item.id}).join(',')).trigger('change');
                    zoneElement.attr('data-default', JSON.stringify(currentData));
                    return currentData;
                }

                // This function is for updating the input value, it is usually used for the default value
                function updateInputValue(){
                    const currentData = getData();
                    inputElement.val(currentData.map(function(item){return item.id}).join(',')).trigger('change');
                }

                // This function is responsible for calling FileSelector and setting its events and default values
                function selectFile(files = null){
                    new FileSelector(
                        {
                            files: files,
                            ratio: ratio === undefined? [] : ratio.split(','),
                            accept: accept === undefined? ['*'] : accept.split(','),
                            limitSize: limitSize === undefined? 10 : parseFloat(limitSize),
                            wizard: wizard,
                            upload: true,
                            uploadUrl: 'https://liliana.asensive.ir/api/uploadphoto/',
                            title: wizardTitle,
                            description: wizardDescription,
                            tags: wizardTags,
                            onUpload: function(response, file, data){
                                pushData(response)
                                updatePreview();
                            }
                        }
                    );
                }

                // build preview
                function updatePreview(){
                    const data = getData();

                    // reset upload zone file
                    uploadZoneFile.find('> *').remove();

                    // It shows the remaining amount of files that can be uploaded
                    zoneElement.find('.limit-count').html(limitCount - data.length);

                    if(data.length === 0) {
                        uploadZoneFile.removeClass('active');
                        zoneElement.show();
                        return;
                    }

                    // foreach on items for add in preview
                    data.reverse().forEach(function(item,index){

                        if(viewMore){
                            if(index === 5){
                                let moreElement = $('<button type="button" class="upload-item btn-see-all-uploaded"><span>See all uploaded photos</span></button>');
                                uploadZoneFile.append(moreElement);
                                moreElement.on('click', function () {

                                    let moreBox = $(`<div class="upload-drop-zone-more-file">
                                        <div class="overlay"></div>
                                        <div class="upload-content">
                                            <div class="upload-header">
                                                <div class="upload-title">Your Photos:</div>
                                                <button type="button" class="btn btn-icon btn-close">
                                                    <i class="icon-close"></i>
                                                </button>
                                            </div>
                                            <div class="upload-inner-content"></div>
                                        </div>
                                    </div>`);

                                    data.forEach(function (_item) {
                                        moreBox.find('.upload-inner-content').append(getPreviewItem(_item));
                                    });

                                    moreBox.find('.overlay, .btn-close').on('click', function () {
                                        moreBox.removeClass('visible');
                                        setTimeout(function () {
                                            moreBox.remove();
                                        }, 160);
                                    })

                                    $('body').append(moreBox);
                                    setTimeout(function () {
                                        moreBox.addClass('visible');
                                    }, 3);

                                })
                                return;
                            } else if(index > 5) return;
                        }

                        // append to upload zone
                        uploadZoneFile.append(getPreviewItem(item));

                    })

                    // check is single mode
                    if(limitCount === 1){
                        zoneElement.hide();
                        uploadZoneFile.append(`<button class="btn btn-full btn-icon-left change-image" type="button"><span>Change ${label[0] ? label.html() : 'Photo'}<i class="icon-refresh-ccw"></i></span></button>`);
                    }

                    // show upload zone file
                    uploadZoneFile.addClass('active');
                    initAudioCard();

                }

                // build item preview
                function getPreviewItem(item){

                    const removeButton = $('<button type="button" class="btn btn-icon remove"><i class="icon-trash"></i></button>');
                    const editButton = $('<button type="button" class="btn btn-icon edit"><i class="icon-edit"></i></button>');
                    let itemElement = $(`<div class="upload-item"></div>`);

                    if(['photo','video'].includes(item.type)) itemElement.append(`<img src="${item.thumbnail}" alt="${item.thumbnail}"/>`);
                    else if(item.type === 'audio') itemElement.append(` <div class="audio-card" data-src="${item.url}">
                        <div class="card-content">
                            <div class="card-title" itemprop="name">${item.name}</div>
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
                    </div>`);
                    else itemElement.append(`<div class="other-file"><i class="icon-document"></i><div class="file-name">${item.name}</div></div>`);

                    if(limitCount !== 1) itemElement.append(removeButton);
                    if(editMode) itemElement.append(editButton);

                    // add event to remove button
                    removeButton.on('click', function () {
                        const loading = $('<div class="item-loading"><div class="loader-mini"></div>');

                        itemElement.append(loading);
                        $.ajax({
                            url: 'https://liliana.asensive.ir/api/uploadphoto/',
                            type: "POST",
                            data: item.id,
                            success: function(data) {
                                itemElement.remove();
                                removeData(item.id);
                                updatePreview();
                            },
                            error: function(error){
                                loading.remove();
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

                    })

                    // add event to edit button
                    editButton.on('click',function(){
                        let formatDesc = '';
                        if(item.type === 'photo') formatDesc = 'PNG, JPG';
                        else if(item.type === 'video') formatDesc = 'MP4';
                        else if(item.type === 'audio') formatDesc = 'MP3';
                        new MediaLibrary({
                            type: item.type,
                            data: {
                                id: $(this).data('id'),
                            },
                            openOnLibrary: true,
                            limitSize: limitSize === undefined? 10 : parseFloat(limitSize),
                            cropRatio: ratio === undefined? [] : ratio,
                            useTitle: item.type === 'photo'? false : true,
                            saveUrl: 'https://liliana.asensive.ir/api/uploadphoto/',
                            fetchUrl: 'https://liliana.asensive.ir/api/gallery/photo/',
                            uploadUrl: 'https://liliana.asensive.ir/api/gallery/photo-upload',
                            translate: {
                                uploadZoneTitle: `<b>Click to upload</b> <span class="visible-desktop">or drag and drop</span> ${item.type}`,
                                uploadZoneDescription: `Allowed format: ${formatDesc} (Up to: 1 photo/${limitSize} Mb)`,
                            },
                            onSave: function(data){
                                updateData(item.id, data);
                                updatePreview();
                            },
                        });
                    })

                    return itemElement;

                }

            });
        }

        // detect and control dependency
        // The elements that use dependency are hidden and displayed based on the specified value and the value of
        // the linked field.
        initDependencyCheck();
        function initDependencyCheck(){
            $('[data-dependency]').each(function () {

                let item = $(this);
                let dependency = item.data('dependency');
                let activeValue = item.data('dependency-value');
                let activeValuePart = activeValue.split(',')
                let dependencyIsNot = item.data('dependency-is-not');
                let deepCheck = item.data('deep-check');
                let input = $(dependency);

                if(item.data('dependency-check')) return;
                item.attr('data-dependency-check',true);

                /**
                 * Check element dependency and hide and show it
                 */
                function controlDependency(isInitialize = false) {
                    let checkInput = input;
                    let comparisonValue;

                    // This is to check the empty value. If there is no value, the element will be displayed
                    if(activeValue === 'tempCheck'){
                        if(dependencyIsNot? (checkInput.val().trim() !== '') : (checkInput.val().trim() === '')){
                            item.hide();
                            dependencyDeepCheck(item, false, isInitialize);
                            item.attr('data-dependency-show', 'false');
                        }else{
                            item.show();
                            dependencyDeepCheck(item, true);
                            item.attr('data-dependency-show', 'true');
                        }
                        return;
                    }

                    // check type dependency
                    if (jQuery.inArray(input.attr('type'), ['radio', 'checkbox']) !== -1) {
                        checkInput = $(`${dependency}:checked`);
                        if (checkInput.val()) comparisonValue = checkInput.val(); else comparisonValue = checkInput.length > 0 ? 'on' : 'off';
                    } else if(input.parents('.field').data('type') === 'select' && input.parents('.field').hasClass('multiple')){
                        const nval = input.val().split(',');
                        if(nval.indexOf(activeValue) >= 0){
                            item.show();
                            item.attr('data-dependency-show', 'true');
                        }else{
                            item.hide();
                            clearFieldValue(item, isInitialize);
                            item.attr('data-dependency-show', 'false');
                        }
                        return;
                    } else comparisonValue = checkInput.val();

                    if(dependencyIsNot == true){
                        if (!activeValuePart.includes(comparisonValue)) {
                            item.show();
                            dependencyDeepCheck(item, true);
                            item.attr('data-dependency-show', 'true');
                        } else {
                            item.hide();
                            clearFieldValue(item, isInitialize);
                            dependencyDeepCheck(item, false, isInitialize);
                            item.attr('data-dependency-show', 'false');
                        }
                    }else{
                        if (activeValuePart.includes(comparisonValue)) {
                            item.show();
                            dependencyDeepCheck(item, true);
                            item.attr('data-dependency-show', 'true');
                        } else {
                            item.hide();
                            clearFieldValue(item, isInitialize);
                            dependencyDeepCheck(item, false, isInitialize);
                            item.attr('data-dependency-show', 'false');
                        }
                    }

                }

                function dependencyDeepCheck(_element, isShow = false, isInitilize = false){
                    const inputsSelected = _element.find('input');

                    if(deepCheck === false) return;

                    // check input
                    inputsSelected.each(function(){
                        const _input = $(this);
                        const _id = _input.attr('id');

                        // check use id
                        if(_id === undefined) return;

                        // get linked
                        const _linked = $(`[data-dependency="#${_id}"]`);

                        if(_linked.length === 0) return;

                        if(isShow) _input.trigger('dependencyCheck');
                        else {
                            _linked.hide();
                            clearFieldValue(_linked, isInitilize);
                            _linked.attr('data-dependency-show', 'false');
                        }

                    });
                }

                // Using this function causes the fields inside the element to reset their values depending on its type
                function clearFieldValue(_element, reject = false){
                    if(reject) return;

                    const fields = _element.find('.field');
                    fields.each(function () {
                        const field = $(this);
                        const type = field.data('type');
                        const _d_input = field.find('input, textarea');

                        switch (type) {
                            case 'text':
                            case 'number':
                            case 'textarea':
                            case 'date':
                            case 'time':
                                _d_input.val('').trigger('change');
                                break;
                            case 'radio':
                                $(`input[name="${_d_input.attr('name')}"]`).prop('checked', false).trigger('change');
                                break;
                            case 'select':
                                _d_input.val('').trigger('reset');
                                break;
                            case 'checkbox':
                                _d_input.prop('checked', false).trigger('change');
                                break;
                            case 'upload':
                                field.find('.upload-drop-zone').attr('data-default', '');
                                _d_input.val('').trigger('reset');
                                break;
                        }

                    });
                    _element.find('.table-repeater input').val('');
                    _element.find('.table-repeater').trigger('rebuild');
                    _element.find('.table-repeater .repeater-table').removeClass('error');
                    fields.removeClass('field--invalid field--valid');
                    _element.find('.field-error-msg').removeClass('active');
                }

                // set default
                controlDependency(true);

                // on change trigger input
                input.on('change reset keyup', function () {
                    controlDependency();

                    // update select options position
                    if(input.parents('.field-type-select').length > 0){
                        input.parents('.field-type-select').find('.field-select-options').trigger('reset');
                    }
                });

                // run check dependency
                input.on('dependencyCheck', function () {
                    controlDependency();
                });

            });
        }

        const geoUserName = 'mohammadsh79'; // username on https://geonames.org
        const geoLang = 'en'; // This value is only used for countries other than Japan
        const postCodeKey = 'JVyKK7xeWVxTXReJVXOhiuNWTo1tt0FcGbBlTb3';

        function fetchJapanStates(){
            const stateItems = [];

            // get Japan state
            new ApiRequest({
                type: 'GET',
                url: `https://apis.postcode-jp.com/api/v5/prefectures/?apikey=${postCodeKey}`,
                success: function (resp) {
                    resp['data'].forEach(function(item){
                        stateItems.push({
                            id: item.prefCode,
                            value: item.prefCode,
                            text: item.pref,
                            color: null,
                            flag: null,
                        })
                    })
                    const stateElement = $('input#state');
                    stateElement.parents('.field').attr('data-options',JSON.stringify(stateItems));
                    stateElement.val('').trigger('reset');
                    stateElement.trigger('optionsReset').trigger('change');
                }
            });

        }

        function fetchJapanCity(code){
            const cityItems = [];

            // get Japan state
            new ApiRequest({
                type: 'GET',
                url: `https://apis.postcode-jp.com/api/v5/prefectures/${code}/cities/?&apikey=${postCodeKey}`,
                success: function (resp) {
                    resp['data'].forEach(function(item){
                        cityItems.push({
                            id: item.cityCode,
                            value: item.cityCode,
                            text: item.city,
                            color: null,
                            flag: null,
                        })
                    })
                    const cityElement = $('input#city');
                    cityElement.parents('.field').attr('data-options',JSON.stringify(cityItems));
                    cityElement.val('').trigger('reset');
                    cityElement.trigger('optionsReset').trigger('change');
                }
            });
        }

        function fetchGeonameChildrenJson(code, element){
            const items = [];

            // get Japan state
            new ApiRequest({
                type: 'GET',
                url: `https://liliana.asensive.ir/api/geoname/children/?geonameId=${code}&username=${geoUserName}&lang=${geoLang}`,
                success: function (resp) {
                    resp['geonames'].forEach(function(item){
                        items.push({
                            id: item.geonameId,
                            value: item.geonameId,
                            text: item.name,
                            color: null,
                            flag: null,
                        })
                    })
                    element.parents('.field').attr('data-options',JSON.stringify(items));
                    element.val('').trigger('reset');
                    element.trigger('optionsReset').trigger('change');
                }
            });
        }

        // change country, state and city
        $(document).on('change','input#country',function(){
            const value = $(this).val();
            const stateInput = $('input#state');
            const cityInput = $('input#city');
            stateInput.trigger('clear');
            cityInput.trigger('clear');

            // fetch items if is not Japan
            if(value !== '1861060' && value.trim() !== ''){
                fetchGeonameChildrenJson(value, stateInput);
            }else{
                fetchJapanStates();
            }

        })

        // change country, state and city
        $(document).on('change','input#state',function(){
            const value = $(this).val();
            const cityInput = $('input#city');
            cityInput.trigger('clear');

            if($('input#country').val() !== '1861060' && value.trim() !== ''){
                fetchGeonameChildrenJson(value, cityInput);
            }else if(value.trim() !== ''){
                cityInput.attr('data-default-value', '');
                fetchJapanCity(value);
            }

        })

        let zipcodeTimer = null;
        // change zipcode
        $(document).on('change input','input#zipcode',function(){
            const value = $(this).val();

            // check country is Japan
            if($('input#country').val() !== '1861060') return;

            // Limit definition. If there are more than 3 characters, the request will be sent
            if(value.length < 3){
                $('input#state').val('').trigger('reset');
                $('input#city').val('').trigger('reset');
                return;
            }

            clearTimeout(zipcodeTimer);
            zipcodeTimer = setTimeout(function(){
                // send request for zipcode
                $.ajax({
                    type: 'GET',
                    url: `https://apis.postcode-jp.com/api/v5/postcodes/${value}?apikey=${postCodeKey}`,
                    contentType: "application/json",
                    dataType: 'json',
                    success: function (resp) {
                        // set state
                        const stateInput = $('input#state');
                        stateInput.val(resp[0]['prefCode']);
                        stateInput.attr('data-default-value', resp[0]['prefCode']);
                        stateInput.val(resp[0]['prefCode']).trigger('reset').trigger('change');

                        // set city
                        const cityInput = $('input#city');
                        cityInput.val(resp[0]['cityCode']);
                        cityInput.attr('data-default-value', resp[0]['cityCode']);
                        cityInput.val(resp[0]['cityCode']).trigger('reset').trigger('change');

                        // set area
                        const areaInput = $('input#area');
                        areaInput.val(resp[0]['town']).trigger('change');
                    },
                    error: function(xhr, status, error){
                        console.log(error)
                    }
                });
            },600);

        })

        // job experiences open popup (click on button form)
        $(document).on('click','#job_experience_open_main_popup',function(){
            $('#table_job_experiences_manual').trigger('openPopup');
        })

        // job experiences switch tab on manual
        $(document).on('click','.btn-job-exp-manual',function(){
            const manualElement = $('#table_job_experiences_manual');
            const pdfElement = $('#table_job_experiences_pdf');
            pdfElement.trigger('closePopup');
            manualElement.trigger('openPopup');
        })

        // job experiences switch tab on by pdf
        $(document).on('click','.btn-job-exp-pdf',function(){
            const manualElement = $('#table_job_experiences_manual');
            const pdfElement = $('#table_job_experiences_pdf');
            const exclusive = manualElement.data('exclusive');
            const exclusiveValue = manualElement.data('exclusive-value');
            let manualData = [];

            try{
                manualData = JSON.parse(manualElement.find('input').val());
            } catch (e) {}

            if(manualData.length > 0 && manualData[0][exclusive].input === exclusiveValue){
                $('#job_exp_switch_1').addClass('active');
                $('#job_exp_switch_2').removeClass('active');
                let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                let popup = addAlertPopup({
                    class: '',
                    type: 'icon', // icon or avatar
                    status: 'danger', // success, danger, info or warning
                    title: 'There are no pdf upload conditions',
                    actionElements: [btnOk], // element object
                    actionLayout: 'horizontal', // horizontal or vertical
                });
                btnOk.on('click', function () {
                    popup.distory();
                });
                return;
            }

            manualElement.trigger('closePopup');
            pdfElement.trigger('openPopup');
        })

        //set default
        if($('#job_experiences').length > 0){
            const mainTableElement = $('#table_job_experiences_pdf');
            const fileTableElement = $('#table_job_experiences_manual');

            if(!mainTableElement.hasClass('is-empty')){
                fileTableElement.data('required', false);
            } else if(!fileTableElement.hasClass('is-empty')){
                mainTableElement.data('required', false);
            }

        }

        // check job experiences input
        // This event is to check the mandatory dependency of job experiences table and job experiences pdf file field.
        $(document).on('change','input#job_experiences',function(){
            const tableElement = $('#table_job_experiences_pdf');

            if($(this).parents('.table-repeater').hasClass('is-empty')){
                tableElement.data('required', true);
            }else {
                tableElement.data('required', false);
                tableElement.find('.repeater-table').removeClass('error');
            }
        })

        // check job experiences pdf file input
        // This event is to check the mandatory dependency of job experiences table and job experiences pdf file field.
        $(document).on('change','input#job_experiences_pdf',function(){
            const tableElement = $('#table_job_experiences_manual');

            if($(this).parents('.table-repeater').hasClass('is-empty')){
                tableElement.data('required', true);
            }else {
                tableElement.data('required', false);
                tableElement.find('.repeater-table').removeClass('error');
            }
        })

        // open popup for image preview
        // This is a feature and every German has this class and has set the data structure correctly,
        // a popup will open by clicking on it.
        $(document).on('click','.image-preview-eye-button',function(){
            try {
                let imagesList = [];
                const view = $(`<div class="image-preview-eye-popup">
                    <div class="preview-inner-wrapper">
                        <div class="preview-title">Preview</div>
                        <div class="preview-content"><div class="preview-grid"></div></div>
                        <div class="preview-footer"><button type="button" class="btn btn-primary ok">Ok</button></div>
                    </div>
                    <div class="preview-overlay"></div>
                </div>`);

                imagesList = JSON.parse($(this).attr('data-images'));
                view.find('.preview-grid').attr('data-count',imagesList.length);
                imagesList.forEach(function(item){
                    try{
                        const url = new URL(item);
                        const fileFormatMatch = item.match(/\.([a-zA-Z0-9]+)$/);
                        if(['png','jpg','jpeg','webp','gif'].includes(fileFormatMatch[1])) {
                            view.find('.preview-content').addClass('photo');
                            view.find('.preview-grid').append(`<div class="grid-item"><a href="${item}" target="_blank"><img src="${item}" alt="${item}"/></a></div>`);
                        }
                        else if(['mp4','webm'].includes(fileFormatMatch[1])) {
                            view.find('.preview-content').addClass('video');
                            view.find('.preview-grid').append(`<div class="grid-item"><video autoplay loop controls><source src="${item}" type="video/mp4"></video></div>`);
                        }
                        else if(['mp3'].includes(fileFormatMatch[1])) {
                            view.find('.preview-content').addClass('audio');
                            view.find('.preview-grid').append(`<div class="grid-item"><audio controls><source src="${item}" type="audio/mpeg"></audio></a></div>`);
                        }
                        else {
                            view.find('.preview-content').addClass('other');
                            view.find('.preview-grid').attr('data-count',1);
                            view.find('.preview-grid').append(`<div class="grid-item"><a href="${item}" target="_blank" class="text-view">${item}</a></div>`);
                        }
                    }catch (e) {
                        view.find('.preview-content').addClass('other');
                        view.find('.preview-grid').attr('data-count',1);
                        view.find('.preview-grid').append(`<div class="grid-item"><span class="text-view">${item}</span></div>`);
                    }
                })

                view.on('click','.preview-footer .ok, .preview-overlay', function(){
                    view.remove();
                })

                $('body').append(view);
            }catch (e) {}
        })

        // In many places, we need to check the range of numbers in the input and control certain min and max
        // so that it does not go out of this range.
        $(document).on('input change', '.input-range-controller', function(){
            const min = parseFloat($(this).attr('min'));
            const max = parseFloat($(this).attr('max'));
            const val = parseFloat($(this).val());

            if($(this).attr('min') !== undefined && val < min){
                $(this).val(min);
            }

            if($(this).attr('max') !== undefined && val > max){
                $(this).val(max);
            }

        })

    });
})(jQuery);

// This method detects the audio cards of the page and sets the events related to the sound. Duplicate cards can be
// identified and events are not applied to them again
function initAudioCard(){
    $('.audio-card').each(function () {

        const card = $(this);
        const src = card.data('src');
        let audio = new Audio();
        let volume = 1;

        // detect duplicated element
        if(card.data('detect')) return;
        card.attr('data-detect', true);

        // This event is executed with every audio time update. Progress bar is also used to control and update progress
        audio.addEventListener('timeupdate',function (){

            // calculating current time to percent
            let currentTime = (this.currentTime / this.duration) * 100;

            // change status
            card.find('.slider-control .slider-track-process').width(currentTime + '%');
            card.find('.slider-control input').val(currentTime? currentTime : 0);
            card.find('.card-time span:eq(0)').html(sToTime(this.currentTime));
            if(this.duration) card.find('.card-time span:eq(1)').html(sToTime(this.duration));

            // check end audio
            if (this.ended) {
                card.removeClass('play');
            }

        })

        // This event is executed when the file is being loaded
        audio.addEventListener('waiting',function(){
            card.find('.card-loading').css('display','flex');
        })

        // This event is executed when the file is loaded
        audio.addEventListener('canplay',function(){
            card.find('.card-loading').hide();
        })

        // Change the current tense using the range
        card.find('.slider-control input').on('input', function () {

            // check audio loaded
            if(audio.src === ''){
                audio.src = src;
                audio.load();
            }

            if (audio) {
                card.find('.slider-control .slider-track-process').width($(this).val() + '%');
                audio.currentTime = (audio.duration * $(this).val()) / 100;
                card.find('.card-time span:eq(0)').html(sToTime(audio.currentTime));
                if(this.duration) card.find('.card-time span:eq(1)').html(sToTime(audio.duration));
            }
        });

        // Change the current tense using the range
        card.find('.card-volume input').on('input', function () {
            volume = parseFloat($(this).val());
            audio.volume = volume;
            card.find('.card-volume .slider-track-process').width((audio.volume * 100) + '%');

            if(volume === 0){
                card.find('.volume-mute-btn').show();
                card.find('.volume-on-btn').hide();
            }else{
                card.find('.volume-on-btn').show();
                card.find('.volume-mute-btn').hide();
            }
        });

        // play audio
        card.find('.play-btn').on('click', function () {

            // check audio loaded
            if(audio.src === ''){
                audio.src = src;
                audio.load();
            }

            // pause any audio card
            $('.audio-card').trigger('pause');

            // play audio
            audio.play();
            card.addClass('play');

        });

        // pause audio
        card.find('.pause-btn').on('click', function () {
            audio.pause();
            card.removeClass('play');
            card.find('.card-loading').hide();
        });

        // volume mute audio
        card.find('.volume-mute-btn').on('click', function () {
            audio.volume = volume;
            card.find('.card-volume input').val(volume);
            card.find('.card-volume .slider-track-process').width((volume * 100) + '%');
            card.find('.volume-on-btn').show();
            $(this).hide();
        });

        // volume on audio
        card.find('.volume-on-btn').on('click', function () {
            audio.volume = 0;
            card.find('.card-volume input').val(0);
            card.find('.card-volume .slider-track-process').width('0%');
            card.find('.volume-mute-btn').show();
            $(this).hide();
        });

        // destroy audio listener
        card.on('destroy', function () {
            audio.pause();
            audio = undefined;
            card.removeClass('play');
            card.find('.card-loading').hide();
        });

        // pause audio listener
        card.on('pause', function () {
            audio.pause();
            card.removeClass('play');
            card.find('.card-loading').hide();
        });

        // Convert time to formatted display time. example: 1000 => 16:40
        function sToTime(t) {
            // for hour add this code to first padZero(parseInt((t / (60 * 60)) % 24))
            return padZero(parseInt((t / (60)) % 60)) + ":" + padZero(parseInt((t) % 60));
        }

        // Format single digit numbers to 2 digits. example: 2 to 02
        function padZero(v) {
            return (v < 10) ? "0" + v : v;
        }

    });
}

/**
 * This function is designed to detect fields and set events and initial configurations.
 *
 * Each time this function is executed, the divs that have the "field" class will be identified.
 * If you want to add a new element that has a field in it in html using javascript, you must call this function again
 * to identify those fields.
 */
function fieldDetector() {
    $('.field').each(function () {

        let _this = $(this);
        let input = _this.find('input'); // select input for save data
        // The type of fields is determined by attributes, but for some fields such as select, slider and multi slider,
        // it is of class type.
        let fieldType = _this.data('type'); // get field type
        let normalInput = _this.hasClass('field-type-nr-input');

        // check field if is before detected
        if (_this.data('field-detect')) return true; else _this.attr('data-field-detect', 'true');

        // set id
        _this.attr('id', uid());

        // check type is textarea
        if (_this.hasClass('field-type-text-area')) {
            input = _this.find('textarea');
            normalInput = true;
        }

        // check type field
        switch (fieldType) {

            case 'text':
            case 'number':
            case 'textarea':

                // check empty value
                if (input.val() != '') _this.addClass('field--lv-label');

                // focus input
                input.on('focus', function () {
                    _this.addClass('field--focus field--lv-label');
                });

                // blur input
                input.on('blur', function () {
                    _this.removeClass('field--focus');

                    // check empty input
                    if ($(this).val() === '') _this.removeClass('field--lv-label');

                    // check validation
                    const proValidation = new ProValidation();
                    proValidation.singleValidate(_this[0]);
                });

                // change input
                input.on('change', function () {
                    if ($(this).val() != '') _this.addClass('field--lv-label'); else _this.removeClass('field--lv-label');
                });

                // input event
                input.on('input', function () {
                    let maxLength = parseInt(_this.attr('data-max-length'));
                    let currentLength = $(this).val().length;

                    if (currentLength > maxLength) {
                        $(this).val($(this).val().substring(0, maxLength));
                    }
                });

                // check validation in change input
                input.on('keyup change', function () {
                    const proValidation = new ProValidation();
                    proValidation.singleValidate(_this[0]);
                });

                break;
            case 'radio':

                input.on('change', function () {
                    const element = $(this);
                    const name = element.attr('name');

                    $(`[name="${name}"]`).parents('.field').removeClass('field--invalid');
                    element.parents('.field-group-validations').find('.field-error-msg').hide();
                });

                break;
            case 'checkbox':
                input.on('change', function () {
                    // check validation
                    const proValidation = new ProValidation();
                    proValidation.singleValidate(_this[0]);
                });

                break;
            case 'upload':
                input.on('change', function () {
                    // check validation
                    const proValidation = new ProValidation();
                    proValidation.singleValidate(_this[0]);
                });

                break;
            case 'date':
            case 'time':
                // check empty value
                if (input.val() !== '') _this.addClass('field--lv-label');
                break;
            default:
                break;

        }

        // check type select
        if (_this.hasClass('field-type-select')) {

            // config
            let options = [];
            let customHtmlContent = null;
            let select = _this.find('select');
            let selectDefaultValue = select.attr('data-default-value');
            let isCustomHtml = _this.data('custom-html');
            let isMultiSelect = _this.find('select').attr('multiple') ? true : false;
            let defaultText = _this.data('field-defualt-text');
            let content = _this.find('.field-content');
            let selectSlide = null;

            // elements
            let input = $('<input type="hidden">');
            let optionSelected = $('<div class="field-option-selected"></div>');
            let buttonAreaLabel = _this.find('label').clone();
            buttonAreaLabel.find('> *').remove();
            let button = $(`<button type="button" class="field-event-box" aria-label="Open ${buttonAreaLabel.html()} Select"></button>`);

            if(isMultiSelect){
                _this.addClass('multiple');
            }

            if(selectDefaultValue){
                input.attr('data-default-value', selectDefaultValue)
            }

            if (_this.data('source')) {
                let vl = select.attr('data-default-value');
                let isEnableDefaultSelected = vl ? select.attr('data-default-value').split(',') : [];
                new ApiRequest({
                    url: _this.data('source'), success: function (res) {
                        options = [];
                        res.forEach(function (item) {
                            options.push({
                                id: item.id,
                                text: item.text,
                                value: item.value,
                                color: item.color,
                                flag: item.flag,
                                isSelected: $.inArray(item.value, isEnableDefaultSelected) == -1 ? false : true,
                            });
                        });

                        // sort A-z
                        options.sort((a, b) => a.text.localeCompare(b.text));
                        detectedItemSelected();
                    }
                });
            } else {
                let isEnableDefaultSelected = [];
                _this.find('select option[selected]').each(function () {
                    isEnableDefaultSelected.push($(this).val());
                });
                // detect options and add value in options object
                _this.find('select option').each(function () {
                    let _option = $(this);
                    options.push({
                        id: $(this).attr('value'),
                        text: $(this).html(),
                        value: $(this).attr('value'),
                        color: $(this).data('color'),
                        flag: $(this).data('flag'),
                        isSelected: $.inArray($(this).attr('value'), isEnableDefaultSelected) == -1 ? false : true,
                    });
                });
            }

            input.on('clear', function () {
                options = [];
                input.val('').trigger('change');
                detectedItemSelected();
            })

            input.on('sourceReset', function () {
                if (_this.attr('data-source')) {
                    let vl = input.attr('data-default-value');
                    let isEnableDefaultSelected = vl ? input.attr('data-default-value').split(',') : [];
                    options = [];
                    new ApiRequest({
                        url: _this.attr('data-source'), success: function (res) {
                            for (let item of Object.values(res)) {
                                options.push({
                                    id: item.id,
                                    text: item.text,
                                    value: item.value,
                                    color: item.color,
                                    flag: item.flag,
                                    isSelected: $.inArray(item.value, isEnableDefaultSelected) == -1 ? false : true,
                                });
                            }

                            // sort A-z
                            options.sort((a, b) => a.text.localeCompare(b.text));
                            detectedItemSelected();
                        }
                    });
                }
            })

            input.on('optionsReset', function () {
                try {
                    const attrOptions = _this.attr('data-options');
                    const newOptions = JSON.parse(attrOptions);
                    const dataDefaultValue = input.attr('data-default-value');
                    const isEnableDefaultSelected = dataDefaultValue? dataDefaultValue : [];

                    options = [];
                    newOptions.forEach(function(item){
                        options.push({
                            id: item.id,
                            text: item.text,
                            value: item.value,
                            color: item.color,
                            flag: item.flag,
                            isSelected: isEnableDefaultSelected.includes(item.value),
                        });
                    });

                    // sort A-z
                    options.sort((a, b) => a.text.localeCompare(b.text));
                    detectedItemSelected();

                }catch (e) {
                    console.log('Note that the data-options attribute exists and its value structure is correct. (The value structure is an array whose items are objects similar to the use of data-source)')
                    console.log(e);
                }
            })

            optionSelected.on('click','.option-remove',function(){
                const index = $(this).data('index');
                options[index].isSelected = false;
                detectedItemSelected();
                fieldValidator();
            })

            // functions
            function detectedItemSelected() {
                let temp = [];
                let tempLabel = [];

                options.forEach(function (item) {
                    if (item.isSelected) {
                        temp.push(item.id);
                        tempLabel.push(item.text);
                    }
                });

                renderTextOptionSelected();
                input.attr('data-label', tempLabel.join(', '));
                input.val(temp.join(',')).trigger('change');
                _this.attr('data-item-count', options.length);
            }

            // change all items status
            function changeItemsSelectedStatus(selected) {
                options.forEach(function (item) {
                    item.isSelected = selected;
                });
            }

            function renderTextOptionSelected() {
                let temp = [];
                let tempOut = [];

                options.forEach(function (item, index) {
                    if (item.isSelected) {
                        let tempItem = '';

                        if(isMultiSelect) tempItem += `<div class="selected-item"><i class="icon-close option-remove" data-index="${index}"></i>`;

                        if (item.flag) tempItem += `<img class="option-icon" src="${item.flag}">`;
                        if (item.color) tempItem += `<div class="option-color" style="background-color:${item.color};"></div>`;
                        tempItem += `<span>${item.text}</span>`;
                        if(isMultiSelect) tempItem += '</div>';

                        tempOut.push(tempItem);
                        temp.push(item.text);
                    }
                });

                if (temp.length > 0) {
                    _this.addClass('field--selected');
                    optionSelected.html(tempOut.join(''));
                    input.attr('data-label',temp.join(', '));
                } else {
                    _this.removeClass('field--selected');
                    optionSelected.html(defaultText);
                    input.attr('data-label', '');
                }

                if(optionSelected.innerHeight() > 48 && isMultiSelect) _this.css({'height':'auto'});
                else if(isMultiSelect) _this.css({'height':'48px'});

            }

            function fieldValidator() {
                const proValidation = new ProValidation();
                proValidation.singleValidate(_this[0]);

                // update options position
                selectSlide.trigger('reset');
            }

            // update input
            input.attr({
                "id": select.attr('id'), "name": select.attr('name'), "data-value": select.attr('data-value'),
            });

            // create and remove elements
            if (!isCustomHtml) {
                detectedItemSelected();
                select.remove();
                content.append(input);
                content.append(optionSelected);

                if(optionSelected.innerHeight() > 48 && isMultiSelect) _this.css({'height':'auto'});
                else if(isMultiSelect) _this.css({'height':'48px'});

            }
            if (!defaultText) _this.addClass('field--lv-label-important');
            _this.append(button);

            // control input change
            input.on('reset', function () {
                let v = $(this).val().split(',');

                changeItemsSelectedStatus(false);
                v.forEach(function (item) {
                    options.forEach(function (_i) {
                        if (_i.id == item) _i.isSelected = true;
                    });
                });

                renderTextOptionSelected();
            })

            // control input change
            input.on('change', function () {
                if(_this.hasClass('field--invalid') || _this.hasClass('field--valid')) fieldValidator();
            })

            // open list
            button.on('click', function () {

                // check if opened list change to close
                if (_this.hasClass('field--focus')) {
                    currentSelect = null;
                    if (selectSlide) selectSlide.trigger('destroy');
                    _this.removeClass('field--focus');
                    if (input.val() === '') {
                        _this.removeClass('field--lv-label field--selected');
                    } else {
                        _this.removeClass('field--lv-label');
                        _this.addClass('field--selected');
                    }
                    fieldValidator();
                    return false;
                }

                if (isCustomHtml) {
                    let moveCustomElement = _this.find('.custom-html');
                    currentSelect = _this;

                    _this.addClass('field--focus');
                    if (defaultText) _this.addClass('field--lv-label');

                    if ($(window).width() < 576) {
                        new ModalScreen({
                            class: 'modal-field-select-custom-html',
                            title: _this.find('> .field-content label').text(),
                            closeBtnIconClass: 'icon-arrow-up',
                            beforeGenerate: function (_this) {
                                moveCustomElement.appendTo(_this.innerContent);
                            },
                            beforeDistory: function () {
                                moveCustomElement.appendTo(_this);
                            },
                            closeBtnCallback: function (_this) {
                                _this.distory();
                            }
                        })
                    } else {
                        _this.append(customHtmlContent);
                    }

                    return false;
                }

                selectSlide = $('<div class="field-select-options"></div>');
                let searchWrapper = $('<div class="field-select-search-wrapper"><i class="icon-search-normal"></i></div>');
                let search = $('<input type="search" placeholder="Search...">');
                let list = $('<ul></ul>');
                let btnMode = false;

                if (_this.data('field-search')) {
                    selectSlide.addClass('active-search');
                }

                // add clear button
                if(_this.data('clear') === true){
                    const clearButton = $('<button type="button" class="clear-options"><i class="icon-trash-2"></i> Clear Selected Items</button>');
                    list.append(clearButton);
                    clearButton.on('click',function(){
                        list.find('li').removeClass('active');
                        changeItemsSelectedStatus(false);
                        detectedItemSelected();
                        fieldValidator();
                    })
                }

                // add select all option
                const selectAllOption = $('<li class="select-all-option"><div class="option-name">Select All</div><i class="icon-tick"></i></li>');
                if(_this.data('select-all') === true){
                    list.append(selectAllOption);
                    selectAllOption.on('click',function(){
                        if($(this).hasClass('active')){
                            list.find('li').removeClass('active');
                            changeItemsSelectedStatus(false);
                        }else{
                            list.find('li').addClass('active');
                            changeItemsSelectedStatus(true);
                        }
                        detectedItemSelected();
                        fieldValidator();
                    });
                }

                function itemGenerate(item) {
                    let li = $(`<li data-id="${item.id}"><div class="option-name">${item.text}</div><i class="icon-tick"></i></li>`);

                    if (item.flag) li.prepend(`<img class="option-icon" src="${item.flag}">`);
                    if (item.color) li.prepend(`<div class="option-color" style="background-color:${item.color};"></div>`);

                    if (!isMultiSelect && !item.flag && !item.color && $(window).width() < 576) {
                        btnMode = true;
                        li.addClass('btn btn-primary btn-full');
                    }

                    list.append(li);

                    // check before selected
                    if (item.isSelected) li.addClass('active');

                    // add click event
                    li.on('click', function () {

                        // check is not multi select and change status all options to deselected
                        if (!isMultiSelect) {
                            changeItemsSelectedStatus(false);
                            list.find('li').removeClass('active');
                        }

                        // set value
                        if (item.isSelected) {
                            item.isSelected = false;
                            li.removeClass('active');
                        } else {
                            item.isSelected = true;
                            li.addClass('active');
                        }

                        if (!isMultiSelect) {
                            _this.removeClass('field--focus');
                            _this.addClass('field--selected');
                            selectSlide.trigger('destroy');
                        }else selectSlide.trigger('reset');

                        // This command checks whether all options are selected or not and enables or
                        // disables the select all button
                        const allSelected = options.every(_item => _item.isSelected === true);
                        if(allSelected) selectAllOption.addClass('active');
                        else selectAllOption.removeClass('active');

                        detectedItemSelected();
                        fieldValidator();

                    });
                }

                // generate option
                options.forEach(function (item) {
                    itemGenerate(item);
                });

                // search
                search.on('keyup', function () {
                    let s = $(this).val();

                    if (s != '') {
                        options.forEach(function (item) {
                            if (item.text.search(new RegExp(s, 'i')) != -1) {
                                list.find(`li[data-id="${item.id}"]`).show();
                            } else {
                                list.find(`li[data-id="${item.id}"]`).hide();
                            }
                        });
                    } else {
                        list.find('li').show();
                    }

                    detectViewPortPosition();

                });

                // check media query
                if ($(window).width() < 576) {
                    let _label = _this.find('> .field-content label').clone();
                    _label.find('> *').remove();
                    new ModalScreen({
                        class: `modal-field-select ${btnMode ? 'btn-mode' : ''} ${_this.hasClass('wheel-mode')? '' : 'full-height'}`,
                        title: _label.text(),
                        closeBtnIconClass: 'icon-arrow-up',
                        showFooter: _this.data('btn-submit-text') ? true : false,
                        beforeGenerate: function (cls) {

                            // check is wheel mode
                            if (_this.hasClass('wheel-mode')) {

                                let wheelItems = [];
                                let wheelDefaultItem;

                                options.forEach(function (item) {
                                    if (item.isSelected) wheelDefaultItem = item.id;
                                    wheelItems.push({
                                        value: item.id, label: item.text,
                                    });
                                });

                                let wheelPicker = new WheelPicker({
                                    around: 1,
                                    items: wheelItems,
                                    default: wheelDefaultItem,
                                    onSelect: function (value) {
                                        changeItemsSelectedStatus(false);
                                        options.forEach(function (item) {
                                            if (item.id == value) item.isSelected = true;
                                        });
                                    }
                                });

                                this.innerContent.append(wheelPicker);

                            } else {

                                if (_this.data('field-search')) {
                                    searchWrapper.append(search);
                                    this.innerContent.append(searchWrapper);
                                }

                                this.innerContent.append(list);

                                // check empty message
                                if(options.length === 0){
                                    this.innerContent.append(`<div class="options-message">There is no item</div>`);
                                }

                            }

                            if (_this.data('btn-submit-text')) {
                                let submit = $(`<button type="button" class="btn btn-full btn-primary">${_this.data('btn-submit-text')}</button>`);

                                cls.footer.append(submit);
                                submit.on('click', function () {

                                    // check is wheel mode
                                    if (_this.hasClass('wheel-mode')) detectedItemSelected();

                                    cls.distory();
                                });
                            }

                        },
                        closeBtnCallback: function (_this) {
                            _this.distory();
                        },
                        beforeDistory: function (_this) {
                            fieldValidator();
                        }
                    })
                } else { // desktop
                    currentSelect = _this;

                    if (_this.data('field-search')) {
                        searchWrapper.append(search);
                        selectSlide.append(searchWrapper);
                    }
                    selectSlide.append(list);
                    _this.append(selectSlide);
                    _this.addClass('field--focus');
                    if (defaultText) _this.addClass('field--lv-label');
                    selectSlide.css('height', 'auto');

                    // This event is to disable page scrolling when scrolling selectSlide
                    selectSlide.on('wheel',function(e){
                        const scrollTop = selectSlide.scrollTop();
                        const height = selectSlide.height();
                        const scrollHeight = selectSlide[0].scrollHeight;
                        const scrolled = Math.round(scrollTop + height);

                        if( scrollTop <= 0 && e.originalEvent.deltaY < 0) e.preventDefault();
                        if(scrolled >= scrollHeight && e.originalEvent.deltaY > 0) e.preventDefault();
                    })

                    detectViewPortPosition();

                    $(window).on('scroll',detectViewPortPosition);
                    selectSlide.parents('*').on('scroll',detectViewPortPosition);
                    selectSlide.on('reset', detectViewPortPosition)
                    selectSlide.on('destroy',function(){
                        selectSlide.remove();
                        $(window).off('scroll',detectViewPortPosition);
                        selectSlide.parents('*').off('scroll',detectViewPortPosition);
                    })

                }

                // check empty message
                if(options.length === 0){
                    selectSlide.append(`<div class="options-message">There is no item</div>`);
                }

                function detectViewPortPosition(){
                    const thisViewPort = _this[0].getBoundingClientRect();
                    const slideHeight = selectSlide.height();
                    const windowHeight = $(window).height();
                    const normalTop = thisViewPort.y + thisViewPort.height - 1;
                    let currentTop = normalTop;

                    if(thisViewPort.y + thisViewPort.height <= 0) currentTop = 0;
                    else if(windowHeight - (thisViewPort.y + thisViewPort.height) >= slideHeight) currentTop = normalTop;
                    else if (thisViewPort.y >= slideHeight) currentTop = thisViewPort.y - slideHeight;
                    else if(normalTop + slideHeight > windowHeight) currentTop = normalTop - (normalTop + slideHeight - windowHeight);

                    selectSlide.css({
                        top: currentTop,
                        left: thisViewPort.x,
                        width: thisViewPort.width,
                    })
                }

            });

        }

        // detect slider and set value
        else if (_this.hasClass('field-type-slider')) {

            let min = parseInt(input.attr('min'));
            let max = parseInt(input.attr('max'));

            function setValueSlider(element) {

                let val = parseInt($(element).val());
                let percent = val / (min + max) * 100;

                // set percent
                _this.find('.slider-track').css({backgroundImage: `linear-gradient(to right,#0D0D0D 0%,#0D0D0D ${percent}% ,#C2C2C2 ${percent}%)`,});
                _this.find('.slider-left-value .slider-value').html(val);

            }

            // set default
            setValueSlider(input[0]);

            // set with change
            input.on('input', function () {
                setValueSlider(this)
            });

        }

        // detect multi slider and set value
        else if (_this.hasClass('field-type-multi-slider')) {

            let min = parseInt($(input[0]).attr('min'));
            let max = parseInt($(input[0]).attr('max'));
            let subFix = _this.data('sub-fix');

            // function 
            function setValueSlider(element, secondary, isLast) {

                let val = parseInt($(element).val());
                let valSec = parseInt($(secondary).val());
                let override = isLast ? (val >= valSec ? val : valSec) : (val <= valSec ? val : valSec);

                // set override value
                $(element).val(override);

                // gemerate percent
                let firstValue = isLast ? valSec : override;
                let lastValue = isLast ? override : valSec;
                let firstPercent = (isLast ? valSec : override) / (min + max) * 100;
                let lastPercent = (isLast ? override : valSec) / (min + max) * 100;

                // set percent
                _this.find('.slider-track').css({backgroundImage: `linear-gradient(to right,#C2C2C2 ${firstPercent}%,#0D0D0D ${firstPercent}% ,#0D0D0D ${lastPercent}%,#C2C2C2 ${lastPercent}%)`,});
                if (firstValue == min && lastValue == max) _this.find('label').html(_this.data('label')); else _this.find('label').html(`${_this.data('label')}: ${firstValue} ${subFix} - ${lastValue} ${subFix}`);

            }

            // set default
            setValueSlider(input[0], input[1], false);

            // set with change slide 1
            $(input[0]).on('input', function () {
                setValueSlider(this, input[1], false)
            });

            // set with change slide 1
            $(input[1]).on('input', function () {
                setValueSlider(this, input[0], true)
            });

            // reset slider
            $(input).on('reset', function () {
                setValueSlider(this, input[1], false)
            });

        }

    });
}

// resend timer
// This function is used for resending and manages the timer and link click event
function initResendTimer(){
    $('.form-resend-timer').each(function(){

        const element = $(this);
        let interval;

        if(element.data('detect')) return;
        element.data('detect',true);

        // default start
        startReSendTimer(2,element.find('.timer'));

        // on click link
        element.on('click',function(){
            const _href = element.attr('href');

            if(element.hasClass('timer-active')) return false;
            if(_href === '') return false;

            try {
                // check href is url
                new URL(_href);
                $.ajax({
                    url: _href,
                    type: "GET",
                    success: function(data) {
                        startReSendTimer(2,element.find('.timer'));
                        element.find('span').show();
                        element.find('.timer').html('2:00');
                    },
                    error: function(error){}
                });

            } catch (error) {}

            return false;
        });

        element.on('resend',function(){
            clearInterval(interval);
            startReSendTimer(2,element.find('.timer'));
            element.find('span').show();
            element.find('.timer').html('2:00');
        })

        element.on('clear',function(){
            clearInterval(interval);
        })

        function startReSendTimer(minutes,timerElement){
            let totalSeconds = minutes * 60;

            interval = setInterval(function() {
                const minutesRemaining = Math.floor(totalSeconds / 60);
                const secondsRemaining = totalSeconds % 60;
                timerElement.html(`${minutesRemaining}:${secondsRemaining.toString().padStart(2, "0")}`);
                element.addClass('timer-active');

                if (totalSeconds <= 0) {
                    clearInterval(interval);
                    element.removeClass('timer-active');
                    element.find('span').hide();
                }

                totalSeconds--;
            }, 1000);
        }

    });
}

// body overflow controller
// If you need to enable or disable page scrolling, you should use this function.
function bodyOverflowController(hidden = false){
    const body = $('body');
    const windowWidth = $(window).width();

    if(windowWidth > 576) return;
    if(hidden) body.css({'overflow':'hidden'/*,'width':bodyWidth+'px'*/});
    else body.css({'overflow':''/*,'width':'100%'*/})
}

// get area field data
// This function returns the field values of a section as a json
function getAreaFieldData(area, _init = false){
    let data = {};
    area.find('.field').each(function () {
        const element = $(this);
        const type = element.data('type');
        const input = element.find('input, textarea');
        const name = input.attr('name');

        switch (type) {
            case 'text':
            case 'number':
            case 'textarea':
            case 'upload':
                data[name] = input.val();
                break;
            case 'select':
                let defValue = input.data('value');
                let newValue = input.val();
                data[name] = newValue? (newValue === ''? (_init? (defValue? defValue : '') : newValue) : newValue) : (_init? (defValue? defValue : '') : '');
                break;
            case 'radio':
                let radioValue = $(`input[name="${name}"]:checked`).val();
                data[name] = radioValue? radioValue : '';
                break;
            case 'checkbox':
                data[name] = input.is(':checked');
                break;
        }
    });

    area.find('.table-repeater').each(function(){
        const input = $(this).find('input');
        const name = input.attr('name');
        data[name] = input.val();
    })

    return data;
}

/**
 * All fields are validated by this function.
 *
 * @param _selector The class or ID of the section in which we want the fields to be checked
 * @param classController Add invalidity (field--invalid) class to invalid fields
 * @returns {{}}
 */
function formValidation(_selector, classController = false) {
    let selectedElement = $(_selector);
    let invalidFields = {};
    let fieldElements;

    // check this selected element id field
    if (selectedElement.data('field-validation')) fieldElements = selectedElement; else fieldElements = selectedElement.find('[data-field-validation=true]');

    // check fields
    fieldElements.each(function () {

        let fieldElement = $(this);
        let fieldType = fieldElement.data('type');
        let fieldId = fieldElement.data('id');
        let fieldMessage = fieldElement.data('error-msg');
        let dependencyController = fieldElement.parents('[data-dependency-show=false]');
        let fieldClassController = false;
        let saveField;
        let saveName;

        // check field in dependency
        if (dependencyController.length) return true;

        let CVVF = checkValidationValueField(fieldElement);
        if (CVVF !== undefined) {
            if (CVVF) {
                fieldClassController = true;
                invalidFields[saveName] = generateReturnInvalidObject(fieldId, fieldElement, fieldMessage, fieldType);
            }
        }

        if (CVVF === undefined) {
            // control field with type
            switch (fieldType) {

                case 'text':
                case 'number':
                case 'location':
                case 'date':
                case 'time':
                case 'select':
                case 'upload':

                    saveField = fieldElement.find('input');
                    saveName = saveField.attr('name');

                    if (saveField.val() === '') {
                        fieldClassController = true;
                        invalidFields[saveName] = generateReturnInvalidObject(fieldId, fieldElement, fieldMessage, fieldType);
                    }

                    break;
                case 'textarea':

                    saveField = fieldElement.find('textarea');
                    saveName = saveField.attr('name');
                    if (saveField.val() === '') {
                        fieldClassController = true;
                        invalidFields[saveName] = generateReturnInvalidObject(fieldId, fieldElement, fieldMessage, fieldType);
                    }

                    break;
                case 'radio':

                    saveField = fieldElement.find('input');
                    saveName = saveField.attr('name');
                    if ($(`input[name="${saveName}"]:checked`).length === 0) {
                        fieldClassController = true;
                        invalidFields[saveName] = generateReturnInvalidObject(fieldId, fieldElement, fieldMessage, fieldType);
                    }

                    break;
                case 'checkbox':

                    saveField = fieldElement.find('input');
                    saveName = saveField.attr('name');
                    if (!saveField.is(':checked')) {
                        fieldClassController = true;
                        invalidFields[saveName] = generateReturnInvalidObject(fieldId, fieldElement, fieldMessage, fieldType);
                    }

                    break;

                default:
                    break;

            }
        }

        // set class invalid in text
        if (classController && fieldClassController) fieldElement.addClass('field--invalid'); else if (!fieldClassController) fieldElement.removeClass('field--invalid');

    });

    function generateReturnInvalidObject(id, element, label, type) {
        return {
            id: id,
            element: element,
            label: label,
            type: type
        }
    }

    // return result
    return invalidFields;

}

function checkValidationValueField(element) {

    // check validate with other field value
    let validateWith = element.data('field-validation-with');
    let validateType = element.data('field-validation-type');
    let validateValue = element.data('field-validation-value');

    if (validateWith !== undefined) {

        let elementSelected = $('#' + validateWith);
        let elementField = elementSelected.parents('.field');
        let elementType = elementField.data('type');

        switch (elementType) {

            case 'text':
            case 'number':
            case 'location':
            case 'date':
            case 'time':
            case 'select':
            case 'upload':
            case 'textarea':

                if (validateType === 'required') {
                    if (elementSelected.val() == validateValue) return true;
                    else return false;
                } else if (validateType === 'exclusive') {
                    if (elementSelected.val() != validateValue) return true;
                    else return false;
                }

                break;
            case 'radio':

                if (validateType === 'required') {
                    if (!elementSelected.is(':checked')) return true;
                    else return false;
                } else if (validateType === 'exclusive') {
                    if ($(`input[name="${name}"]:checked`).length > 0 && $(`input[name="${name}"]:checked`).attr('id') != elementSelected.attr('id')) return true;
                    else return false;
                }

                break;

            default:
                break;

        }

    }

    return undefined;

}

/**
 * It is used to create an alert with a specific structure, and the prerequisite for this file is popup.js
 *
 *      options:
 *              class: '',
 *              type: '', icon or avatar
 *              status: '', success, danger, info or warning
 *              avatar: '', avatar url
 *              title: '',
 *              content: '',
 *              actionElements: [], element object
 *              actionLayout: '', horizontal or vertical
 *
 * @param options
 * @returns {PopupJS} The return type is PopupJS and is usually used to add an element to the popup or destroy it
 */
function addAlertPopup(options = {}) {

    let popup = new PopupJS({
        class: 'alert-popup ' + options.type + ' ' + options.class, onBeforeGenerate: function (cls) {

            let innerContent = $('<div class="alert-inner-content"></div>');
            let alertActions = $('<div class="alert-actions"></div>');

            // avatar and icon
            if (options.type == 'avatar') {
                cls.content.append(`<img src="${options.avatar}" class="alert-avatar"/>`)
            } else if (options.type == 'icon') {
                switch (options.status) {
                    case 'success':
                        cls.content.append('<i class="icon-tick alert-icon success"></i>');
                        break;
                    case 'danger':
                        cls.content.append('<i class="icon-alert-triangle alert-icon danger"></i>');
                        break;
                    case 'info':
                        cls.content.append('<i class="icon-info alert-icon info"></i>');
                        break;
                    case 'warning':
                        cls.content.append('<i class="icon-alert-triangle alert-icon warning"></i>');
                        break;
                    default:
                        cls.content.append('<i class="icon-' + options.status + ' alert-icon"></i>');
                        break;
                }
            }

            cls.content.append(`<div class="alert-title">${options.title}</div>`);
            cls.content.append(innerContent);
            innerContent.append(options.content);

            if (options.actionElements.length) {
                alertActions.addClass(options.actionLayout);
                cls.content.append(alertActions);
                options.actionElements.forEach(function (item) {
                    alertActions.append(item);
                });
            }

        },
        onAfterDistory: function(){
            if(options.onDistory) options.onDistory();
        },
    });

    return popup;

}