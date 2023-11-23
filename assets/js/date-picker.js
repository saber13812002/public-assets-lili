/**
 * The DatePicker class is used to create a popup calendar, rotating calendar, and time picker
 * This file depends on the LightPick, moment and wheel-picker.js libraries.
 */
class DatePicker {

    /**
     * All basic settings and DatePicker creation are executed in this function
     *
     * @param config
     */
    constructor(config = {}) {

        let self = this;
        let _default = {
            element: null,
            date: null,
            minDate: null,
            type: 'date', // date and time
            mode: 'normal', // normal and wheel
            title: 'Date',
            parent: null,
            isRange: false,
            submitBtnText: 'Submit',
            closeBtnIcon: 'icon-close',
            selectCallback: function () { },
            closeBtnCallback: function () { },
            submitBtnCallback: function () { },
            beforeGenerate: function () { },
            afterGenerate: function () { },
            beforeDistory: function () { },
            afterDistory: function () { },
        };

        config = { ..._default, ...config };

        this.config = config;
        this.frame = $(`<div class="date-picker type-${config.type} mode-${config.mode}"></div>`);
        this.overlay = $('<div class="overlay"></div>');
        this.content = $('<div class="content"></div>');
        this.innerContent = $('<div class="inner-content"></div>');
        this.header = $('<div class="header"></div>');
        this.title = $(`<div class="title">${config.title}</div>`);
        this.closeBtn = $(`<button type="button" class="btn btn-icon"><i class="${config.closeBtnIcon}"></i></button>`);
        this.footer = $('<div class="footer"></div>');
        this.submitBtn = $(`<button type="button" class="btn btn-primary btn-full">${config.submitBtnText}</button>`);
        this.input = $('<input type="hidden">');

        // elements placement
        this.frame.append([this.overlay, this.content]);
        this.content.append([this.header, this.innerContent, this.footer]);
        this.header.append([this.title, this.closeBtn])
        this.footer.append([this.submitBtn]);
        this.innerContent.append([this.input]);

        if (config.date) this.input.val(config.date);

        // date and time picker
        if (config.type == 'date') {
            if (config.mode == 'normal') this.getDatePicker();
            else this.getWheelDatePicker();
        } else this.getWheelTimePicker();

        // add events
        this.closeBtn.on('click', function () {
            config.closeBtnCallback(self);
        });

        this.overlay.on('click', function () {
            config.closeBtnCallback(self);
            self.distory();
        });

        this.submitBtn.on('click', function () {
            config.submitBtnCallback(self);
        })

        // generate
        this.generate();

    }

    /**
     * generate element and append to body
     */
    generate() {

        let self = this;

        // run scripts before generate
        this.config.beforeGenerate(this);

        if (this.config.parent) {
            this.config.parent.append(this.frame);
            setTimeout(function () {
                self.frame.addClass('visible');
                bodyOverflowController(true);
            }, 1)

            if($(window).width() > 576){
                function detectViewPortPosition(){
                    const thisViewPort = self.config.parent[0].getBoundingClientRect();
                    const contentHeight = self.content.height();
                    const windowHeight = $(window).height();
                    const withoutHeight = contentHeight + thisViewPort.y;
                    const topSpace = thisViewPort.y - (withoutHeight - windowHeight);

                    self.content.css({
                        top: withoutHeight > windowHeight? (topSpace < 0? 0 : topSpace) : thisViewPort.y,
                        left: thisViewPort.x,
                        width: thisViewPort.width,
                    })
                }
                detectViewPortPosition();

                $(window).on('scroll',detectViewPortPosition);
                this.config.parent.parents('*').on('scroll',detectViewPortPosition);
                self.content.on('destroy',function(){
                    $(window).off('scroll',detectViewPortPosition);
                    self.config.parent.parents('*').off('scroll',detectViewPortPosition);
                })
            }

        } else console.log('Please Set Parent Element');

        // run scripts after generate
        this.config.afterGenerate(this);

    }

    /**
     * Destruction of the DatePicker
     */
    distory() {

        let self = this;

        // run scripts before distory
        this.config.beforeDistory(this);

        this.frame.removeClass('visible');
        this.content.trigger('destroy');
        setTimeout(function () {
            self.frame.remove();
            bodyOverflowController();
        }, 160);

        // run scripts after distory
        this.config.afterDistory(this);

    }

    /**
     * This function is simple to create and return a calendar
     */
    getDatePicker() {
        let self = this;

        new Lightpick({
            field: this.input[0],
            inline: true,
            repick: this.config.date ? true : false,
            format:'YYYY/MM/DD',
            minDate: this.config.minDate,
            singleDate: !this.config.isRange,
            onSelect: function (start, end) {
                self.config.selectCallback(self, start, end);
            }
        });

    }

