/**
 * The PlacePicker class is used to create a map picker. This class is responsible for creating the map popup and
 * controlling related events
 *
 * PlacePicker class is developed using Google APIs and requires apikey. Note that the api is not placed in this file,
 * but in the html file where you want to use PlacePicker, it must be placed as a script.
 */
class PlacePicker {

    /**
     * All basic settings and PlacePicker creation are executed in this function
     *
     * @param config Input value for initial settings
     */
    constructor(config = {}) {

        let self = this;
        let _default = {
            defaultLocation: {lat: -34.397, lng: 150.644},
            defaultZoom: 12,
            title: 'Title',
            searchLabel: 'Search',
            btnDoneText: 'Done',
            changeLocationCallback: function () {
            },
            doneBtnCallback: function () {
            },
            closeBtnCallback: function () {
            },
            beforeGenerate: function () {
            },
            afterGenerate: function () {
            },
            beforeDistory: function () {
            },
            afterDistory: function () {
            }
        };

        config = {..._default, ...config};

        this.config = config;
        this.frame = $('<div class="place-picker"></div>');
        this.overlay = $('<div class="overlay"></div>');
        this.content = $('<div class="content"></div>');
        this.innerContent = $('<div class="inner-content"></div>');
        this.header = $('<div class="header"></div>');
        this.footer = $('<div class="footer"></div>');
        this.mapWrapper = $('<div class="map-wrapper"></div>');
        this.map = $('<div class="map"></div>');
        this.search = $('<input type="search">');
        this.closeBtn = $('<button type="button" class="btn btn-icon"><i class="icon-close"></i></button>');
        this.currentLocationBtn = $('<button type="button" class="btn-current-location"><i class="icon-gps"></i></button>');
        this.doneBtn = $(`<button type="button" class="btn btn-primary">${config.btnDoneText}</button>`);
        this.appbar = $('<div class="app-bar"></div>');
        this.appbarContainer = $('<div class="app-bar-container"></div>');
        this.appbarLeading = $('<div class="leading"></div>');
        this.appbarTitle = $('<div class="app-bar-title"></div>');
        this.appbarActions = $('<div class="actions"></div>');
        this.appbarTitleText = $(`<span>${config.title}</span>`);
        this.appbarLeadingBtn = $(`<button type="button" class="btn btn-icon"><i class="icon-location"></i></button>`);
        this.appbarActionBtn = $(`<button type="button" class="btn btn-icon"><i class="icon-tick"></i></button>`);

        this.address = '';
        this.position = config.defaultLocation;
        this.mapObject;
        this.mapMarker;

        // elements placement
        this.appbarTitle.append(this.appbarTitleText);
        this.appbarLeading.append(this.appbarLeadingBtn);
        this.appbarActions.append([this.appbarActionBtn, this.appbarActionLink]);
        this.appbarContainer.append([this.appbarLeading, this.appbarTitle, this.appbarActions]);
        this.appbar.append(this.appbarContainer);

        this.frame.append([this.overlay, this.content]);
        this.header.append([this.getSearchField(), this.closeBtn]);
        this.mapWrapper.append([this.map, this.currentLocationBtn]);
        this.footer.append(this.doneBtn);
        this.content.append([this.appbar, this.innerContent]);
        this.innerContent.append([this.header, this.mapWrapper, this.footer]);

        // map
        this.mapGenerate();
        this.searchAutocomplete();

        // add elements events
        this.currentLocationBtn.on('click', function () {
            self.goToCurrentPosition();
        });

        this.doneBtn.on('click', function () {
            config.doneBtnCallback(self);
        });
        this.appbarActionBtn.on('click', function () {
            config.doneBtnCallback(self);
        });
        this.closeBtn.on('click', function () {
            config.closeBtnCallback(self);
        });
        this.overlay.on('click', function () {
            config.closeBtnCallback(self);
        });

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

        $('body').append(this.frame);
        setTimeout(function () {
            self.frame.addClass('visible');
        }, 1);

        // run scripts after generate
        this.config.afterGenerate(this);

    }

    /**
     * Destroying the popup is done with this function
     */
    distory() {


        let self = this;

        // run scripts before distory
        this.config.beforeDistory(this);

        this.frame.removeClass('visible');
        setTimeout(function () {
            self.frame.remove();
        }, 160);

        // run scripts after distory
        this.config.afterDistory(this);

    }

