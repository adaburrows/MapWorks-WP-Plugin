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
================================================================================
      Jillian Ada Burrows | Email: jill@adaburrows.com | Skype: adaburrows
       Twitter: @jburrows | Facebook: http://facebook.com/jillian.burrows
==============================================================================*/

/*
 * Constructor for the MapWorks JS object
 * =============================================================================
 */
function MapWorks(map_id, location_name, address, zoom) {
  // member variables
  var map_id, location_name, address, zoom, geocoder, location, map, mapOptions,
      marker, info, info_content, info_showing, show_dirs, dirs, from_address,
      get_dirs, clear_dirs, dirs_panel, dirs_showing, dirs_display, dirs_service,
      sv_control;

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
  this.map_options = {
    zoom: this.zoom,
    center: this.location,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP
    },
    navigationControl: true,
    navigationControlOptions: {
      style: google.maps.NavigationControlStyle.SMALL,
      position: google.maps.ControlPosition.TOP_LEFT
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: true
  };

  // set up the map
  this.map = new google.maps.Map(document.getElementById(this.map_id+"_map"), this.map_options);

  // add custom street view control
  this.sv_control = new MwStreetView(this.map);

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

  // set the location on the custom street view
  this.sv_control.setLocation(this.location);
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

/*
 * Contructor for custom controls
 * =============================================================================
 */
function MwStreetView(map) {
  var map, location, control_dom, sv_toggle, sv_panel, panorama, sv_first_open;
  // set up variables
  this.map = map;
  this.sv_first_open = true;

  //build the control
  this.buildDom();
  this.setupStreetView();
  this.setCallbacks();

  // add control to map
  this.map.controls[google.maps.ControlPosition.RIGHT].push(this.control_dom);
}

/*
 * Builds the DOM to embed into the map frame
 */
MwStreetView.prototype.setupStreetView = function() {
  // set up the options for the street view
  var sv_options = {
    addressControl: false,
    enableCloseButton: false,
    linksControl: false,
    navigationControl: false,
    visible: false
  };

  // set up the street view panel
  this.panorama = new google.maps.StreetViewPanorama(this.sv_panel, sv_options);
  this.map.setStreetView(this.panorama);
}

/*
 * Builds the DOM to embed into the map frame
 */
MwStreetView.prototype.buildDom = function() {
  this.control_dom = document.createElement('DIV');
  this.control_dom.style.width = "320px";

  // add to controls div
  this.sv_toggle = this.createButton("Street View");
  this.control_dom.appendChild(this.sv_toggle);

  // add the street view to the control
  this.sv_panel = this.createStreetViewPanel();
  this.control_dom.appendChild(this.sv_panel);
}

/*
 * Builds a button DOM to embed into the control
 */
MwStreetView.prototype.createButton = function(label){
  var button = document.createElement("DIV");
  button.innerHTML = label;
  button.setAttribute("style",button.getAttribute("style")+"; float:right; ");
  button.style.textDecoration = "none";
  button.style.color = "#000";
  button.style.backgroundColor = "white";
  button.style.font = "12px Arial";
  button.style.border = "1px solid black";
  button.style.padding = "4px";
  button.style.margin = "5px";
  button.style.textAlign = "center";
  button.style.width = "8em";
  button.style.cursor = "pointer";
  button.style.display = "inline";
  return button;
}

/*
 * Builds the street view DOM to embed into the control
 */
MwStreetView.prototype.createStreetViewPanel = function(){
  var panel = document.createElement("DIV");
  panel.setAttribute("style",panel.getAttribute("style")+"; float: right; height: 200px; width: 300px; ");
  panel.style.textDecoration = "none";
  panel.style.color = "#000";
  panel.style.backgroundColor = "white";
  panel.style.font = "12px Arial";
  panel.style.border = "1px solid black";
  panel.style.padding = "4px";
  panel.style.margin = "5px";
  panel.style.display = "none";
  return panel;  
}

/*
 * Set up event handlers
 */
MwStreetView.prototype.setCallbacks = function() {
  //set up self value for closures
  var self = this;

  google.maps.event.addDomListener(this.sv_toggle, 'click', function(){
    if (self.panorama.getVisible()) {
      self.closeStreetView();
    } else {
      if (self.sv_first_open) {
        self.panorama.setPosition(self.location);
        self.sv_first_open = false;
      }
      self.openStreetView();
    }
  });

  google.maps.event.addListener(this.panorama, 'position_changed', function(){
    self.openStreetView();
  });
}

/*
 * Set the location we should be looking towards
 */
MwStreetView.prototype.setLocation = function(location) {
  this.location = location;
}

/*
 * Open the street view
 */
MwStreetView.prototype.openStreetView = function() {
  this.sv_panel.style.display = "block";
  this.panorama.setPov(this.calcPov());
  this.panorama.setVisible(true);
}

/*
 * Close the street view
 */
MwStreetView.prototype.closeStreetView = function() {
  this.sv_panel.style.display = "none";
  this.panorama.setVisible(false);
}

/*
 * Calulates POV for street view so we are alway looking at the location
 */
MwStreetView.prototype.calcPov = function() {
  // fetch the current street view position
  var latlng = this.panorama.getPosition();
  // get the distance between longitudes in radians
  var dLong=this.degs2rads(this.location.lng()-latlng.lng());

  // get the latitudes in radians
  var lat1=this.degs2rads(latlng.lat());
  var lat2=this.degs2rads(this.location.lat());

  // calculate tangental in tangent plane (coordinates mapped onto tangent plane)
  var y=Math.sin(dLong)*Math.cos(lat2);
  var x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLong);

  // map tangent line back into an angle in radians, then map angle to degrees
  var heading = this.rads2degs(Math.atan2(y,x));

  //return a POV object
  return {heading: heading, zoom: 0, pitch: 0};
}

/*
 * Converts from rads to degrees
 */
MwStreetView.prototype.degs2rads=function(degs){
  var rads=degs*Math.PI/180;
  return rads;
}

/*
 * Converts from rads to degrees
 */
MwStreetView.prototype.rads2degs=function(rads){
  var degs=rads*180/Math.PI;
  degs=(degs+360)%360;
  return degs;
}
