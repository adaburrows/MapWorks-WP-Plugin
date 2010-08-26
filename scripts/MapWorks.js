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

function MapWorks(map_id, location_name, address, zoom) {
  var map_id, location_name, address, zoom, geocoder, location, map, mapOptions, marker, info, info_content, info_showing;

  this.info_showing = false;
  this.map_id = map_id;
  this.location_name = location_name;
  this.address = address;
  this.zoom = zoom;
  this.geocoder = new google.maps.Geocoder();
  var self = this;
  if (this.geocoder) {
    this.geocoder.geocode( { 'address': this.address}, function(results, status) {
	self.init_geocode(results, status, self);
    });
  }
}

MapWorks.prototype.init_geocode = function(results, status, self) {
  if (status == google.maps.GeocoderStatus.OK) {
    self.location = results[0].geometry.location;
  } else {
    alert("The address doesn't seem to be valid.");
  }
  self.build();
}

MapWorks.prototype.build = function() {
  this.mapOptions = {
    zoom: this.zoom,
    center: this.location,
    mapTypeControl: true,
    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map(document.getElementById(this.map_id+"_map"), this.mapOptions);
  this.marker = new google.maps.Marker({
    map: this.map, 
    position: this.location,
    title: this.location_name
  });
  var self = this;
  google.maps.event.addListener(this.marker, 'click', function() {
    self.toggle_info(self);
  });
  this.map.setCenter(this.location);
}

MapWorks.prototype.set_coord = function(lat, lng) {
  this.location = new google.maps.LatLng(lat, lng);
  this.marker = new google.maps.Marker({
    map: this.map, 
    position: this.location,
    title: this.location_name
  });
  this.map.setCenter(this.location);
}

MapWorks.prototype.set_info = function(info_content) {
  this.info_content = info_content;
  this.info = new google.maps.InfoWindow({
    content: this.info_content
  });
}

MapWorks.prototype.toggle_info = function(self) {
  if (self.info_showing == true) {
    self.info.close();
    self.info_showing = false;
  } else {
    self.info.open(self.map, self.marker);
    self.info_showing = true;
  }
}