    /**
     * Searching for places on the map and adjusting its position
     */
    searchAutocomplete() {
        // console.log(this.search[0]);
        // const searchBox = new google.maps.places.SearchBox(this.search[0]);
        // let autocomplete = new google.maps.places.SearchBox(this.search[0]);
        let autocomplete = new google.maps.places.Autocomplete(this.search[0], {
            types: ['geocode']
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            let near_place = autocomplete.getPlace();
        })
    }

    /**
     * Creating a map using Google APIs
     */
    mapGenerate() {

        let self = this;

        this.mapObject = new google.maps.Map(this.map[0], {
            center: self.config.defaultLocation,
            zoom: self.config.defaultZoom,
            mapTypeControl: false,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: this.getMapStyle(),
        });

        this.mapMarker = new google.maps.Marker({
            map: this.mapObject,
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: self.config.defaultLocation
        });

        // console.log(marker.getPosition());
        this.geoCodePosition(this.mapMarker.getPosition());

        this.mapObject.addListener("click", (mapsMouseEvent) => {
            self.updateMarkPosition(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
        });

        google.maps.event.addListener(this.mapMarker, 'dragend', function () {
            self.mapObject.setCenter(self.mapMarker.getPosition());
            self.geoCodePosition(self.mapMarker.getPosition());
        })

    }

    /**
     * Setting the location of the marker on the map
     *
     * @param pos Location lat and lng
     */
    geoCodePosition(pos) {

        let self = this;
        let geocoder = new google.maps.Geocoder();

        geocoder.geocode({
            latLng: pos
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.address = results[0].formatted_address;
            } else {
                self.position = {
                    lat: pos.lat(),
                    lng: pos.lng(),
                }
            }
        });

    }

    /**
     * Get your current location and set it on the map
     */
    goToCurrentPosition() {
        let self = this;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                self.mapObject.setOptions({zoom: 15});
                self.updateMarkPosition(position.coords.latitude, position.coords.longitude);
            });
        } else {/* error */
        }

    }

    /**
     * Update marker position on the map
     *
     * @param _lat
     * @param _lng
     */
    updateMarkPosition(_lat, _lng) {
        this.mapMarker.setPosition({lat: _lat, lng: _lng});
        this.mapObject.setCenter({lat: _lat, lng: _lng});
        this.geoCodePosition(this.mapMarker.getPosition());

        // run script on change location
        this.config.changeLocationCallback(this);

    }

    /**
     * Get the current location address.
     * This function returns the value in 2 cases:
     *      1- When the address is generated using Google systems
     *      2- When there is no address and the location is removed.
     *
     * @returns {string|*|string}
     */
    getCurrentAddress() {
        return this.address != '' ? this.address : this.position.lat + ', ' + this.position.lng;
    }

    /**
     * Change the map appearance setting values
     *
     * @returns {[{stylers: [{color: string}], elementType: string},{stylers: [{color: string}], elementType: string},{stylers: [{color: string}], elementType: string},{featureType: string, stylers: [{color: string}], elementType: string},{featureType: string, stylers: [{color: string}], elementType: string},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}
     */
    getMapStyle() {
        return [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ebe3cd"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#523735"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#f5f1e6"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#c9b2a6"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#dcd2be"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#ae9e90"
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#93817c"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#a5b076"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#447530"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f1e6"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#fdfcf8"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f8c967"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#e9bc62"
                    }
                ]
            },
            {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e98d58"
                    }
                ]
            },
            {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#db8555"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#806b63"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#8f7d77"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#ebe3cd"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dfd2ae"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#b9d3c2"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#92998d"
                    }
                ]
            }
        ];
    }

    /**
     * Set events related to the search field
     *
     * @returns {*|jQuery|HTMLElement} Search objectElement
     */
    getSearchField() {
        let field = $('<div class="field field-type-nr-input"></div>');
        let fieldContent = $('<div class="field-content"></div>');
        let icon = $('<i class="icon-search-normal"></i>');
        let label = $(`<label>${this.config.searchLabel}</label>`);

        field.append([icon, fieldContent]);
        fieldContent.append([label, this.search]);

        // focus search
        this.search.on('focus', function () {
            field.addClass('field--focus field--lv-label');
        });

        // blur search
        this.search.on('blur', function () {
            field.removeClass('field--focus');

            // check empty input
            if ($(this).val() == '') field.removeClass('field--lv-label');
        });

        // change search
        this.search.on('change', function () {
            if ($(this).val() == '') field.removeClass('field--lv-label');
            else field.addClass('field--lv-label');
        });

        return field;
    }

}