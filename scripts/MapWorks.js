/*==============================================================================
   Copyright 2010 Jillian Ada Burrows

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
==============================================================================*/


/*
 * Constructor for the MapWorks JS object
 */
function MapWorks(map_id, location_name, address, zoom) {
  // member variables
  var map_id, location_name, address, zoom, geocoder, location, map, mapOptions,
      marker, info, info_content, info_showing, show_dirs, dirs, from_address,
      get_dirs, clear_dirs, dirs_panel, dirs_showing, dirs_display, dirs_service;

  // initialize state vaiables
  this.info_showing = false;
  this.map_id = map_id;
  this.location_name = location_name;
  this.address = address;
  this.zoom = zoom;

  // construct ids of DOM objects we will manipulate later
  this.show_dirs = "#"+this.map_id+"_show_directions";
  this.dirs = "#"+this.map_id+"_directions";
  this.from_address = "#"+this.map_id+"_address";
  this.get_dirs = "#"+this.map_id+"_get_directions";
  this.clear_dirs = "#"+this.map_id+"_clear_directions";
  this.dirs_panel = this.map_id+"_panel";

  // set up map options
  this.mapOptions = {
    zoom: this.zoom,
    center: this.location,
    mapTypeControl: true,
    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // set up the map
  this.map = new google.maps.Map(document.getElementById(this.map_id+"_map"), this.mapOptions);

  // set up the directions panel
  this.init_directions(jQuery);

  var self = this; // set up self variable for closures
  // get a geocoder, if successful call geocoder_callback
  this.geocoder = new google.maps.Geocoder();
  if (this.geocoder) {
    this.geocoder.geocode( { 'address': this.address}, function(results, status) {
	self.geocoder_callback(results, status, self);
    });
  }
}

/*
 * Sets up all event handlers for the directions panel
 */
MapWorks.prototype.init_directions = function($) {
  // set up directions service and renderers
  this.dirs_service = new google.maps.DirectionsService();
  this.dirs_display = new google.maps.DirectionsRenderer();

  // set up reference for closures
  var self = this;

  // hide panel and set state variable
  $(this.dirs).hide();
  this.dirs_showing = false;

  // toggle the directions panel
  $(this.show_dirs).click(function() {
    if (self.dirs_showing) {
      $(self.dirs).hide(300);
      self.dirs_showing = false;
    } else {
      $(self.dirs).show(200);
      self.dirs_showing = true;
    }
  });

  // clears the directions
  $(this.clear_dirs).click(function() {
    self.dirs_display.setMap(null);
    self.dirs_display.setPanel(null);    
  });

  // get directions
  $(this.get_dirs).click(function() {
    // set up request
    var from = $(self.from_address).val();
    var request = {
      origin: from,
      destination: self.address,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    // request the route
    self.dirs_service.route(request, function(response, status) {
      // if route exists show it
      if (status == google.maps.DirectionsStatus.OK) {
        self.dirs_display.setDirections(response);
        self.dirs_display.setMap(self.map);
        self.dirs_display.setPanel(document.getElementById(self.dirs_panel));
      }
    });
  });
}

/*
 * Callback from the initial geocoder request
 */
MapWorks.prototype.geocoder_callback = function(results, status, self) {
  // if the geocoder was successful, set the location and build the scene
  // if not, display an error about the address
  if (status == google.maps.GeocoderStatus.OK) {
    self.location = results[0].geometry.location;
    self.setup_scene();
  } else {
    alert("The address doesn't seem to be valid.");
  }
}

/*
 * Set up the scene by adding the marker
 */
MapWorks.prototype.setup_scene = function() {
  // set up marker options
  this.marker = new google.maps.Marker({
    map: this.map, 
    position: this.location,
    title: this.location_name
  });

  // set up event listener fo toggling the info box's visibility
  var self = this;
  google.maps.event.addListener(this.marker, 'click', function() {
    self.toggle_info(self);
  });

  // set the center of the scene
  this.map.setCenter(this.location);
}

/*
 * Sets the lat,lng in place of, or overriding, the geocoded address
 */
MapWorks.prototype.set_coord = function(lat, lng) {
  this.location = new google.maps.LatLng(lat, lng);
  self.set_scene();
}

/*
 * Sets up the info box
 */
MapWorks.prototype.set_info = function(info_content) {
  this.info_content = info_content;
  this.info = new google.maps.InfoWindow({
    content: this.info_content
  });
}

/*
 * Callback function for showing and hiding the info box
 */
MapWorks.prototype.toggle_info = function(self) {
  if (self.info_showing == true) {
    self.info.close();
    self.info_showing = false;
  } else {
    self.info.open(self.map, self.marker);
    self.info_showing = true;
  }
}