    /**
     * This function creates a wheel datepicker
     */
    getWheelDatePicker() {

        let self = this;
        let _date = moment();
        let _moment = moment(this.config.date ? this.input.val() : new Date(), 'YYYY/MM/DD');
        let maxYear = Number.parseInt(_date.format('YYYY'));
        let currentYear = Number.parseInt(_moment.format('YYYY'));
        let currentMonth = Number.parseInt(_moment.format('M'));
        let currentDay = Number.parseInt(_moment.format('D'));
        let lengthMonthDays = _moment.daysInMonth();
        let yearSection = $('<div class="wheel-years"><div class="wheel-label">Year</div></div>');
        let monthSection = $('<div class="wheel-months"><div class="wheel-label">Month</div></div>');
        let daySection = $('<div class="wheel-days"><div class="wheel-label">Day</div></div>');

        let wheelYear = new WheelPicker({
            around: 1,
            items: this.getYears(1900, maxYear),
            default: currentYear,
            onSelect: function (value) {
                currentYear = Number.parseInt(value);
                self.setDateInput(currentYear, currentMonth, currentDay);
            }
        })

        let wheelMonth = new WheelPicker({
            around: 1,
            items: this.getMonths(_moment),
            default: currentMonth,
            onSelect: function (value) {
                currentMonth = Number.parseInt(value);
                self.setDateInput(currentYear, currentMonth, currentDay);
            }
        })

        let wheelDays = new WheelPicker({
            around: 1,
            items: this.getDays(lengthMonthDays),
            default: currentDay,
            onSelect: function (value) {
                currentDay = Number.parseInt(value);
                self.setDateInput(currentYear, currentMonth, currentDay);
            }
        })

        yearSection.append(wheelYear);
        monthSection.append(wheelMonth);
        daySection.append(wheelDays);

        this.innerContent.append([yearSection, monthSection, daySection]);

    }

    /**
     * This function creates a wheel timepicker
     */
    getWheelTimePicker() {

        let self = this;
        let _moment = moment(this.config.date ? this.input.val() : new Date(), 'HH:mm');
        let currentHour = Number.parseInt(_moment.format('H'));
        let currentMinute = Number.parseInt(_moment.format('mm'));
        let _momentMinDate = this.config.minDate? moment(this.config.minDate, 'HH:mm') : null;
        let minDateHour = _momentMinDate? Number.parseInt(_momentMinDate.format('H')) : 1;
        let minDateMinute = _momentMinDate? Number.parseInt(_momentMinDate.format('mm')) : 0;
        let hourSection = $('<div class="wheel-hour"><div class="wheel-label">Hour</div></div>');
        let minuteSection = $('<div class="wheel-minute"><div class="wheel-label">Minute</div></div>');

        let wheelMinute = new WheelPicker({
            around: 1,
            items: this.getMinute(currentHour === minDateHour? minDateMinute : 0),
            default: currentMinute,
            onSelect: function (value) {
                currentMinute = Number.parseInt(value);
                self.setTimeInput(currentHour, currentMinute);
            }
        })

        let wheelhour = new WheelPicker({
            around: 1,
            items: this.getHour(minDateHour, 24),
            default: currentHour >= minDateHour? currentHour : minDateHour,
            onSelect: function (value) {
                let old = currentHour;
                currentHour = Number.parseInt(value);
                self.setTimeInput(currentHour, currentMinute);

                if(self.config.minDate) {
                    if (currentHour === minDateHour) {
                        wheelMinute.attr('data-items',JSON.stringify(self.getMinute(minDateMinute)));
                    }else{
                        wheelMinute.attr('data-items',JSON.stringify(self.getMinute(0)));
                    }

                    if(old !== currentHour) wheelMinute.trigger('reset');
                }
            }
        })

        hourSection.append(wheelhour);
        minuteSection.append(wheelMinute);

        this.innerContent.append([hourSection, '<div class="seperator">:</div>', minuteSection]);

    }

    /**
     * Save date with specified format in input.
     * It is used for wheel mode.
     *
     * @param year
     * @param month
     * @param day
     */
    setDateInput(year, month, day) {
        this.input.val(`${this.formatNumber(year)}/${this.formatNumber(month)}/${this.formatNumber(day)}`);
    }

    /**
     * Save time with specified format in input.
     * It is used for wheel mode
     *
     * @param hour
     * @param minute
     */
    setTimeInput(hour, minute) {
        this.input.val(`${this.formatNumber(hour)}:${this.formatNumber(minute)} ${hour >= 12 ? 'PM' : 'AM'}`);
    }

    /**
     * Converting single-digit numbers to two-digit numbers. Example: 2 to 02
     *
     * @param number
     * @returns {string|*}
     */
    formatNumber(number) {
        if (number < 10) return `0${number}`;
        else return number;
    }

    /**
     * Create a presentation of hours with a wheel-picker input structure
     *
     * @param max format hours 12 or 24
     * @returns {*[]}
     */
    getHour(min, max) {
        let temp = [];

        for (let i = min; i <= max; i++) temp.push({
            value: i,
            label: i,
        });

        return temp;
    }

    /**
     * Create a presentation of minutes with a wheel-picker input structure
     *
     * @returns {*[]}
     */
    getMinute(min) {
        let temp = [];

        for (let i = min; i <= 59; i++) temp.push({
            value: i,
            label: i,
        });

        return temp;
    }

    /**
     * Create a presentation of years with a wheel-picker input structure
     *
     * @param min lowest year
     * @param max most year
     * @returns {*[]}
     */
    getYears(min, max) {
        let temp = [];

        for (let i = min; i <= max; i++) temp.push({
            value: i,
            label: i,
        });

        return temp;
    }

    /**
     * Create a presentation of month with a wheel-picker input structure
     *
     * @returns {*[]}
     */
    getMonths(_moment) {
        let temp = [];

        for (let i = 0; i < 12; i++) {
            let ms = _moment.set('month', i);

            temp.push({
                value: i + 1,
                label: ms.format('MMM'),
            });
        }

        return temp;
    }

    /**
     * Create a presentation of days with a wheel-picker input structure
     *
     * @param monthDays The number of days in the month
     * @returns {*[]}
     */
    getDays(monthDays) {
        let temp = [];

        for (let i = 1; i <= monthDays; i++) temp.push({
            value: i,
            label: i,
        });

        return temp;
    }

}