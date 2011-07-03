/*!
 * jump jQuery map plugin
 *
 * Copyright (c) 2011 Eike Send, http://eike.se/nd
 * Dual licensed under the MIT or GPL Version 2 licenses, just like jQuery itself:
 * http://jquery.org/license
 */

;(function($){

  // This is used to expose static functions
  $.jump = {};
  // Plugins can be used to extend the map functionality
  $.jump.plugins = {};
  
  // These functions turn the latitude and longitude
  // values into values between 0 and 2^zoom
  // using the mercator projection:
  $.jump.lon2x = function(lon, zoom, tilesize) {
    // This is a value between 0 and 1
    var x = (lon+180)/360; 
    // Scale it to the appropriate zoom level and tilesize:
    return Math.floor(x * tilesize * Math.pow(2, zoom));
  };
  $.jump.lat2y = function(lat, zoom, tilesize) {
    var lat_radians = lat * Math.PI / 180;
    // This is a value between 0 and 1
    var y = (1 - Math.log(Math.tan(lat_radians) + 1 / Math.cos(lat_radians)) / Math.PI) / 2;
    // Scale it to the appropriate zoom level and tilesize:
    return Math.floor(y * tilesize * Math.pow(2, zoom));
  };
  
  // Inverse functions, which can be used to get latitude and longitude from a
  // mercator projected pixel coordinate.
  $.jump.x2lon = function(x, zoom, tilesize) {
    return 360 * (((x / tilesize) /  Math.pow(2, zoom)) - 0.5);
  };
  $.jump.y2lat = function(y, zoom, tilesize) {
    y = 0.5 - ((y / tilesize) / Math.pow(2, zoom));
    return 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI;
  };
  
  // todo: Add Objects for GeoPoint, BoundingBox, GeoHtmlElement
  
  $.fn.jump = function(options) {
    options = $.extend(true, {}, $.fn.jump.defaults, options);
    return this.each(function(){
      var $this = $(this);
      $this
        .css("position", "relative")
        .css("overflow", "hidden");
      var state = $.extend(true, {}, options);
      $this.data("state", state);
      
      function changecenter(e, location) {
        location.old_center = $.extend({},state.center);
        if (location.lat && location.lon) {
          location.x = state.center.x = $.jump.lon2x(location.lon, state.zoom, state.tilesize);
          location.y = state.center.y = $.jump.lat2y(location.lat, state.zoom, state.tilesize);
          hasLatLon = true;
        }
        if (location.x && location.y) {
          state.center.x = location.x;
          state.center.y = location.y;
        }
        location.new_center = $.extend({}, state.center);
        location.pixelDiff = {
          x: location.old_center.x - location.new_center.x,
          y: location.old_center.y - location.new_center.y
        };
        location.getNewLon = function() {
          return $.jump.x2lon(location.x, state.zoom, state.tilesize);
        };
        location.getNewLat = function() {
          return $.jump.y2lat(location.y, state.zoom, state.tilesize);
        };
      }
      $this.bind('changecenter', changecenter);
      
      function moveby(e, distance) {
        var newcenter = {
          x: state.center.x + (distance.x ? distance.x : 0),
          y: state.center.y + (distance.y ? distance.y : 0)
        };
        $this.triggerHandler('changecenter', newcenter);
      }
      $this.bind('moveby', moveby);
      
      function zoom(e, level) {
        if (level < 0) level = 0;
        if (level > 18) level = 18;
        var result = {
          old_level: state.zoom,
          new_level: level,
          diff: level - state.zoom
        };
        state.center.x = state.center.x * Math.pow(2, result.diff);
        state.center.y = state.center.y * Math.pow(2, result.diff);
        state.zoom = level;
        return result;
      }
      $this.bind('zoom', zoom);
      
      function zoomin(e) {
        return $this.triggerHandler('zoom', state.zoom + 1);
      }
      $this.bind('zoomin', zoomin);
      
      function zoomout(e) {
        return $this.triggerHandler('zoom', state.zoom - 1);
      }
      $this.bind('zoomout', zoomout);
      
      function getBoundingBox() {
        var bbox = {
          topleft: {
            x: state.center.x - Math.round($this.width()/2),
            y: state.center.y - Math.round($this.height()/2)
          },
          bottomright: {
            x: state.center.x + Math.round($this.width()/2),
            y: state.center.y + Math.round($this.height()/2)
          }
        };
      }
      $this.bind('getBoundingBox', getBoundingBox);
      
      // Let others know where the mouse/finger is:
      $this.bind('click dblclick mousedown mouseover mouseup touchstart touchmove touchend',
        function(e) {
          var px = e.pageX ? e.pageX : e.originalEvent.touches[0].clientX;
          var py = e.pageY ? e.pageY : e.originalEvent.touches[0].clientY;
          e.mapPosition = {
            x: px - $this.offset().left + state.center.x - $this.width()/2,
            y: py - $this.offset().top + state.center.y - $this.height()/2
          };
          e.mapPosition.getLat = function() {
            return $.jump.y2lat(e.mapPosition.y, state.zoom, state.tilesize);
          };
          e.mapPosition.getLon = function() {
            return $.jump.x2lon(e.mapPosition.x, state.zoom, state.tilesize);
          };
          return e;
        });
        
      // Load and enable pugins, this needs to be done in the end to ensure
      var pluginname;
      for (pluginname in state.plugins) {
        var plugin = $.jump.plugins[pluginname];
        var pluginoptions = state.plugins[pluginname];
        plugin.start.call(this, pluginoptions);
      }
      // Let everyone do their thing:
      $this.triggerHandler('changecenter', state.center);
    });
  };
  // These are the default settings
  $.fn.jump.defaults = {
    zoom: 14,
    center: {
      lat: 52.52643,
      lon: 13.41156
    },
    plugins: {
      clickcontroller: true,
      mousecontroller: true,
      touchcontroller: true,
      osmtiles: {tilesize: 256},
      attribution: true
    }
  };
})(jQuery);
