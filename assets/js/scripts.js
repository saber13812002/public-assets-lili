/**
 * This file contains all events and commands related to different parts of the site.
 * This file is related to components.js file
 */
"use strict";


// script
(function ($) {

    // TODO global variables
    let _lazyLoadingGlobal;
    let filterMobileData = {};
    let filterDesktopData = {};

    // TODO functions

    /**
     * remove classes in header related events
     */
    function headerResetClass() {
        $('header').removeClass('active active-menu active-search active-search-result active-search-recent active-sort active-category active-filter active-bookmark');
    }

    /**
     * add events classes to the header
     *
     * @param classes Classes that will be added to the header
     */
    function headerAddClass(classes = []) {
        $('header').addClass(classes.join(' '));
    }

    /**
     * remove events classes to the header
     *
     * @param classes Classes that will be removed to the header
     */
    function headerRemoveClass(classes = []) {
        $('header').removeClass(classes.join(' '));
    }

    /**
     * Checking the presence of a class in the header
     *
     * @param classes The class will be reviewed
     * @returns {boolean|jQuery|*}
     */
    function headerHasClass(classes) {
        return $('header').hasClass(classes);
    }

    // TODO scripts

    // change status header in home page with scroll
    if($('body.page-home')[0]){
        $(window).on('scroll',function(e){

            // check scroll range
            if(window.scrollY > 10){
                $('#header').addClass('is-scroll');
            } else {
                $('#header').removeClass('is-scroll');
            }

        })

        // set on load page
        if(window.scrollY > 10){
            $('#header').addClass('is-scroll');
        } else {
            $('#header').removeClass('is-scroll');
        }

    }

    // close all header section with click on overlay
    $(document).on('click', 'header .overlay', function () {
        headerResetClass();
        bodyOverflowController();
    });

    // open menu -- appbar
    $(document).on('click', '#btn_appbar_menu', function () {
        let isActive = headerHasClass('active-menu');

        headerResetClass();
        if (!isActive) headerAddClass(['active', 'active-menu']);
    });

    // open search -- appbar
    $(document).on('click', '#btn_appbar_search', function () {
        let searchInputElement = $('#inp_saerch');

        headerResetClass();
        headerAddClass(['active', 'active-search']);

        // open search recent and result after end effect
        setTimeout(function(){
            // check set value before open search result and search recent
            if(searchInputElement.val() !== '') headerAddClass(['active-search-result']);
            else headerAddClass(['active-search-recent']);
        },360);
    });

    // change search input -- appbar
    $(document).on('keyup', '#inp_saerch', function () {
        if ($(this).val() != '' && $(this).val().length >= 3) {
            headerAddClass(['active-search-result']);
            headerRemoveClass(['active-search-recent']);

            // send request to server
            $.ajax({
                url: env.baseURL + "/api/search",
                type: "GET",
                data: { s: $(this).val() }, // You can pass additional data if needed
                success: function(data) {
                    $('#header .search .search-result').html(data);
                },
                error: function(error){
                    $('#header .search .search-result').html('<div class="not-found-result">There is a problem with the server, check your internet connection and try again</div>');
                }
            });

        } else {
            headerAddClass(['active-search-recent']);
            headerRemoveClass(['active-search-result']);
        }
    });

    // close search with click on button icon back in search box header
    $(document).on('click', '#btn_search_back', function () {
        headerRemoveClass(['active', 'active-search', 'active-search-result', 'active-search-recent']);
    });

    // open bookmark -- appbar
    $(document).on('click', '#btn_appbar_bookmark', function () {
        let isActive = headerHasClass('active-bookmark');
        let maxWidth = $(window).width();

        headerResetClass();
        if (!isActive) {
            if (maxWidth > 576) location.href = './bookmark-select-models.html';
            else headerAddClass(['active', 'active-bookmark']);
        }
    });

    // open sort mobile with click on button icon sort header in page models
    $(document).on('click', '#btn_appbar_sort', function () {
        headerResetClass();
        headerAddClass(['active', 'active-sort']);
        bodyOverflowController(true);
    });

    // change select sort mobile option
    $(document).on('click', 'header .sort-mobile li a', function () {
        $(this).parents('ul').find('li').removeClass('active');
        $(this).parent().addClass('active');

        return false;
    });

    // close sort mobile with click button icon back in sort app bar
    $(document).on('click', '#btn_close_sort, #btn_close_filter', function () {
        headerResetClass();
        bodyOverflowController();
    });

    // open category mobile with click on button icon category header in news page category
    $(document).on('click', '#btn_appbar_category', function () {
        headerResetClass();
        headerAddClass(['active', 'active-category']);
        bodyOverflowController(true);
    });

    // change select category mobile option
    $(document).on('click', 'header .category-mobile li a', function () {
        let li = $(this).parent();

        if (li.hasClass('active')) li.removeClass('active');
        else li.addClass('active');

        return false;
    });

    // close sort mobile with click button icon back in sort app bar
    $(document).on('click', '#btn_close_category', function () {
        headerResetClass();
        bodyOverflowController();
    });

    // open filter mobile
    $(document).on('click', '#btn_appbar_filter', function () {
        headerResetClass();
        headerAddClass(['active', 'active-filter']);
        bodyOverflowController(true);
    });

    // close and apply filter (Mobile)
    $(document).on('click', '#btn_set_filters', function () {
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'post',
            data: {
                filter: filterMobileData,
                sort: $('#sort_mobile_archive_page li.active a').data('option'),
            },
            success: function (resp) {
                $('.section-models').html(resp);
            },
            error: function (xhr, status, error) {
                $('#message_archive_page').html('Error Message').show();
            },
        });

        headerResetClass();
        bodyOverflowController();
    });

    // change sort models in archive page (models list) - Desktop
    $(document).on('click', '#sort_mobile_archive_page a', function () {
        console.log({
            sort: $(this).data('option'),
            filter: filterMobileData,
        })
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'post',
            data: {
                sort: $(this).data('option'),
                filter: filterMobileData,
            },
            success: function (resp) {
                $('.section-models').html(resp);
            },
            error: function (xhr, status, error) {
                $('#message_archive_page').html('Error Message').show();
            },
        });
    });

    // send and apply filter in desktop mode
    $(document).on('click', '#btn_desk_set_filters', function () {
        $.ajax({
            url: env.baseURL + '/api/filter',
            type: 'post',
            data: {
                filter: filterDesktopData,
                sort: $('#sort_archive_page').val(),
            },
            success: function (resp) {
                $('.section-models').html(resp);
            },
            error: function (xhr, status, error) {
                $('#message_archive_page').html('Error Message:'+status+':'+error).show();
            },
        });
    });

    // click on load more button in archive page (models list)
    $(document).on('click', '#btn_load_more_models_archive_page', function () {
        $.ajax({
            url: env.baseURL + '/api/load-more/archive',
            type: 'post',
            data: {
                page: $(this).attr('data-page'),
                filter: filterDesktopData,
                sort: $('#sort_archive_page').val(),
            },
            success: function (resp) {
                $('#models_archive_page').append(resp);
                var page=Number($('#btn_load_more_models_archive_page').attr('data-page'));
                $('#btn_load_more_models_archive_page').attr('data-page', page+1);
                console.log($('#btn_load_more_models_archive_page').attr('data-page'));
                resp==""?$('#btn_load_more_models_archive_page').hide():"";
            },
            error: function (xhr, status, error) {
                $('#message_archive_page').html('Error Message:'+status+':'+error).show();
            },
        });
    });

    // change sort models in archive page (models list) - Desktop
    $(document).on('change', '#sort_archive_page', function () {
        $.ajax({
            url: env.baseURL + '/api/filter',
            type: 'post',
            data: {
                sort: $(this).val(),
                filter: filterDesktopData,
            },
            success: function (resp) {
                $('.section-models').html(resp);
            },
            error: function (xhr, status, error) {
                $('#message_archive_page').html('Error Message').show();
            },
        });
    });

    // change sort liliana news - (news or news gallery)
    $(document).on('change', '#sort_liliana_news', function () {
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'POST',
            data: $(this).val(),
            success: function (resp) {
                $('#liliana_news_content').html(resp);
                $('#filter_liliana_news .filter-option:eq(0)').trigger('click');
            },
            error: function (xhr, status, error) {
                console.log(error)
            },
        });
    });

    // click load more liliana news - (news or news gallery)
    $(document).on('click', '#btn_load_more_liliana_news', function () {
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'POST',
            data: {
                page: $(this).attr('data-page'),
            },
            success: function (resp) {
                $('#liliana_news_content').append(resp);
                $('#filter_liliana_news .filter-option.active').trigger('click');
            },
            error: function (xhr, status, error) {
                console.log(error)
            },
        });

        return false;
    });

    // change sort member news - (news or news gallery)
    $(document).on('change', '#sort_member_news', function () {
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'POST',
            data: $(this).val(),
            success: function (resp) {
                $('#member_news_content').html(resp);
                $('#filter_member_news .filter-option:eq(0)').trigger('click');
            },
            error: function (xhr, status, error) {
                console.log(error)
            },
        });
    });

    // click load more liliana news - (news or news gallery)
    $(document).on('click', '#btn_load_more_member_news', function () {
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'POST',
            data: {
                page: $(this).attr('data-page'),
            },
            success: function (resp) {
                $('#member_news_content').append(resp);
                $('#filter_member_news .filter-option.active').trigger('click');
            },
            error: function (xhr, status, error) {
                console.log(error)
            },
        });

        return false;
    });

    // click load more result news
    $(document).on('click', '#btn_load_more_result_news', function () {
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'POST',
            data: {
                page: $(this).attr('data-page'),
                query: $(this).attr('data-query'),
            },
            success: function (resp) {
                $('#result_news_content').append(resp);
            },
            error: function (xhr, status, error) {
                console.log(error)
            },
        });

        return false;
    });

    // open item filter mobile
    $(document).on('click', 'header .filter-mobile > ul > li > a', function () {
        $(this).parent().addClass('active');

        // check this item for nationality or language
        if ($(this).parent().hasClass('filter-nationality')) {
            createFilterItemsCountryFlag($(this).parent());
        }

        // check this item for nationality or language
        if ($(this).parent().hasClass('filter-language')) {
            createFilterItemsCountryFlag($(this).parent(), true);
        }

        return false;
    });

    // back filter mobile
    $(document).on('click', 'header .filter-mobile .btn-back', function () {
        $(this).parents('li').removeClass('active');
    });

    // detect changed option in filter
    // This script supports two types of checkbox and range fields
    $(document).on('change', 'header .filter-mobile-sub-item .field:not(.items-selector) input', function () {

        let parentField = $(this).parents('.field');
        let itemElement = $(this).parents('.filter-mobile-sub-item');
        let fieldElements = $(this).parents('.filter-mobile-inner-content').find('.field');
        let badge = false;
        let temp = [];

        // each on fields
        // Identification of the field type is done using the class
        fieldElements.each(function () {

            // check type checkbox
            if ($(this).hasClass('field-type-checkbox')) {
                let input = $(this).find('input');
                if (input.is(':checked')) {
                    badge = true;
                    temp.push($(this).find('label span:eq(0)').text());
                }
            }
            // check type range
            else if ($(this).hasClass('field-type-multi-slider')) {
                let inputs = $(this).find('input');
                let min = parseInt($(inputs[0]).attr('min'));
                let max = parseInt($(inputs[0]).attr('max'));
                let value_1 = parseInt($(inputs[0]).val());
                let value_2 = parseInt($(inputs[1]).val());

                if (value_1 != min || value_2 != max) {
                    badge = true;
                    temp.push($(this).data('label'));
                }
            }
            // check type text
            else if ($(this).hasClass('field-type-nr-input')) {
                let inputs = $(this).find('input');

                if (inputs.val() !== '') {
                    badge = true;
                    temp.push($(this).find('label').text());
                }
            }

        });

        filterMobileData = {};
        $('.filter-mobile input').each(function(){
            let name = this.name;
            let value = [];
            let field = $(this).parents('.field');

            if(this.name === '' || (this.type === 'checkbox' && !this.checked)) return;
            if(filterMobileData[name] !== undefined) value = filterMobileData[name].split(',');

            if(field.hasClass('field-type-nr-input') && $(this).val() !== '') value.push($(this).val());

            value.push(this.value);
            filterMobileData[name] = value.join(',');
        });

        const itemLiLabel = itemElement.parents('li').find('> a');
        const countFields = itemElement.find('.filter-mobile-inner-content .field:not(.field-ignore)');
        itemLiLabel.find('> div div').remove();
        itemLiLabel.find('> span').remove();
        if (badge) {
            itemElement.parents('li').addClass('badge');
            if(!parentField.hasClass('field-type-nr-input'))
                $(`<span>${temp.length === countFields.length? 'All': temp.length} ${itemElement.data('status')?itemElement.data('status'):'Selected'}</span>`).insertAfter(itemLiLabel.find('> div'));
            if(itemElement.hasClass('active-labels')) itemLiLabel.find('> div').append(`<div>( ${temp.join(', ')} )</div>`);

            if(temp.length === countFields.length){
                itemElement.find('.app-bar-container input[type="checkbox"]').prop('checked', true).parents('.field').removeClass('some-checked');
            }else{
                itemElement.find('.app-bar-container input[type="checkbox"]').prop('checked', false).parents('.field').addClass('some-checked');
            }
        } else {
            itemElement.find('.app-bar-container input[type="checkbox"]').prop('checked', false).parents('.field').removeClass('some-checked');
            itemElement.parents('li').removeClass('badge');
        }

        if ($('.filter-mobile .badge').length) $('.filter-mobile').addClass('active-clear');
        else $('.filter-mobile').removeClass('active-clear');

    });

    // check trigger to checked and unchecked filter items
    $(document).on('change','.filter-mobile .items-selector input',function(){
        let itemElement = $(this).parents('.filter-mobile-sub-item');
        let itemInnerContent = itemElement.find('.filter-mobile-inner-content');
        let inputs = itemInnerContent.find('input');

        if($(this).is(':checked')) {
            $(this).prop('checked', true).parents('.field').removeClass('some-checked');
            inputs.prop('checked', true);
        } else {
            $(this).prop('checked', false).parents('.field').removeClass('some-checked');
            inputs.prop('checked', false);
        }

        $(inputs[0]).trigger('change');
    });

    // clear all filter
    $(document).on('click', '#clear_mobile_filter', function () {
        let _this = $(this);

        $('.filter-mobile').removeClass('active-clear');
        $('.filter-mobile > ul > li').removeClass('badge');
        $('.filter-mobile > ul > li > a > span').remove();
        $('.filter-mobile > ul > li > a > div div').remove();
        $('.filter-mobile input[type="checkbox"]').prop('checked', false).parents('.field').removeClass('some-checked');
        $('.filter-mobile .filter-mobile-sub-item').attr('data-filter', '');
        filterMobileData = {};

        // multi slider
        $('.field-type-multi-slider').each(function () {
            let field = $(this);
            let inputs = field.find('input');

            $(inputs[0]).val($(inputs[0]).attr('min')).trigger('input');
            $(inputs[1]).val($(inputs[0]).attr('max')).trigger('input');
        });

        // text
        $('.field-type-nr-input input').val('').trigger('change');

    });

    // navigate to bottom -- home page
    $(document).on('click', '#intro_arrow_navigation', function () {
        $('html, body').animate({
            scrollTop: $(".home-categories").offset().top - 72
        }, 1000);
    });

    // trigger open and close filter box
    $(document).on('click', '.page-archive #btn_filter_professional', function () {
        if ($(this).hasClass('opened')) {
            $('.page-archive .filter-box').slideUp();
            $(this).removeClass('opened');
        } else {
            $('.page-archive .filter-box').slideDown();
            $(this).addClass('opened');
        }
    });

    let _GroupsFilters = {};

    // create option selected in filtered box and set deselect event
    $(document).on('change', '.page-archive .filter-box input', function () {
        const sectionFilter = $('.section-filter-actions .filtered');

        // resets
        sectionFilter.html('');
        filterDesktopData = {};
        _GroupsFilters = {};

        $('.page-archive .filter-box .field').each(function(){

            const field = $(this);
            const fieldID = field.attr('id');
            const fieldItemCount = Number(field.attr('data-item-count'));
            const input = field.find('input');
            const group = field.parents('.group-filter');
            const groupName = group.data('group-name');
            const groupID = group.data('group-id');
            const groupFieldCount = group.find('.field').length;
            const status = group.data('status');
            let count = 0;
            let value;

            // reject without group filter
            if(group.length === 0) return;

            if(_GroupsFilters[groupID]) count = Object.keys(_GroupsFilters[groupID].fields).length;

            // check multi slider
            if (field.hasClass('field-type-multi-slider')) {
                let inputs = field.find('input');
                let min = $(inputs[0]).attr('min');
                let max = $(inputs[0]).attr('max');
                let firstValue = $(inputs[0]).val();
                let lastValue = $(inputs[1]).val();
                let _unit = field.data('cunit');

                filterDesktopData[$(inputs[0]).attr('name')] = firstValue;
                filterDesktopData[$(inputs[1]).attr('name')] = lastValue;

                if (min != firstValue || max != lastValue) {
                    count++;
                    value = {
                        type: 'multi_slider',
                        label: field.data('label'),
                        value: [`${firstValue}${_unit}`, `${lastValue}${_unit}`],
                    };
                }
            }

            // check select
            if (field.hasClass('field-type-select') && input.val() != '') {
                count += input.val().split(',').length;
                filterDesktopData[input.attr('name')] = input.val();

                value = {
                    type: 'select',
                    label: field.find('label').text(),
                    value: input.attr('data-label'),
                };
            }

            // check text
            if (field.hasClass('field-type-nr-input') && input.val() != '') {
                value = {
                    type: 'select',
                    label: field.find('label').text(),
                    value: input.val(),
                };
            }

            if(value !== undefined){
                if(_GroupsFilters[groupID] === undefined) _GroupsFilters[groupID] = {
                    name: groupName,
                    fields: {}
                };
                _GroupsFilters[groupID].num = count;
                _GroupsFilters[groupID].fields[fieldID] = value;
            }

            $(`#${status}`).find('span').remove();
            if(_GroupsFilters[groupID] !== undefined) {
                if(groupFieldCount > 1){
                    $(`#${status}`).append(`<span>${_GroupsFilters[groupID].num === groupFieldCount? 'All':_GroupsFilters[groupID].num} Changed</span>`);
                }else {
                    $(`#${status}`).append(`<span>${_GroupsFilters[groupID].num === fieldItemCount? 'All':_GroupsFilters[groupID].num} Selected</span>`);
                }
            }

        });

        for (let groupKey in _GroupsFilters){
            let output = [];

            for(let itemKey in _GroupsFilters[groupKey].fields){
                const itemSelected = _GroupsFilters[groupKey].fields[itemKey];
                if(itemSelected.type === 'multi_slider'){
                    output.push(`${itemSelected.label} (${itemSelected.value[0]} ~ ${itemSelected.value[1]})`);
                } else output.push(itemSelected.value)
            }

            const item = $(`<a href="#" data-id="${groupKey}">${_GroupsFilters[groupKey].name}: ${output.join(', ')}<i class="icon-close"></i></a>`);
            item.on('click',function(){
                filterRemoveItemDesktop($(this).attr('data-id'));
                return false;
            });
            sectionFilter.append(item);
        }

        const keysGroupFilters = Object.keys(_GroupsFilters);
        if(keysGroupFilters.length > 1){
            const clearAllButton = $('<a href="#" class="filter-clear-all">clear all</a>');
            clearAllButton.on('click',function(){
                filterDesktopData = {};
                keysGroupFilters.forEach(function(i){
                    filterRemoveItemDesktop(i);
                });
               return false;
            });
            sectionFilter.append(clearAllButton);
        }

        function filterRemoveItemDesktop(gID){
            for(let fieldID in _GroupsFilters[gID].fields){
                const field = $(`#${fieldID}`);

                if(field.hasClass('field-type-multi-slider')){
                    const inputs = field.find('input');
                    let min = $(inputs[0]).attr('min');
                    let max = $(inputs[0]).attr('max');
                    $(inputs[0]).val(min);
                    $(inputs[1]).val(max);
                    $(inputs[0]).trigger('reset').trigger('change');
                }

                if(field.hasClass('field-type-select')){
                    field.find('input').val('').trigger('reset').trigger('change');
                }

                if(field.hasClass('field-type-nr-input')){
                    field.find('input').val('').trigger('reset').trigger('change');
                }
            }
        }

    });

    // controller member no. in filters
    $(document).on('keydown', '.filter-member-no-controller', function (e) {
        const value = parseInt($(this).val());
        const keyValue = parseInt(e.key);

        if(value > 0) return true;
        if(keyValue > 0) return true;

        return false;
    });

    // delete recent search
    $(document).on('click','#btn_clear_search_recent',function(){
        $('header .search-recent .recent-cleared-message').addClass('active');
        $('header .search-recent .recent-search-section').addClass('disable');
        setTimeout(function(){
            $.ajax({
                url: env.baseURL + '/api/',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: filterDesktopData,
                success: function (resp) {
                    if($('header .search-recent .recent-cleared-message').hasClass('active')) {
                        $('header .search-recent').remove();
                    }
                },
                error: function (xhr, status, error) {
                    // print log error or use other code
                },
            });
        },5000);
    });

    // undo recent search
    $(document).on('click','#btn_undo_search_recent',function(){
        $('header .search-recent .recent-cleared-message').removeClass('active');
        $('header .search-recent .recent-search-section').removeClass('disable');
    });

    // detect selected item in bookmark all models
    $(document).on('change', '.page-bookmark .grid-models input[type=checkbox], .page-add-models .grid-models input[type=checkbox]', function () {
        let inputs = $('.grid-models input');
        let count = $('.grid-models input:checked');

        $('.btn-submit span').html(count.length);
        $('#trigger_select_all_model').prop('checked', inputs.length === count.length);
        $('.deselect-all-checkbox').css('display',count.length >= 2?'block':'none');
    });

    // trigger select and deselect all items bookmark
    $(document).on('change', '.page-bookmark #trigger_select_all_model, .page-add-models #trigger_select_all_model', function () {
        $('.grid-models input').prop('checked', $(this).is(':checked'));

        $($('.grid-models input')[0]).trigger('change');
    });

    // select all models in mobile bookmarks -- appbar
    $(document).on('click', '.deselect-all-checkbox', function () {
        $('.grid-models input').prop('checked', false)
        $($('.grid-models input')[0]).trigger('change');

        return false;
    });

    // select all models in mobile bookmarks -- appbar
    $(document).on('click', '#btn_appbar_select_all_models', function () {
        $('.grid-models input').prop('checked', true)
        $($('.grid-models input')[0]).trigger('change');

        return false;
    });

    // cancel add model to request
    $(document).on('click', '#btn_cancel_add_model', function () {
        $('.light-box').remove();
    })

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " Bytes";
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }

    // request hiring form submit
    $(document).on('click', '#btn_request_hiring_submit', function () {

        const fields = $('.field');
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

    // close photo guide
    $(document).on('click', '.btn-close-photo-guide', function () {
        $('.light-box').remove();
    });

    // open edit form
    let uploadImagesTemp = {};
    $(document).on('click', '.btn-open-edit-form', function () {

        let target = $(this).data('target');
        let form = $(`#` + target);
        let fields = form.find('.field');

        form.find('.box-repeater .box-repeater-item').addClass('old');
        form.find('.box-repeater').each(function(){
            const selectedItems = $(this).find('.box-repeater-remove');
            if(selectedItems.length > 1) selectedItems.show();
            else selectedItems.hide();
        })

        fields.each(function () {

            let field = $(this);
            let type = field.data('type');
            let input;

            switch (type) {
                case 'text':
                case 'number':
                    input = field.find('input');
                    input.attr('data-main-value', input.val());
                    break;
                case 'radio':
                    input = field.find('input');
                    input.attr('data-main-value', $(`input[name="${input.attr('name')}"]:checked`).val());
                    break;
                case 'select':
                    input = field.find('input');
                    input.attr('data-main-value', input.val());
                    break;
                case 'checkbox':
                    input = field.find('input');
                    input.attr('data-main-value', input.is(':checked'));
                    break;
                case 'textarea':
                    input = field.find('textarea');
                    input.attr('data-main-value', input.val());
                    break;
                case 'upload':
                    const uploadZone = field.find('.upload-drop-zone');
                    uploadZone.attr('data-main-default', uploadZone.attr('data-default'));

                    input = field.find('input');
                    input.attr('data-main-value', input.val());
                    break;
                default:
                    break;
            }

        });

        form.find('.table-repeater').each(function(){
            const repeaterInput = $(this).find('input.table-repeater-input');
            repeaterInput.attr('data-main-value', repeaterInput.val())
        })

        form.addClass('active');
        bodyOverflowController(true);
        form.find('.field').removeClass('field--invalid field--valid');
        form.find('.field-error-msg').removeClass('active');
        $('.edit-form-overlay').addClass('active');

    });

    // close form edit with click on overlay or cancel
    $(document).on('click', '.edit-form-overlay, .btn-edit-form-cancel', function () {

        let form = $('.edit-form.active');

        elementRepeater.forEach(function (elmID, elmIndex) {
            const elmFiend = $(`#${elmID}`);
            if(elmFiend.length) elmFiend.remove();
        });
        elementRepeater = [];

        form.find('.box-repeater .box-repeater-item.remove').removeClass('remove').show();
        form.find('.box-repeater .box-repeater-item:not(.old)').remove();

        let fields = form.find('.field');

        fields.each(function () {

            let field = $(this);
            let type = field.data('type');
            let input;

            switch (type) {
                case 'text':
                case 'number':
                    input = field.find('input');
                    input.val(input.data('main-value')).trigger('change');
                    break;
                case 'radio':
                    input = field.find('input');
                    form.find(`input[name="${input.attr('name')}"][value="${input.data('main-value')}"]`).prop('checked', true).trigger('change');
                    break;
                case 'select':
                    input = field.find('input');
                    input.val(input.attr('data-main-value')).trigger('reset');
                    break;
                case 'checkbox':
                    input = field.find('input');
                    input.prop('checked', input.data('main-value')).trigger('change');
                    break;
                case 'textarea':
                    input = field.find('textarea');
                    input.val(input.data('main-value')).trigger('change');
                    break;
                case 'upload':
                    const uploadZone = field.find('.upload-drop-zone');
                    uploadZone.attr('data-default', uploadZone.attr('data-main-default'));
                    uploadZone.trigger('reset');

                    input = field.find('input');
                    input.val(input.data('main-value')).trigger('change');
                    break;
                default:
                    break;
            }

        });

        form.find('.table-repeater').each(function(){
            const repeaterInput = $(this).find('input.table-repeater-input');
            repeaterInput.val(repeaterInput.attr('data-main-value'));
            repeaterInput.attr('data-main-value', null)
            $(this).trigger('rebuild')
        })

        form.removeClass('active');
        bodyOverflowController();
        form.find('.field-error-msg').removeClass('active');
        $('.edit-form-overlay').removeClass('active');

        return false;

    });

    // update value edit form
    $(document).on('click', '.btn-edit-form-done', function () {

        let form = $(this).parents('.edit-form');
        let fields = form.find('.field');
        let isFailde = false;

        fields.each(function(index,item){
            const pro = new ProValidation();
            const sts = pro.singleValidate(item);

            if($(item).parents('[data-dependency-show=false]').length > 0) return;

            if (isFailde === false && !sts) isFailde = true;
        });

        // check table repeater
        form.find('.table-repeater').each(function(){
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

        if(isFailde) return false;

        elementRepeater = [];

        form.find('.box-repeater .box-repeater-item.remove').remove();

        // change value real time
        changeValueRealTime(form);

        form.find('.table-repeater').each(function(){
            const repeaterInput = $(this).find('input.table-repeater-input');
            repeaterInput.attr('data-main-value', null)
            $(this).trigger('rebuildLive')
        })

        $('.edit-form').removeClass('active');
        $('.edit-form-overlay').removeClass('active');
        bodyOverflowController();

        return false;

    });

    // remove member in request hiring
    $(document).on('click', '.btn_remove_member_request_hiring', function () {
        let card = $(this).parents('.model-card');
        let no = $(this).data('no');

        // use filterDesktopData variable in ajax
        $.ajax({
            url: env.baseURL + '/api/',
            type: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: no,
            success: function (resp) {
                card.parent().remove();
            },
            error: function (xhr, status, error) {
                card.parent().remove(); // this line is for testing
                // print log error or use other code
            },
        });
    });

    // remove member in bookmark select model
    $(document).on('click', '.field-type-checkbox-model button.btn-remove', function () {
        const field = $(this).parents('.field');
        const modelID = $(this).data('id');
        let storageData = localStorage.getItem('bookmark');

        // convert string to array (split with ",")
        storageData = storageData? storageData.split(',') : [];

        // check exist item in map
        if(!storageData.includes(modelID.toString())) {
            console.log('The model ID does not match the IDs in the bookmark');
            return;
        }

        // remove from array
        storageData = storageData.filter(function(element) {
            return element !== modelID.toString();
        });

        // update localStorage and remove check box
        localStorage.setItem('bookmark',storageData);
        field.parent().remove();
    });

    // final step
    // change realtime value with field
    function changeValueRealTime(form){

        const fields = form.find('.field');
        const repeatElements = form.find('.box-repeater');

        function cVRT_Rep_Name(elm){
            return $(elm).find('input, textarea').attr('name');
        }

        function cVRT_Rep_Col(elm, index, isFull = false){

            const _Element = $(elm);
            const _Type = _Element.data('type');
            const _Label = _Element.find('label').html();
            const _IsTextArea = _Element.find('textarea');
            const _Value = $(elm).find('input, textarea').val();

            const out =
                '<div class="table-col ' + (isFull? 'col-full-width' : '') + '">' +
                '    <div class="check-item ' + (_IsTextArea.length? 'long-value' : '') + '">' +
                '        <div class="check-label">' + _Label + ' ' + (index + 1) + ':</div>' +
                '        <div class="check-value" data-input-watcher="' + cVRT_Rep_Name(elm) + '">' +
                '            -' +
                '        </div>' +
                '    </div>' +
                '</div>';

            return out;

        }

        repeatElements.each(function(index,item){

            const repElement = $(item);
            const targetID = repElement.data('realtime-object');
            const targetElement = $(`#${targetID}`);

            // reset html
            targetElement.html('');

            $(item).find('.box-repeater-item').each(function(_index,_item){

                const repItemElement = $(_item);
                const repFields = repItemElement.find('.field');

                for(let i = 0; i < repFields.length; i += 2){

                    // check use 2 column
                    if(repFields[i + 1]){

                        if($(repFields[i]).find('textarea').length || $(repFields[i+1]).find('textarea').length){
                            targetElement.append(
                                '<div class="table-row">' +
                                '   ' + cVRT_Rep_Col(repFields[i], _index,true) +
                                '</div>'
                            );
                            targetElement.append(
                                '<div class="table-row">' +
                                '   ' + cVRT_Rep_Col(repFields[i+1], _index,true) +
                                '</div>'
                            );
                        }else{
                            targetElement.append(
                                '<div class="table-row">' +
                                '   ' + cVRT_Rep_Col(repFields[i], _index) +
                                '   ' + cVRT_Rep_Col(repFields[i+1], _index) +
                                '</div>'
                            );
                        }

                    }else{
                        targetElement.append(
                            '<div class="table-row">' +
                            '   ' + cVRT_Rep_Col(repFields[i], _index,true) +
                            '</div>'
                        );
                    }

                }

            });

        });

        fields.each(function(index,item){
            const field = $(item);
            const type = field.data('type');

            let input;
            let value;

            switch (type) {
                case 'text':
                case 'number':

                    input = field.find('input');
                    value = input.val();
                    $(`[data-input-watcher="${input.attr('name')}"]`).html(value === '' ? '-' : value);

                    break;
                case 'select':

                    input = field.find('input');
                    value = input.attr('data-label');
                    $(`[data-input-watcher="${input.attr('name')}"]`).html(value === '' ? '-' : value);

                    break;
                case 'radio':

                    input = field.find('input');
                    let checked = $(`input[name="${input.attr('name')}"]:checked`);
                    value = checked.parent().text().trim();
                    $(`[data-input-watcher="${input.attr('name')}"]`).html(value === '' ? '-' : value);

                    break;
                case 'checkbox':

                    input = field.find('input');
                    let element = $(`[data-input-watcher="${input.attr('name')}"]`);
                    if (input.is(':checked')) element.html('<i class="icon-tick"></i>'); else element.html('<i class="icon-close"></i>');

                    break;
                case 'textarea':

                    input = field.find('textarea');
                    value = input.val();
                    $(`[data-input-watcher="${input.attr('name')}"]`).html(value === '' ? '-' : value);

                    break;
                case 'upload':

                    input = field.find('input');
                    const uploadZone = field.find('.upload-drop-zone');
                    const inpElement = $(`[data-input-watcher="${input.attr('name')}"]`);
                    let data = [];

                    // decode data
                    try {
                        data = JSON.parse(uploadZone.attr('data-default'));
                    }catch (e){ data = [] }

                    if(inpElement.hasClass('image-preview')) inpElement.html('');
                    else inpElement.find('.image-preview-item').remove();

                    // check is empty value
                    if (data.length > 0) {

                        // If the image-preview-eye class is present in the watcher element, it will display
                        // the content in the form of an eye (clicking on it will create a popup for display).
                        if(inpElement.hasClass('image-preview-eye')){
                            let imageList = [];
                            let previewButton = $(`<button type="button" class="image-preview-eye-button"><i class="icon-eye"></i></button>`);
                            data.forEach(function(item){
                                imageList.push(item.thumbnail);
                            })
                            previewButton.attr('data-images', JSON.stringify(imageList));
                            inpElement.html(previewButton);
                            break;
                        }

                        data.forEach(function(item){
                            inpElement.append(`<div class="image-preview-item"><a href="${item.thumbnail}" target="_blank"><img src="${item.thumbnail}"></a></div>`);
                        })

                    } else {
                        inpElement.html(`-`);
                    }

                    break;

                default:
                    break;

            }

        });

    }

    // create image with object image for upload
    $(document).on('change', '.img-upload input', function () {

        let _this = $(this);
        let base = _this.parents('.img-upload');
        let isMultiSelect = base.hasClass('multiple');
        let imagesID = _this.val().split('|');
        let wSize = $(window).width();

        // clear all items
        base.find('.img-upload-ratio, .btn-upload-ratio').remove();
        base.removeClass('group-style layout-1 layout-2 layout-3');

        if (imagesID[0] !== '') {

            imagesID.forEach(function (id, index) {
                let item = imageSelected[id];
                let imageSource = item.options.type === 'base64' ? item.base64 : item.url;
                let gElement = $(
                    `<div class="img-upload-ratio update-file ${imageSource ? 'is-image' : ''}" data-object-id="${item.id}" style="background-image:url(${imageSource});">
                            <div class="img-upload-label">
                                <span>Choose the photo again</span>
                            </div>
                            <button type="button" class="btn btn-icon">
                                <i class="icon-trash"></i>
                            </button>
                        </div>`
                );
                if (index < 3 && wSize > 576) {
                    base.prepend(gElement);
                } else if (wSize < 576) {
                    base.prepend(gElement);
                }
                base.find('.upload-more-file .upload-inner-content').append(gElement.clone());
                base.find('.upload-more-file .upload-footer .count').html(20 - imagesID.length);
            })

            if (isMultiSelect && wSize > 576) {
                if (imagesID.length < 4) {
                    base.addClass('group-style layout-' + imagesID.length);
                    base.append(
                        `<div class="btn-upload-ratio choose-file">
                            <div class="img-upload-label">
                            You can upload more ${20 - imagesID.length} photos
                                <span>Choose a File</span>
                            </div>
                        </div>`
                    );
                } else {
                    base.addClass('group-style layout-3');
                    base.append(
                        `<div class="btn-upload-ratio more-file">
                            <div class="img-upload-label">
                                <span>See all uploaded photos</span>
                            </div>
                        </div>`
                    );
                }
            } else if (isMultiSelect) {
                base.addClass('group-style layout-3');
                base.append(
                    `<div class="btn-upload-ratio choose-file" ${(imagesID.length % 2) == 0 ? 'style="width:100%;"' : ''}>
                        <div class="img-upload-label">
                        You can upload more ${20 - imagesID.length} photos
                            <span>Choose a File</span>
                        </div>
                    </div>`
                );
            }

        } else { // default element for select new image
            let labelUpBox = base.data('label');
            base.append(
                `<div class="img-upload-ratio choose-file first-ratio">
                    <div class="img-upload-label">
                        ${labelUpBox ? labelUpBox : ''}
                        <span>Choose a File</span>
                    </div>
                </div>`
            );
        }

    });

    // set default image uploaded
    $('.img-upload').each(function () {

        let element = $(this);
        let isMultiSelect = element.hasClass('multiple');
        let images = element.data('default-image');
        let input = element.find('input');
        let value = [];

        if (images) {
            images.forEach(function (item) {

                let imageObject = new PhotoSelector({
                    id: item.id,
                    type: item.type,
                    url: item.type === 'url' ? item.link : null,
                    base64: item.type === 'base64' ? item.base64 : null,
                    onDoneCrop: function (_class) {
                        // alert('ok');
                        let ids = input.val().split('|');
                        let temp = [];

                        temp.push(_class.id);
                        if (isMultiSelect) {
                            ids.forEach(function (id) {
                                if (id != _class.id && id != '') temp.push(id);
                            });
                        }

                        _class.options.type = 'base64';
                        input.val(temp.join('|'));
                        input.trigger('change');
                    }
                });

                value.push(item.id);

            });
            input.val(value.join('|')).trigger('change');
        }

    })

    // add item and open choose photo
    $(document).on('click', '.img-upload .choose-file', function () {

        let _this = $(this);
        let base = _this.parents('.img-upload');
        let isMultiSelect = base.hasClass('multiple');
        let input = base.find('input');
        let ids = input.val().split('|');

        if (ids.length < 20) {
            let imageObject = new PhotoSelector({
                type: 'base64',
                onDoneCrop: function (_class) {
                    let temp = [];

                    temp.push(imageObject.id);
                    if (isMultiSelect) {
                        ids.forEach(function (id) {
                            if (id != imageObject.id && id != '') temp.push(id);
                        });
                    }

                    input.val(temp.join('|'));
                    input.trigger('change');
                }
            });

            // override value
            imageObject.chooseFile();
        } else {
            alert('Can Not Add More 20 Photo');
        }

    });

    // open choose photo
    $(document).on('click', '.img-upload .update-file', function () {

        let _this = $(this);
        let imageObject = imageSelected[_this.data('object-id')];

        // open file selector
        imageObject.chooseFile();

    });

    // open light box more photos
    $(document).on('click', '.img-upload .more-file', function () {

        let _this = $(this);
        let base = _this.parents('.img-upload');
        let input = base.find('input');
        let imagesID = input.val().split('|');
        let moreFrame = $(
            `<div class="upload-more-file">
                <div class="overlay"></div>
                <div class="upload-content">
                    <div class="upload-header">
                        <div class="upload-title">Your Photos:</div>
                        <button type="button" class="btn btn-icon btn-close-upload-more-file">
                            <i class="icon-close"></i>
                        </button>
                    </div>
                    <div class="upload-inner-content"></div>
                    <div class="upload-footer">
                        <span>You can upload more <span class="count">${20 - imagesID.length}</span> photos</span>
                        <a class="choose-file">Choose a File</a>
                    </div>
                </div>
            </div>`
        );

        imagesID.forEach(function (id) {
            if (id == '') return true;
            let item = imageSelected[id];
            let imageSource = item.options.type === 'base64' ? item.base64 : item.url;
            let gElement = $(
                `<div class="img-upload-ratio update-file ${imageSource ? 'is-image' : ''}" data-object-id="${item.id}" style="background-image:url(${imageSource});">
                    <div class="img-upload-label">
                        <span>Choose the photo again</span>
                    </div>
                    <button type="button" class="btn btn-icon">
                        <i class="icon-trash"></i>
                    </button>
                </div>`
            );
            moreFrame.find('.upload-inner-content').append(gElement);
        });

        [moreFrame.find('.overlay'), moreFrame.find('.btn-close-upload-more-file')].forEach(function (element) {
            element.on('click', function () {
                moreFrame.removeClass('visible');
                setTimeout(function () {
                    moreFrame.remove()
                }, 160);
            });
        });

        base.append(moreFrame);
        setTimeout(function () {
            moreFrame.addClass('visible')
        }, 160);

    });

    // delete photo
    $(document).on('click', '.img-upload .update-file button', function () {

        let _this = $(this);
        let base = _this.parents('.img-upload');
        let item = _this.parents('.update-file');
        let _id = item.data('object-id');
        let input = base.find('input');
        let imagesID = input.val().split('|');
        let temp = [];

        imagesID.forEach(function (id) {
            if (id != _id) temp.push(id);
        });

        // delete imageSelected[_id];
        input.val(temp.join('|')).trigger('change');
        delete imageSelected[_id];
        return false;

    });

    // change offer box status
    $(document).on('change', '.offer-info-box [name="offer_status"]', function () {
        let aTag = $('.btn-modeling-offer-next');
        let link = aTag.data('link');

        aTag.removeClass('disable');
        aTag.attr('href', `${link}?status=${$(this).val()}`);
    });

    // submit modeling offer form
    $(document).on('click', '.btn-modeling-offer-submit', function () {

        let resultValidation = formValidation('form', true);
        let resultKeys = Object.keys(resultValidation);
        let messageWrapper = $('.form-validation-messages');

        // check not empty
        if (resultKeys.length) {

            messageWrapper.find('li').remove();
            messageWrapper.show();
            resultKeys.forEach(function (item) {
                messageWrapper.find('ul').append(`<li>${resultValidation[item].label}</li>`);
            });

            return false;

        } else {
            messageWrapper.hide();
        }

    });

    // Add time to report time problem
    let timeItemsIndex = 0;
    $(document).on('click', '.more-time .btn-add-new-tim', function () {

        let parentElement = $(this).parents('.more-time');
        let listElement = parentElement.find('.more-time-list');

        listElement.append(
            `<div class="more-time-item">
                <div class="field field-type-nr-input" data-field-validation="true" data-type="date" data-error-msg-mini="Error" data-error-msg="Select Time (from) [${timeItemsIndex}]">
                    <div class="field-content">
                        <label for="date_request_more[${timeItemsIndex}][from]">Select Time(From)</label>
                        <input type="text" class="field-datepicker" name="date_request_more[${timeItemsIndex}][from]" id="date_request_more[${timeItemsIndex}][from]" placeholder="Select Date" data-limit-object="#date_request_more_to_${timeItemsIndex}">
                    </div>
                    <i class="icon-calendar"></i>
                </div>
                <div class="field field-type-nr-input" data-field-validation="true" data-type="date" data-error-msg-mini="Error" data-error-msg="Select Time (to) [${timeItemsIndex}]">
                    <div class="field-content">
                        <label for="date_request_more_to_${timeItemsIndex}">Select Time(To)</label>
                        <input type="text" class="field-datepicker" name="date_request_more[${timeItemsIndex}][to]" id="date_request_more_to_${timeItemsIndex}" placeholder="Select Date">
                    </div>
                    <i class="icon-calendar"></i>
                </div>
            </div>`
        );

        timeItemsIndex++;
        fieldDetector();

    })

    // change view mode to grid
    $(document).on('click', '.btn-view-mode-category', function () {
        $(this).addClass('active');
        $('.btn-view-mode-list').removeClass('active');
        $('.grid-photo-2').removeClass('view-mode-list');
    })

    // change view mode to list
    $(document).on('click', '.btn-view-mode-list', function () {
        $(this).addClass('active');
        $('.btn-view-mode-category').removeClass('active');
        $('.grid-photo-2').addClass('view-mode-list');
    })

    // open popup download composites
    $(document).on('click', '.btn-archive-download-composites', function () {

        let btnDownload = $('<button type="button" class="btn btn-full btn-primary">Download</button>');
        let btnCancel = $('<button type="button" class="btn btn-full">Cancel</button>');
        let content = $(
            `<div class="field field-type-checkbox">
                <div class="field-content">
                    <label>
                        <input type="checkbox" name="all">
                        <div class="checkmark"></div>
                        <div class="field-label">All</div>
                    </label>
                </div>
            </div>
            <div class="field field-type-checkbox">
                <div class="field-content">
                    <label>
                        <input type="checkbox" name="accepted">
                        <div class="checkmark"></div>
                        <div class="field-label">Accepted</div>
                    </label>
                </div>
            </div>
            <div class="field field-type-checkbox">
                <div class="field-content">
                    <label>
                        <input type="checkbox" name="send_copy">
                        <div class="checkmark"></div>
                        <div class="field-label">Send me a copy of this document.</div>
                    </label>
                </div>
            </div>`
        );

        let popup = addAlertPopup({
            class: 'popup-download-composites',
            type: 'icon', // icon or avatar
            status: 'download', // success, danger, info or warning
            title: `Download Composites`,
            actionElements: [btnCancel, btnDownload], // element object
            content: content,
            actionLayout: 'horizontal', // horizontal or vertical
        });

        btnCancel.on('click', function () {
            popup.distory();
        });
        btnDownload.on('click', function () {
            popup.distory();
        });

    });

    // check confirm password in reset password
    $(document).on('click', '.btn-from-set-password', function () {

        let password_1 = $('input[name="password"]');
        let password_2 = $('input[name="confirm-password"]');
        let p_1 = password_1.val();
        let p_2 = password_2.val();

        if (p_1 === '' || p_2 === '' || (p_1 !== p_2)) {
            password_1.parents('.field').addClass('field--invalid');
            password_2.parents('.field').addClass('field--invalid');

            // disable default event
            return false;

        }

    });

    // open select models from bookmark in request hiring model
    $(document).on('click', '.btn-md-add-from-bookmark', function () {

        let popup = new PopupJS({
            class: 'popup-request-hiring-select-model-bookmark',
            onBeforeGenerate: function (cls) {

                let content = $(document.getElementById('form_request_hiring_select_models').outerHTML);

                cls.content.append(content);
                content.find('#btn_cancel_add_model').on('click', function () {
                    cls.distory();
                })

            },
            onAfterGenerate: function () {
                _lazyLoadingGlobal.update();
            }
        });

        // disable default event
        return false;

    });

    // send contact us form
    $(document).on('click', '.btn-contact-send-support', function () {

        const _this = $(this);
        const form = $('form');
        const fields = form.find('.field');
        let hasFaildeField = false;

        fields.each(function(index,item){

            const _ProValidation = new ProValidation();
            const _ValidateResult = _ProValidation.singleValidate(item);

            if (hasFaildeField === false && !_ValidateResult) hasFaildeField = true;

        });

        // not found error in fields. you can run code
        if(!hasFaildeField){
            _this.addClass('disable').html('Waiting...');
            clearFocus();

            $.ajax({
                url: env.baseURL + "url",
                type: "POST",
                data: {
                    name: $('#field_name').val(),
                    company: $('#field_company').val(),
                    email: $('#field_mail').val(),
                    phoneNumber: $('#field_phone').val(),
                    category: $('#field_category').val(),
                    message: $('#field_message').val(),
                },
                success: function(data) {
                    _this.removeClass('disable').html('Send');
                    let btnBackHome = $('<a href="./home.html" class="btn btn-full btn-primary">Back to Home</a>');
                    addAlertPopup({
                        class: 'popup-contact-sent-support-message',
                        type: 'icon', // icon or avatar
                        status: 'success', // success, danger, info or warning
                        title: 'Sent',
                        content: 'We will be in touch very soon.',
                        actionElements: [btnBackHome], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });
                },
                error: function(error){
                    _this.removeClass('disable').html('Send');
                    let btnOk = $('<button type="button" class="btn btn-full btn-primary">Ok</button>');
                    let popup = addAlertPopup({
                        class: 'popup-contact-sent-support-message',
                        type: 'icon', // icon or avatar
                        status: 'danger', // success, danger, info or warning
                        title: 'There is a problem with the server, check your internet connection and try again.',
                        actionElements: [btnOk], // element object
                        actionLayout: 'horizontal', // horizontal or vertical
                    });

                    btnOk.on('click',function(){
                        popup.distory();
                    })
                }
            });

        }

        // disable default actions
        return false;

    });

    // TODO News And Share Button
    // start news event and share button

    // share button
    $(document).on('click', '.g-share-button', function (e) {
        e.preventDefault();

        if (navigator.share) {
            navigator.share({
                title: $(this).data('title'),
                text: $(this).data('text'),
                url: $(this).data('url'),
            })
        }

    });

    // load more news member (news category)
    $(document).on('click', '#btn_more_member_news', function (e) {
        e.preventDefault();

        if (navigator.share) {
            navigator.share({
                title: $(this).data('title'),
                text: $(this).data('text'),
                url: $(this).data('url'),
            })
        }

    });

    // TODO Replay Comment
    // This section is for comment events
    $(document).on('click','.post-comment-form .btn-submit',function(){
        const name = $('.post-comment-form form #comment_name').val();
        const email = $('.post-comment-form form #comment_email').val();
        const comment = $('.post-comment-form form #comment_text').val();
        const fields = $('.post-comment-form .field');
        let isFailde = false;

        fields.each(function (index, item) {
            const pro = new ProValidation();
            const sts = pro.singleValidate(item);

            if($(item).parents('[data-dependency-show=false]').length > 0) return;

            if (isFailde === false && !sts) isFailde = true;
        });

        if(isFailde) return false;
        $('.post-comment-form').append('<div class="post-comment-loading"><div class="loader-mini"></div></div>');

        $.ajax({
            url: env.baseURL + "/",
            type: "POST",
            data: {
                name: name,
                email: email,
                comment: comment
            },
            success: function(data) {
                $('.post-comment').prepend($('.post-comment-form'));
                $('.post-comment-form').find('input, textarea').val('');
                $('.post-comment-form .field').removeClass('field--invalid field--valid');
                $('.post-comment-form .field-error-msg').removeClass('active');
                $('.post-comment-form .post-comment-loading').remove();
            },
            error: function(error){
                $('.post-comment-form .post-comment-loading').remove();
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

        return false;
    })

    // replay comment
    $(document).on('click','.post-comment-content a.post-comment-replay',function(){
        const content = $(this).parents('.post-comment-content');
        content.append($('.post-comment-form'));
        $('.post-comment-form').find('input, textarea').val('');
        $('.post-comment-form .field').removeClass('field--invalid field--valid');
        $('.post-comment-form .field-error-msg').removeClass('active');
        $('.post-comment-form').addClass('is-replay');
        return false;
    })

    // replay comment cancel
    $(document).on('click','.post-comment-form .btn-cancel',function(){
        $('.post-comment').prepend($('.post-comment-form'));
        $('.post-comment-form').find('input, textarea').val('');
        $('.post-comment-form .field').removeClass('field--invalid field--valid');
        $('.post-comment-form .field-error-msg').removeClass('active');
        $('.post-comment-form').removeClass('is-replay');
        return false;
    })

    // TODO Load Window
    // set event and run function with load window

    // load window
    $(window).on('load', function () {

        if (typeof Swiper != 'undefined') {

            // news main slider
            let newMainSlider = new Swiper(".news-main-carousel", {
                spaceBetween: 0,
                slidesPerView: 1,
                loop: true,
                breakpoints: {
                    576: {
                        spaceBetween: 24,
                        slidesPerView: 2,
                    }
                }
            });

            let setSliderSideSpace = function (e) {
                let swiperElement = $(e.el);
                let windowSize = $(window).width();
                let freeSpace = windowSize - swiperElement.width();

                $(e.slides).addClass('slide-changed');
                swiperElement.css({
                    marginLeft: freeSpace / 2 * -1,
                    marginRight: freeSpace / 2 * -1,
                    paddingLeft: freeSpace / 2,
                    paddingRight: freeSpace / 2,
                });
            };

            // special carousel
            let specialNewsSliderSC = new Swiper(".new-special-slider-sc", {
                slidesPerView: 'auto',
                spaceBetween: 56,
                centeredSlides: true,
                freeModeSticky: false,
                watchSlidesProgress: true,
                watchSlidesVisibility: true,
                loop: true,
                on: {
                    init: setSliderSideSpace,
                    resize: function (e) {
                        specialNewsSliderSC.slideReset();
                        setSliderSideSpace(e);
                    },
                },
            });

            // normal special carousel
            let specialNewsSlider = new Swiper(".new-special-slider", {
                spaceBetween: 32,
                slidesPerView: 1.5,
                breakpoints: {
                    768: {
                        spaceBetween: 32,
                        slidesPerView: 2.5,
                    },
                    1200: {
                        spaceBetween: 56,
                        slidesPerView: 3.15,
                    },
                },
                on: {
                    init: setSliderSideSpace,
                    resize: setSliderSideSpace,
                },
            });

            $(document).on('click','#special_news_prev',function(){
                specialNewsSlider.slidePrev();
            });

            $(document).on('click','#special_news_next',function(){
                specialNewsSlider.slideNext();
            });

            // request for hiring models slider
            let hiringRequestModelSlider = new Swiper(".hiring-models-slider", {
                slidesPerView: 1.5,
                spaceBetween: 16,
                centeredSlides: false,
                loop: false,
                breakpoints: {
                    576: {
                        spaceBetween: 16,
                        slidesPerView: 2.5,
                    },
                    874: {
                        spaceBetween: 16,
                        slidesPerView: 3,
                    },
                },
                on: {
                    init: setSliderSideSpace,
                    resize: function (e) {
                        specialNewsSliderSC.slideReset();
                        setSliderSideSpace(e);
                    },
                },
            });

            // portfolio single models slider
            let portfolioSingleModelsSlider = new Swiper(".portfolio-models-slider", {
                slidesPerView: 1.5,
                spaceBetween: 16,
                centeredSlides: false,
                loop: false,
                breakpoints: {
                    576: {
                        spaceBetween: 16,
                        slidesPerView: 2.5,
                    },
                    874: {
                        spaceBetween: 16,
                        slidesPerView: 5,
                    },
                },
                on: {
                    init: setSliderSideSpace,
                    resize: function (e) {
                        specialNewsSliderSC.slideReset();
                        setSliderSideSpace(e);
                    },
                },
            });

        }

        // lazy loading images
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

    $(window).on("pageshow", function(event) {
        if (event.originalEvent.persisted) {
            // Removing loading after loading the page from stretched mode (return to the previous page)
            // remove page loading
            setTimeout(function () {
                $('.page-loading').removeClass('visible');
                $('body').css('visibility', 'visible');
            }, 300);
        }
    });

    // TODO Unload Window
    // It is usually used when we want to do something before the user leaves the page or get confirmation
    // from the user to leave.

    // add event on before unload window
    $(window).on('beforeunload', function (e) {
        $('.page-loading').addClass('visible');
    });

    // *** run script with document loaded
    // ***

    $(document).ready(function () {

        // hook - resize window
        let resizeWindowCallback = [];

        // define function bookmark item resized
        function bookmarkResizeItems() {
            let itemsBox = $('.bookmark-items');
            let items = itemsBox.find('.bookmark-item');
            let width = itemsBox.width();

            if (width > 1200) items.width((width - 80) / 6);
            else if (width > 768) items.width((width - 64) / 5);
            else if (width > 576) items.width((width - 48) / 4);
            else items.width((width - 16) / 2);
        }

        // reset bookmark item width
        bookmarkResizeItems();
        resizeWindowCallback.push(bookmarkResizeItems);

        // control apply as a model form visibility on mobile
        function applyFormController() {

            // window size
            let windowSize = $(window).width();

            if (windowSize <= 576) {
                $('.visible-desktop').attr('data-dependency-show', 'false');
                $('.visible-mobile').attr('data-dependency-show', 'true');
            } else {
                $('.visible-desktop').attr('data-dependency-show', 'true');
                $('.visible-mobile').attr('data-dependency-show', 'false');
            }

        }

        applyFormController();
        resizeWindowCallback.push(applyFormController);

        // resize window
        $(window).resize(function () {
            resizeWindowCallback.forEach(function (item) {
                if (typeof item == 'function') item();
            });
        });

    });

    // TODO Functions
    // This section contains the functions that are supposed to be used publicly in this file and most likely
    // do more than one thing.

    // This function disables all focus. It is usually used for parts that need to remove the focus from
    // (input, textarea, select and button) so that nothing happens if the user unconsciously touches buttons
    // like Enter and Space.
    // For example, if a button is clicked to create an AlertPopUp, by pressing Enter again, the Alert should
    // not be created again, so we must remove the focus.
    function clearFocus(){
        $('input, select, textarea, button, a').blur();
    }

})(jQuery);

/**
 * Create country items for nationality and language section.
 * This event is executed by clicking the filter button in mobile mode.
 *
 * @param contentElement An element that holds the search field and the list object and has the name-prefix attribute.
 */
function createFilterItemsCountryFlag(contentElement, isLanguage = false) {

    // check items before added
    if (contentElement.hasClass('items-added')) return false;

    new ApiRequest({
        url: env.baseURL + (isLanguage? '/api/languages' : '/api/country'),
        success: function (res) {

            let namePrefix = contentElement.data('name-prefix');
            let ul = contentElement.find('ul');

            res.forEach(item => {
                ul.append($(
                    '<li>' +
                    '<div class="field field-type-checkbox">' +
                    '<div class="field-content">' +
                    '<label>' +
                    (item.flag? '<img class="filter-img-icon" src="' + item.flag + '" alt="' + item.text + '">' : '') +
                    '<div class="field-label">' + item.text + '</div>' +
                    '<input type="checkbox" name="' + namePrefix + '" value="' + item.value + '" id="' + namePrefix + '">' +
                    '<div class="checkmark"></div>' +
                    '</label>' +
                    '</div>' +
                    '</div>' +
                    '</li>'
                ));
            });
            contentElement.addClass('items-added');

            // search
            contentElement.find('.field input').on('keyup', function () {
                let s = $(this).val();

                // check empty
                if (s == '') contentElement.find('ul li').show();
                else {
                    contentElement.find('ul li').each(function () {

                        let li = $(this);
                        let label = li.find('.field-label').html();

                        if (label.search(new RegExp(s, 'i')) != -1) li.show();
                        else li.hide();

                    });
                }
            });

        },
    });

}
