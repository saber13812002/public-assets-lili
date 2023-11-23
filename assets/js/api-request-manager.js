/**
 * This class is created to prevent repeated requests to the server.
 * This class uses ajax to communicate with the server and calls the input events after receiving the response from the server.
 *
 * This class depends on the jquery library.
 */

// request to api
let apiRequests = {};

class ApiRequest {

    /**
     * All settings and checks are executed in the constructor function
     *
     * @param config Input value for initial settings
     */
    constructor(config = {}) {

        let _default = {
            url: '',
            type: 'get',
            contentType: "application/json",
            dataType: 'json', // json
            data: '', // json stringfy
            success: function () { },
            error: function () { },
            complete: function () { }
        }

        // merge config with default
        config = { ..._default, ...config };

        // check is exist before requested 
        if (apiRequests[config.url]) {

            this.object = apiRequests[config.url];

            // check is waiting
            if (this.object.status === 'waiting') {
                // If the request has been sent and has not yet received a response, its functions are kept until they
                // are executed after receiving the response
                this.object.callbacks.push(
                    {
                        complete: config.complete,
                        success: config.success,
                        error: config.error
                    }
                );
            }
            // If the request already has an answer, it executes the functions directly
            else if (this.object.status === 'done') {
                config.success(this.object.data);
            } else {
                config.error();
            }

        } else { // not exist

            this.status = 'waiting';
            this.url = config.url;
            this.type = config.type;
            this.contentType = config.contentType;
            this.dataType = config.dataType;
            this.data = config.data;
            this.complete = config.complete;
            this.success = config.success;
            this.error = config.error;

            // Register the first request to the server
            this.object = {
                url: this.url,
                status: this.status,
                callbacks: [
                    {
                        complete: this.complete,
                        success: this.success,
                        error: this.error
                    }
                ],
                data: null
            }

            apiRequests[config.url] = this.object;
            this.request();

        }

    }

    /**
     * This function sends the generated request to the server
     */
    request() {
        let self = this;

        $.ajax({
            url: this.url,
            type: this.type,
            contentType: this.contentType,
            dataType: this.dataType,
            data: this.data,
            complete: function (xhr, status) {
                self.runCallbacks('complete', xhr, status);
            },
            success: function (result, status, xhr) {
                self.object.status = 'done';
                self.object.data = result;
                self.runCallbacks('success', result, status, xhr);
            },
            error: function (xhr, status, error) {
                self.object.status = 'error';
                self.runCallbacks('error', xhr, status, error);
            },
        });
    }

    /**
     * This function executes the functions requested to the server
     *
     * @param type
     * @param param1 The first parameter of the ajax function
     * @param param2 The second parameter of the ajax function
     * @param param3 The third parameter of the ajax function
     */
    runCallbacks(type, param1 = null, param2 = null, param3 = null) {
        this.object.callbacks.forEach(function (item) {
            item[type](param1, param2, param3);
        })
    }

}