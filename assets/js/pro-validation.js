class ProValidation {

    validateCallback = function (value, field) {
        return undefined;
    }

    showErrorCallback = function (message, field) {
        return message;
    }

    singleValidate(element) {

        // create object from field
        const field = new ProField(element);

        // Only the value is used for checking
        if(field.isRequired === 'structure'){
            const value = this.#standardFieldValue(field);
            const check = this.#validate(value, field, true);
            let errorElement = $(`#field_error_${field.input.attr('id')}`);

            if (check !== undefined) {
                this.#setStatusOnElement(field.element,errorElement,check,true);
                return false;
            } else {
                errorElement.removeClass('active');
                field.element.removeClass('field--invalid field--valid');
                $(`#field_error_${field.input.attr('id')}`).removeClass('active');
                return true;
            }
        }

        // check field is required
        let dependencyElement = field.element.parents('[data-dependency-show=false]');
        if (field.isRequired != true || dependencyElement.length > 0) {
            if(dependencyElement.length > 0){
                field.element.removeClass('field--invalid field--valid');
                $(`#field_error_${field.input.attr('id')}`).removeClass('active');
            }
            return true;
        }

        // dependency check - is required or not required
        if (!this.#dependencyCheck(field) && field.isRequiredElement !== undefined && field.isRequiredElement !== '') {
            $(`#field_error_${field.input.attr('id')}`).removeClass('active');

            if (field.isRequiredType !== undefined) {
                const value = this.#standardFieldValue(field);
                const check = this.#validate(value, field, true);
                let errorElement = $(`#field_error_${field.input.attr('id')}`);

                if (check !== undefined) {
                    this.#setStatusOnElement(field.element,errorElement,check,true);
                    return false;
                } else {
                    this.#setStatusOnElement(field.element,errorElement,check,false);
                    return true;
                }
            }

            return true;
        }

        // check group fields
        if (field.groupValidation[0]) {

            let _this = this;
            let status = [];
            let labels = [];
            let hasError = false;
            let fieldError = field.groupValidation.find('.field-error-msg');

            // each on field group fields
            field.groupValidationFields.each(function (index, item) {

                const eField = new ProField(item);
                const value = _this.#standardFieldValue(eField);
                const check = _this.#validate(value, eField);

                // check field is required
                if (eField.isRequired != true || eField.element.parents('[data-dependency-show=false]').length > 0) return;

                if (check !== undefined) {
                    status.push(true);
                    labels.push(eField.label);
                } else status.push(false);

            });

            if (field.groupValidationRelation !== undefined) {
                // check group relation is "or"
                if (field.groupValidationRelation.toLowerCase() === 'or') hasError = status.every(i => i === true);

                // check group relation is "and"
                if (field.groupValidationRelation.toLowerCase() === 'and') hasError = status.some(i => i === true);
            } else hasError = status.some(i => i === true);

            if (hasError) {
                let errorMSG = this.showErrorCallback(
                    this.message('requiredFieldSelect', {
                        label: labels.length === 1 ? labels.join() : [labels.slice(0, labels.length - 1).join(', '), labels[labels.length - 1]].join(' and '),
                    }), field
                );
                this.#setStatusOnElement(field.groupValidationFields,fieldError,errorMSG,true);
                return false;
            } else {
                this.#setStatusOnElement(field.groupValidationFields,fieldError,'',false);
                return true;
            }
        }

        const value = this.#standardFieldValue(field);
        const check = this.#validate(value, field);
        let errorElement = $(`#field_error_${field.input[0] ? field.input.attr('id') : field.textarea.attr('id')}`);

        if (check !== undefined) {
            this.#setStatusOnElement(field.element,errorElement,check,true);
            return false;
        } else {
            this.#setStatusOnElement(field.element,errorElement,check,false);
            return true;
        }

    }

    #setStatusOnElement(field, errorElement, errorMessage, hasError = false){

        // This condition is to apply the condition on the field
        if(hasError){
            field.addClass('field--invalid'); // invalid
            field.removeClass('field--valid');
            errorElement.html(this.showErrorCallback(errorMessage, field));
            errorElement.addClass('active');
        }else if(field.hasClass('field--invalid')){ // valid
            field.removeClass('field--invalid');
            field.addClass('field--valid');
            errorElement.removeClass('active');
        }

    }

    #standardFieldValue(field) {
        switch (field.type) {
            case 'text':
            case 'number':
            case 'location':
            case 'date':
            case 'time':
                return field.input.val();
            case 'select':
            case 'upload':
                if (field.input.val() === '') return [];
                return field.input.val().split(',');
            case 'checkbox':
                return field.input.is(':checked') ? 'true' : '';
            case 'radio':
                let element = $(`[name="${field.input.attr('name')}"]:checked`);
                return element.length ? element.val() : '';
            case 'textarea':
                return field.textarea.val();
        }
    }

    #validate(value, field, ignoreEmpty = false) {

        // check label is null
        if (!ignoreEmpty && (value === '' || value.length === 0)) {

            if(field.isRequiredType === 'password'){
                $(`#password_hint_${field.input.attr('id')}`).hide();
                $(`#password_strength_${field.input.attr('id')}`).removeClass('active');
            }

            if (field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') {
                return this.message('requiredFieldSelect', {label: field.label});
            }

            if (field.type === 'upload') {
                return this.message('requiredFieldUpload', {label: field.label});
            }

            return this.message('requiredField', {label: field.label});
        }

        // check number
        if (field.type === 'number' && isNaN(value)) {
            return this.message('requiredFieldNumbersExample', {
                label: field.label,
                example: "75",
            });
        }

        const patternName = /^[^\d!@#$%^&*()_+=[\]{};':"\\|,.<>?`~]+$/;
        // source: https://amayadori.cloud/blog/js-regex-japanese-form-validation
        const japaneseRegex = /^[ァ-ンぁ-んぁ-ん一-龯]+$/; // katakana (ァ-ン) hiragana (ぁ-ん) Kanji (ぁ-ん一-龯)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+?\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
        const instagramIDRegex = /^[a-zA-Z0-9._]{1,30}$/;
        const youtubeIDRegex = /^[a-zA-Z0-9._-]{6,20}$/;
        const twitterIDRegex = /^[a-zA-Z0-9_]{1,15}$/; // @
        const tiktokIDRegex = /^[a-zA-Z0-9_]{3,24}$/; // @
        const facebookIDRegex = /^(?![-.])(?!.*[-.]{2})[a-zA-Z0-9.-]{5,50}(?<![-.])$/;
        const linkedinIDRegex = /^[a-zA-Z0-9.-]{3,30}$/;
        const lineIDRegex = /^(?=[a-zA-Z\d]{8,20}$)(?=.*[a-zA-Z]).*$/;

        switch (field.isRequiredType) {
            case 'firstname': {
                if (value === '') return undefined;
                if (!patternName.test(value)) return this.message('requiredFieldLettersExample', {
                    label: field.label,
                    example: "John",
                });
                return undefined;
            }
            case 'lastname': {
                if (value === '') return undefined;
                if (!patternName.test(value)) return this.message('requiredFieldLettersExample', {
                    label: field.label,
                    example: "Doe",
                });
                return undefined;
            }
            case 'japanFirstName': {
                if (value === '') return undefined;
                if (!japaneseRegex.test(value)) return this.message('requiredFieldLettersExample', {
                    label: field.label,
                    example: "高橋",
                });
                return undefined;
            }
            case 'japanLastName': {
                if (value === '') return undefined;
                if (!japaneseRegex.test(value)) return this.message('requiredFieldLettersExample', {
                    label: field.label,
                    example: "高橋島",
                });
                return undefined;
            }
            case 'lineID': {
                if (value === '') return undefined;
                if (!lineIDRegex.test(value)) return this.message('requiredFieldSocialAccountID', {
                    example: 'a-Z 0-9 - _ . (Length 8-20)',
                });
                return undefined;
            }
            case 'instagramID': {
                if (value === '') return undefined;
                if (!instagramIDRegex.test(value)) return this.message('requiredFieldSocialAccountID', {
                    example: 'a-Z 0-9 _ . (Length 1-30)',
                });
                return undefined;
            }
            case 'youtubeID': {
                if (value === '') return undefined;
                if (!youtubeIDRegex.test(value)) return this.message('requiredFieldSocialAccountID', {
                    example: 'a-Z 0-9 - _ . (Length 6-20)',
                });
                return undefined;
            }
            case 'tiktokID': {
                if (value === '') return undefined;
                if (!tiktokIDRegex.test(value)) return this.message('requiredFieldSocialAccountID', {
                    example: 'a-Z 0-9 _ (Length 3-24)',
                });
                return undefined;
            }
            case 'twitterID': {
                if (value === '') return undefined;
                if (!twitterIDRegex.test(value)) return this.message('requiredFieldSocialAccountID', {
                    example: 'a-Z 0-9 _ (Length 1-15)',
                });
                return undefined;
            }
            case 'facebookID': {
                if (value === '') return undefined;
                if (!facebookIDRegex.test(value)) return this.message('requiredFieldSocialAccountID', {
                    example: 'a-Z 0-9 - . (Length 5-50)',
                });
                return undefined;
            }
            case 'linkedinID': {
                if (value === '') return undefined;
                if (!linkedinIDRegex.test(value)) return this.message('requiredFieldSocialAccountID', {
                    example: 'a-Z 0-9 - . (Length 3-30)',
                });
                return undefined;
            }
            case 'url': {
                if (value === '') return undefined;
                try {
                    let url = new URL(value);
                    return undefined;
                } catch (e) {
                    return this.message('requiredFieldURL', {
                        example: 'https://www.example.com',
                    });
                }
            }
            case 'range': {
                let min = parseFloat(field.element.data('min'));
                let max = parseFloat(field.element.data('max'));
                let cvl = parseFloat(value);
                let unit = field.element.data('unit');
                let example = field.element.data('example');

                if (cvl > max || cvl < min) return this.message('requiredFieldRangeExample', {
                    label: field.label,
                    start: min,
                    end: max,
                    u: unit ? unit : '',
                    example: example ? example : '80',
                });

                return undefined;
            }
            case 'email': {
                if (value === '') return undefined;

                const emailAtIndex = value.indexOf("@");
                if (emailAtIndex === -1 || emailAtIndex === value.length - 1) {
                    return this.message('requiredFieldEmailAt', {
                        example: "example@example.com",
                    });
                }

                if (!emailRegex.test(value)) return this.message('requiredFieldCorrectly', {
                    label: field.label,
                    example: "example@example.com",
                });
                return undefined;
            }
            case 'mobile': {
                if (value === '') return undefined;
                if (!phoneRegex.test(value)) return this.message('requiredFieldCorrectly', {
                    label: field.label,
                    example: "12345698967",
                });
                return undefined;
            }
            case 'verifycode': {
                if (value.length != 7) return this.message('requiredFieldVerifyCode', {});
                return undefined;
            }
            case 'password': {
                const inputID = field.input.attr('id');
                const strength = $(`#password_strength_${inputID}`);
                const targetID = field.element.data('target');
                const targetElement = $(`#${targetID}`);

                let score = 0;

                $(`#password_hint_${inputID}`).hide();

                // check length pass
                if (value.length >= 6) {
                    score += 1;
                }

                // check lowercase letters
                if (/[a-z]/.test(value)) {
                    score += 1;
                }

                // check uppercase letters
                if (/[A-Z]/.test(value)) {
                    score += 1;
                }

                // checking the presence of numbers
                if (/\d/.test(value)) {
                    score += 1;
                }

                // checking the presence of special signs and characters
                if (/[!@#$%^&*()_+{}\[\]:;<>,.?~\-/\\]/.test(value)) {
                    score += 1;
                }

                if (strength.length) {

                    const strengthIndicator = strength.find('.strength-indicator');
                    strengthIndicator.removeClass('level-1 level-2 level-3 level-4');

                    let textStatus = '';
                    let iconClass = '';
                    switch (score) {
                        case 0:
                            textStatus = 'Very Weak';
                            iconClass = 'icon-alert-triangle';
                            break;
                        case 1:
                            textStatus = 'Very Weak';
                            iconClass = 'icon-alert-triangle';
                            break;
                        case 2:
                            textStatus = 'Weak';
                            iconClass = 'icon-alert-triangle';
                            break;
                        case 3:
                            textStatus = 'So-so';
                            iconClass = 'icon-info';
                            break;
                        case 4:
                            textStatus = 'Good';
                            iconClass = 'icon-tick';
                            break;
                        case 5:
                            textStatus = 'Great';
                            iconClass = 'icon-tick';
                            break;
                    }
                    strengthIndicator.find('.strength-status').html(`${textStatus} <i class="${iconClass}"></i>`);
                    strength.addClass('active');

                    if (score < 1 || score > 1) strength.find('.notifications-list').removeClass('active');

                    if (score > 1) strengthIndicator.addClass(`level-${score-1}`);
                    else strength.find('.notifications-list').addClass('active');

                }

                // check match with confirm
                if(targetElement.length){
                    const targetValue = targetElement.val();

                    if(targetValue === ''){
                        $(`#field_error_${targetID}`).html(this.message('requiredFieldPassConfirmInter', {}));
                        $(`#field_error_${targetID}`).addClass('active');
                        targetElement.parents('.field').addClass('field--invalid');
                        targetElement.parents('.field').removeClass('field--valid');
                    }

                    if(value !== targetValue && targetValue !== '') {
                        $(`#field_error_${targetID}`).html(this.message('requiredFieldPassConfirm', {}));
                        $(`#field_error_${targetID}`).addClass('active');
                        targetElement.parents('.field').addClass('field--invalid');
                        targetElement.parents('.field').removeClass('field--valid');
                    }

                    if(value === targetValue){
                        $(`#field_error_${targetID}`).removeClass('active');
                        targetElement.parents('.field').removeClass('field--invalid');
                        targetElement.parents('.field').addClass('field--valid');
                    }

                }

                if(value.length < 6) return this.message('requiredFieldPassLimit', {
                    limit: 6,
                });

                if(score < 3) return this.message('requiredFieldPassScore', {});

                return undefined;
            }
            case 'confirm_password':{
                const targetID = field.element.data('target');
                const targetElement = $(`#${targetID}`);
                const targetValue = targetElement.val();

                if(value !== targetValue) return this.message('requiredFieldPassConfirm', {});

                return undefined;
            }
        }

        if (this.validateCallback(value, field)) return undefined;

        // default return
        return undefined;

    }

    #dependencyCheck(field) {

        // reject if you use not dependency
        if (field.isRequiredElement === undefined) return undefined;

        const selectInput = $(`#${field.isRequiredElement}`);
        const newField = new ProField(selectInput.parents('.field')[0]);

        const value1 = field.isRequiredValue;
        const value2 = this.#standardFieldValue(newField);
        const result = this.#compareValue(value1, value2);
        const errorElement = $(`#field_error_${field.input.attr('id')}`);

        if (field.isRequiredMode === 'required') {
            return result;
        } else if (field.isRequiredMode === 'exclusive') {
            return !result;
        }

        return false;

    }

    #compareValue(value1, value2) {

        const type1 = typeof value1;
        const type2 = typeof value2;

        if (type1 === 'string' && type2 === 'string') {
            return value1 === value2;
        }

        if (type1 === 'string' && type2 === 'object') {
            if (value1 === '' && value2.length === 0) return true;

            return $.inArray(value1, value2) !== -1;
        }

        if (type1 === 'object' && type2 === 'string') {
            if (value2 === '' && value1.length === 0) return true;

            return $.inArray(value2, value1) !== -1;
        }

        if (type1 === 'object' && type2 === 'object') {
            if (value1.length !== value2.length) return false;
            let status = true;

            for (let i = 0; i < value1.length; i++) {
                if ($.inArray(value1[i], value2) === -1) status = false;
            }

            return status;
        }

    }

    // This method is for generating and receiving the desired message
    message(type, arg) {
        const messages = {
            requiredField: 'This field is required. Please enter your :label.',
            requiredFieldLettersExample: ':label can only contain letters. exp: :example',
            requiredFieldNumbersExample: ':label can only contain numbers. exp: :example',
            requiredFieldLettersLength: ':label must contain :length letters. exp: :example',
            requiredFieldRangeExample: ':label must be within the range of :start :u to :end :u. exp: :example',
            requiredFieldNumberSize: 'This field is required. Please enter your :label size.',
            requiredFieldNumberLength: ':label must contain :length digits. exp: :example',
            requiredFieldSelect: 'This field is required. Please select your :label.',
            requiredFieldVerified: ':label must be verified.',
            requiredFieldVerified2: 'This field is required. Your :label must be verified.',
            requiredFieldVerifiedIncorrect: 'The entered verification code is incorrect. Please re-enter the code.',
            requiredFieldUpload: 'This field is required. Please upload your :label.',
            requiredFieldCorrectly: 'Please enter the :label correctly. exp: :example',
            requiredFieldEmailAt: 'Email address must contain a single “@”. exp: :example',
            requiredFieldVerifyCode: 'The entered verification code is incorrect. Please re-enter the code.',
            requiredFieldPassLimit: 'Password must be at least :limit characters.',
            requiredFieldPassScore: 'Your password is very weak.',
            requiredFieldPassConfirm: 'Confirm password does not match. Please re-enter it.',
            requiredFieldPassConfirmInter: 'Please confirm your password.',
            requiredFieldSocialAccountID: 'Enter your account ID correctly. Allowed characters: :example',
            requiredFieldURL: 'The url is not valid. exp: :example',
        };
        let selected = messages[type];

        Object.entries(arg).forEach(([key, value]) => {
            try {
                selected = selected.replace(`:${key}`, value);
            } catch (error) {
                console.log(error);
            }
        });

        return selected;
    }

}

class ProField {

    constructor(element) {

        element = $(element);
        this.element = element;
        this.id = element.attr('id');
        this.type = element.data('type');
        this.input = element.find('input');
        this.textarea = element.find('textarea');
        this.isRequired = element.data('required');
        this.isRequiredType = element.data('required-type');
        this.isRequiredMode = element.data('required-mode');
        this.isRequiredValue = element.data('required-value');
        this.isRequiredElement = element.data('required-element');
        this.groupValidation = element.parents('.field-group-validations');
        this.groupValidationFields = this.groupValidation.find('.field');
        this.groupValidationRelation = this.groupValidation.data('group-validation-relation');

        const cloneLabel = element.find('label').clone();
        cloneLabel.find('*:not(.field-label)').remove();
        this.label = cloneLabel.text().trim().replace(/\s+/g, ' ');

    }

    element;
    id;
    type;
    label;
    input;
    isRequired;
    isRequiredType;
    isRequiredMode;
    isRequiredValue;
    isRequiredElement;
    groupValidation;
    groupValidationFields;
    groupValidationRelation;

}