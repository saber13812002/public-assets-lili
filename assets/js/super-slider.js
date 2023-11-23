"use strict";

// script
(function ($) {

    const timer = 7000;
    const slider = $('.super-slider');
    const carousel = $('.owl-carousel');
    const carouselItems = carousel.find('.item');
    const sliderContents = slider.find('.slider-view .slider-contents');
    const sliderThumbnails = slider.find('.slider-view .slider-thumbnails');
    const sliderThumbnailsWrapper = sliderThumbnails.find('.slider-thumbnails-wrapper');
    const sliderNumber = slider.find('.slide-number');

    let thumbnailIndex = 0;
    let disableEvent = false;
    let initialized = false;

    carouselItems.each(function (index) {

        const item = $(this);
        const thumbnail = item.find('.item-thumbnail');
        const content = item.find('.item-content');

        item.addClass(`slider-item-${index}`).attr('data-index', index);
        thumbnail.addClass(`slider-thumbnail-${index}`).attr('data-index', index);
        content.addClass(`slider-content-${index}`).attr('data-index', index);

        sliderThumbnailsWrapper.append(thumbnail);
        sliderContents.append(content);

    });

    // initialize thumbnail
    initialThumbnails();

    const owl = carousel.owlCarousel({
        loop: true,
        lazyLoad: true,
        margin: 0,
        items: 1,
        autoplay: true,
        autoplayTimeout: timer,
        onChanged: function (event) {
            refreshView(event);
            if(initialized) {
                owl.trigger('stop.owl.autoplay');
                owl.trigger('play.owl.autoplay', [timer]);
            }
        },
        onResized: function (event) {
            refreshView(event);
        },
        onInitialized: function (event) {
            contentLineViewController();
            initialized = true;
        }
    });

    // move to next slide
    slider.find('.slider-nav-next').on('click', function () {
        if (disableEvent) return false;

        owl.trigger('stop.owl.autoplay');
        owl.trigger('play.owl.autoplay', [timer]);
        carousel.trigger('next.owl.carousel');
    })

    // move to prev slide
    slider.find('.slider-nav-prev').on('click', function () {
        if (disableEvent) return false;

        owl.trigger('stop.owl.autoplay');
        owl.trigger('play.owl.autoplay', [timer]);
        carousel.trigger('prev.owl.carousel');
    })

    // move to prev slide
    slider.find('.slider-thumbnails .item-thumbnail').on('click', function () {
        if ($(this).hasClass('first') || disableEvent) return false;
        let loopController = true;
        owl.trigger('stop.owl.autoplay');
        owl.trigger('play.owl.autoplay', [timer]);

        while (loopController) {
            carousel.trigger('prev.owl.carousel');
            if ($(this).hasClass('first')) {
                loopController = false;
            }
        }

    })

    function refreshView(event) {
        const index = event.page.index < 0 ? 0 : event.page.index;

        // update slide number
        slider.find('.slide-number span').html(index > 9 ? index + 1 : `0${index + 1}`)

        // update content
        sliderContents.find('.item-content').removeClass('active');
        sliderContents.find(`.slider-content-${index}`).addClass('active');

        // update position thumbnails
        updatePositionThumbnail(index);
    }

    function initialThumbnails() {
        updateSizeThumbnail();
    }

    function updatePositionThumbnail(index, direction) {
        const gap = 32;
        const aspectRatio = 3 / 4;
        let items = sliderThumbnailsWrapper.find('.item-thumbnail');
        let shift = thumbnailIndex < index;
        let tempStart = [];
        let tempEnd = [];
        let left = 0;

        // must shift with direction
        if (direction !== undefined) shift = direction;

        // detect item
        items.each(function () {
            const item = $(this);

            if (item.index() >= index) tempStart.push(item);
            else tempEnd.push(item);
        });

        const final = [...tempStart, ...tempEnd];
        final.forEach(function (v, i) {
            const isFirst = i === 0;
            const isEnd = i === final.length - 1;
            const isMiddle = i > 0 && i < final.length - 1;

            let height = sliderThumbnails.height();
            let width = height * aspectRatio;

            v.removeClass('first end middle animate');

            if (isFirst) v.addClass('first');
            else if (isEnd) v.addClass('end');
            else v.addClass('middle');

            if (i !== 0) {
                height = height * 0.8;
                width = height * aspectRatio;
            }

            v.stop().animate({
                width: width,
                height: height,
                top: (sliderThumbnails.height() - height) / 2,
                left: left,
                zIndex: i,
            }, 350, function () {
                v.removeClass('animate');
            })

            left += width + gap;
        });

        thumbnailIndex = index;
    }

    // change width and height with aspect ratio
    function updateSizeThumbnail() {
        const gap = 32;
        const aspectRatio = 3 / 4;
        const heightThumbnail = sliderThumbnails.find('.slider-thumbnails-wrapper').height();
        const widthThumbnail = heightThumbnail * aspectRatio;

        sliderThumbnails.find('.item-thumbnail').each(function (i) {

            let newHeight = heightThumbnail;
            let newWidth = widthThumbnail;

            if (i !== 0) {
                newHeight = heightThumbnail * 0.8;
                newWidth = newHeight * aspectRatio;
            }

            $(this).css({
                width: newWidth,
                height: newHeight,
                left: newWidth * i + (gap * i),
                top: (heightThumbnail - newHeight) / 2,
                zIndex: i,
            })
        })
    }

    function contentLineViewController() {
        slider.find('.slider-contents .item-content').each(function(){
            const readMore = $(this).find('.item-read-more');
            const contentElement = $(this).find('.item-description');
            const lineHeight = parseInt(window.getComputedStyle(contentElement[0]).lineHeight);
            const numLines = contentElement[0].scrollHeight / lineHeight;

            if (numLines > 4){
                readMore.show();
            }else{
                readMore.hide();
            }
        })
    }

})(jQuery);