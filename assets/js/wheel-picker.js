/**
 * WheelPicker class is for creating value selection with wheel mode
 */
class WheelPicker {

    /**
     * Set initial values
     *
     * @param config Input value for initial settings
     * @returns {jQuery|HTMLElement} WheelPicker objectElement
     */
    constructor(config = {}) {

        let self = this;

        this.options = Object.assign({
            items: [],
            default: null,
            height: 48,
            around: 2,
            onSelect: function () { },
        }, config);

        this.step = 0;
        this.itemMoved = 0;
        this.isMove = false;
        this.startOffsetY = 0;
        this.moveOffsetY = 0;
        this.sensitivity = 1.5;
        this.frame = $('<div class="wheel-picker"></div>');
        this.wrapper = $('<div class="wheel-wrapper"></div>');
        this.frame.append(this.wrapper);

        this.generateItems();
        this.setDefault();
        this.setPosition();
        this.setEvents();

        return this.frame;

    }

    /**
     * Set the default option
     */
    setDefault() {
        this.frame.height((this.options.around * 2 + 1) * this.options.height);
        this.wrapper.css({
            paddingTop: this.options.around * this.options.height,
            paddingBottom: this.options.around * this.options.height
        });
    }

    /**
     * Set wheel position to current option
     */
    setPosition() {
        let items = this.wrapper.find(`.wheel-item`);
        let selected = this.wrapper.find(`.wheel-item[data-step=${this.step}]`);

        items.removeClass('active');
        selected.addClass('active');
        this.options.onSelect(selected.data('value'), selected);
        this.wrapperTranslateY(this.step * this.options.height * -1);
    }

    /**
     * Production of wheel items
     */
    generateItems() {
        let self = this;

        this.options.items.forEach(function (item, index) {

            let object = $(`<div class="wheel-item" data-step="${index}" data-value="${item.value}">${item.label}</div>`);


            object.css({
                height: self.options.height,
                lineHeight: self.options.height + 'px',
            });

            object.on('click', function () {
                if ($(window).width() < 576) {
                    self.step = parseInt($(this).data('step'));
                    self.setPosition();
                }
            });

            if (self.options.default) {
                if (self.options.default == item.value) self.step = index;
            } else self.step = 0;

            self.wrapper.append(object);

        });

    }

    /**
     * The translateY value of the wrapper element
     *
     * @param size
     */
    wrapperTranslateY(size) {
        this.wrapper.css({ 'transform': `translateY(${size}px)` });
    }

    /**
     * Set wheel controller events
     */
    setEvents() {

        let self = this;

        // mouse wheel
        this.frame.on('mousewheel', function (e) {

            if (e.originalEvent.wheelDelta > 0) {
                if (self.step - 1 < 0) self.step = 0;
                else self.step = self.step - 1;
            }
            else {
                if (self.step + 1 < self.options.items.length) self.step = self.step + 1;
                else self.step = self.options.items.length - 1;
            }

            self.setPosition();

            // disable default scroll
            return false;

        });

        // This function is for moving (dragging) items. It should be called by the mousedown or touchstart event.
        // Note that it disappears after mouseup or touchend
        const wheelPickerMoveListener = function (e){

            // check is touch end or mouse up
            if (self.isMove) {
                let currentPosition;

                if (e.originalEvent.clientY) currentPosition = e.originalEvent.clientY - self.startOffsetY;
                else currentPosition = e.originalEvent.touches[0].clientY - self.startOffsetY;

                self.moveOffsetY = currentPosition * self.sensitivity;
                self.wrapperTranslateY((self.step * self.options.height) * -1 + self.moveOffsetY);
            }

            // disabel move and select
            return false;

        }

        // This function is to finalize the temporary item
        // Note that it disappears after mouseup or touchend
        const wheelPickerMouseUpListener = function (e) {

            self.isMove = false;
            self.wrapper.removeClass('is-move');
            self.itemMoved = Math.round((self.moveOffsetY) / self.options.height * -1);

            if (self.step + self.itemMoved < 0) self.step = 0;
            else if (self.step + self.itemMoved < self.options.items.length) self.step = self.step + self.itemMoved;
            else self.step = self.options.items.length - 1;

            // mouse move and touch move
            $(document).off('touchmove mousemove', wheelPickerMoveListener);

            // mouse up and touch end
            $(document).off('touchend mouseup', wheelPickerMouseUpListener);

            self.setPosition();

            // disabel move and select
            return false;

        };

        // mouse down and touch start
        this.frame.bind('touchstart mousedown', function (e) {

            if (e.originalEvent.clientY) self.startOffsetY = e.originalEvent.clientY;
            else self.startOffsetY = e.originalEvent.touches[0].clientY;

            self.isMove = true;
            self.wrapper.addClass('is-move');

            // mouse move and touch move
            $(document).on('touchmove mousemove', wheelPickerMoveListener);

            // mouse up and touch end
            $(document).on('touchend mouseup', wheelPickerMouseUpListener);

            // disabel move and select
            return false;

        });

        // reset item
        this.frame.on('reset', function () {
            const newData = $(this).attr('data-items');
            const newDefault = $(this).attr('data-default');

            if(newData !== undefined){
                self.options.items = JSON.parse(newData);
                self.options.default = null;

                self.frame.find('.wheel-item').remove();

                self.generateItems();
                self.setDefault();
                self.setPosition();
            }
        })

    }

}