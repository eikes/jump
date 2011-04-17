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
    options = $.extend({}, $.fn.jump.defaults, options);
    return this.each(function(){
      var node = $(this);
      // todo: Add ability to provide a bounding box
      var state = $.extend(true, {}, options);
      node.data("state", state);

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
        location.new_center = $.extend({}, state.center)
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
      node.bind('changecenter', changecenter);

      function move(e, distance) {
        var newcenter = {
          x: state.center.x + (distance.x ? distance.x : 0),
          y: state.center.y + (distance.y ? distance.y : 0)
        };
        node.triggerHandler('changecenter', newcenter);
      }
      node.bind('move', move);

      function zoom(e, level) {
        var result = {
          old_level: state.zoom,
          new_level: level
        };
        state.zoom = level;
        return result;
      }
      node.bind('zoom', zoom);

      function zoomin(e) {
        state.center.x = state.center.x * 2;
        state.center.y = state.center.y * 2;
        node.triggerHandler('zoom', state.zoom + 1);
      }
      node.bind('zoomin', zoomin);

      function zoomout(e) {
        state.center.x = Math.floor(state.center.x / 2);
        state.center.y = Math.floor(state.center.y / 2);
        node.triggerHandler('zoom', state.zoom - 1);
      }
      node.bind('zoomout', zoomout);
      
      function getOffset(lon, lat) {
        var result = {
          x: $.jump.lon2x(lon, state.zoom, state.tilesize) -
              (state.center.x - Math.floor(node.width()/2)),
          y: $.jump.lat2y(lat, state.zoom, state.tilesize) -
              (state.center.y - Math.floor(node.height()/2)),
        };
        return result;
      }
      
      function addElement(event, args) {
        var el = args.element;
        var loc = args.location;
        var off = args.offset ? args.offset : {x: 0, y: 0};
        var position = getOffset(loc.lon, loc.lat);
        el.css("position", "absolute");
        el.css("left", position.x + off.x);
        el.css("top", position.y + off.y);
        el.css("z-index", 10);
        node.append(el);
        node.bind("zoom changecenter", function(event, level) {
          position = getOffset(loc.lon, loc.lat);
          el.css("left", position.x + off.x);
          el.css("top", position.y + off.y);
        });
      }
      node.bind('addElement', addElement);
      
      function getBoundingBox() {
        var bbox = {
          topleft: {
            x: state.center.x - Math.round(node.width()/2),
            y: state.center.y - Math.round(node.height()/2)
          },
          bottomright: {
            x: state.center.x + Math.round(node.width()/2),
            y: state.center.y + Math.round(node.height()/2)
          }
        };
      }
      node.bind('getBoundingBox', getBoundingBox);
      
      // Load and enable pugins, this needs to be done in the end to ensure
      // that the previous bindings are executed beforehand
      for (pluginname in $.jump.plugins) {
        plugin = $.jump.plugins[pluginname];
        var pluginoptions = state[pluginname];
        if (state[pluginname]) {
          plugin.start(node, pluginoptions);
        }
      }
      
      // Let others know where the mouse/finger is:
      node.bind('click dblclick mousedown mouseover mouseup touchstart touchmove touchend',
        function(e) {
          var pos = {
            x: e.pageX - node.offset().top + state.center.x - node.width()/2,
            y: e.pageY - node.offset().left + state.center.y - node.height()/2,
          }
          e.getLat = function() {
            return $.jump.y2lat(pos.y, state.zoom, state.tilesize);
          }
          e.getLon = function() {
            return $.jump.x2lon(pos.x, state.zoom, state.tilesize);
          }
          return e;
        });
      
      // Let everyone do their thing:
      node.triggerHandler('changecenter', state.center);
    });
  }
  $.fn.jump.defaults = {
    zoom: 14,
    center: {
      lat: 52.52643,
      lon: 13.41156
    },
    clickcontroller: true,
    mousecontroller: true,
    touchcontroller: true,
    osmtiles: {tilesize: 256},
    attribution: true
  };
})(jQuery);


// OpenStreetMap tiles plugin
(function($){
  $.jump.plugins.osmtiles = {
    start: function(element, options){
      options = $.extend({}, $.jump.plugins.osmtiles.defaults, options);
      var state = element.data("state");
      state.tilesize = options.tilesize;
      var tilelist = {};
      function updatetiles() {
        var centertile = {
          y: Math.floor(state.center.x/state.tilesize),
          x: Math.floor(state.center.y/state.tilesize)
        }

        centertile.xTileOffset = state.center.x - state.tilesize * centertile.x;
        centertile.yTileOffset = state.center.y - state.tilesize * centertile.y;

        centertile.xTotalOffset = Math.floor(element.width()/2 - centertile.xTileOffset);
        centertile.yTotalOffset = Math.floor(element.height()/2 - centertile.yTileOffset);

        // the amount of tiles to the left and to the right of the center tile
        var leftCount = Math.ceil((element.width()/2 - centertile.xTileOffset) / state.tilesize);
        var rightCount = Math.ceil((element.width()/2 + centertile.xTileOffset) / state.tilesize) - 1;

        // the amount of tiles to the top and to the bottom of the center tile
        var topCount = Math.ceil((element.height()/2 - centertile.yTileOffset) / state.tilesize);
        var bottomCount = Math.ceil((element.height()/2 + centertile.yTileOffset) / state.tilesize) - 1;

        // show tiles:
        for (var i in tilelist) {
            tilelist[i].data("visible", false);
        }
        var img_template = $("<img/>")
          .css("position", "absolute")
          .css("width", state.tilesize)
          .css("height", state.tilesize);

        for (var x = -1 * leftCount; x <= rightCount; x++) {
          for (var y = -1 * topCount; y <= bottomCount; y++) {
            var current = {};
            current.tileXID = x + centertile.x;
            current.tileYID = y + centertile.y;
            current.id = "t_" + state.zoom + "_" + current.tileXID + "_" + current.tileYID;
            current.left = x * state.tilesize + centertile.xTotalOffset;
            current.top = y * state.tilesize + centertile.yTotalOffset;
            if (tilelist[current.id] == undefined) {
              current.img = img_template.clone()
                .attr("id", current.id)
                .css("left", current.left)
                .css("top", current.top)
                .attr("src", options.tileurl(state.zoom, current.tileXID, current.tileYID));
              element.append(current.img);
              tilelist[current.id] = current.img;
              //console.log(current.id);
            } else {
              current.img = tilelist[current.id];
              current.img.css("left", current.left);
              current.img.css("top", current.top);
            }
            current.img.data("visible", true);
          }
        }
        for (i in tilelist) {
            if(!tilelist[i].data("visible")) {
                $('#'+i).remove();
                delete tilelist[i];
            }
        }
      }
      element.bind('updatetiles', updatetiles);
      element.bind('changecenter', updatetiles);
      element.bind('zoom', updatetiles);
    }
  }
  $.jump.plugins.osmtiles.defaults = {
    tilesize: 256,
    tileurl: function(zoom,x,y) {
      var a = String.fromCharCode(97+Math.abs(zoom+x+y)%3); // a is either "a", "b" or "c"
      return "http://"+a+".tile.openstreetmap.org/"+zoom+"/"+x+"/"+y+".png";
      //return "tiles/"+zoom+"/"+x+"/"+y+".png";
    }
  }
})(jQuery);

// touch controller:
(function($){
  $.jump.plugins.touchcontroller = {
    start: function(element, options){
      var state = element.data("state");
      // Start dragging the map around:
      function touchstart(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        var touches = e.originalEvent.touches;
        //alert(touches.length);
        if (touches.length == 1) {
          currentlydragging = element;
          state.dragging = {};
          state.dragging.start = {
            x: touches[0].clientX,
            y: touches[0].clientY
          }
          state.dragging.original_x = state.center.x;
          state.dragging.original_y = state.center.y;
          $(document).bind("touchmove", touchmove);
          $(document).bind("touchend", touchend);
        } else {
          // it's a gesture
          touchend(e);
        }
      }; 
      element.bind("touchstart", touchstart);
      function touchmove(e){
        state.dragging.dragOffset = {
          x: e.originalEvent.touches[0].clientX - state.dragging.start.x,
          y: e.originalEvent.touches[0].clientY - state.dragging.start.y
        }
        var newcenter = {
          x: state.dragging.original_x - state.dragging.dragOffset.x,
          y: state.dragging.original_y - state.dragging.dragOffset.y
        }
        currentlydragging.trigger("changecenter", newcenter);
      };
      function touchend(e){
        var touches = e.originalEvent.touches;
        $(document).unbind("touchmove", touchmove);
        $(document).unbind("touchend", touchend);
      };
      function gesturechange(e) {
        var centerpos = {};
        if (e.originalEvent.scale < 0.5) {
          element.triggerHandler('zoomout', centerpos);
        }
        if (e.originalEvent.scale > 2) {
          element.triggerHandler('zoomin', centerpos);
        }
      }
      element.bind("gesturechange", gesturechange);
    }
  }
  // These functions work on the document, because
  // dragging should still work when the mouse is not over the map element
})(jQuery);

// mouse controller:
(function($){
  $.jump.plugins.mousecontroller = {
    start: function(element, options){
      var state = element.data("state");
      
      // Mousewheel handling:
      function mousescroll(e) {
        if(e.preventDefault) {
          e.preventDefault();
        }
        var delta = 0;
        e.type = "mousewheel";
        if ( event.wheelDelta ) delta = event.wheelDelta/120;
        if ( event.detail     ) delta = -event.detail/3;
        var mousepos = {
          x: e.pageX - element.offset().top,
          y: e.pageY - element.offset().left,
        }
        if (delta > 0) {
          element.triggerHandler('zoomin', mousepos);
        }
        if (delta < 0) {
          element.triggerHandler('zoomout', mousepos);
        }
      }
      element.bind('mousewheel', mousescroll);
      element.bind('DOMMouseScroll', mousescroll);
      //element.onmousewheel = mousescroll;
      
      // Start dragging the map around:
      element.bind("mousedown", function(e){
        currentlydragging = element;
        if(e.preventDefault) {
          e.preventDefault();
        }
        state.dragging = {};
        state.dragging.start = {
          x: e.pageX,
          y: e.pageY
        }
        state.dragging.original_x = state.center.x;
        state.dragging.original_y = state.center.y;
      });
    }
  }
  // These functions work on the document, because
  // dragging should still work when the mouse is not over the map element
  var currentlydragging = false;
  $(document).bind("mousemove", function(e){
    if (currentlydragging) {
      var state = currentlydragging.data("state");
      state.dragging.dragOffset = {
        x: e.pageX - state.dragging.start.x,
        y: e.pageY - state.dragging.start.y
      }
      var newcenter = {
        x: state.dragging.original_x - state.dragging.dragOffset.x,
        y: state.dragging.original_y - state.dragging.dragOffset.y
      }
      currentlydragging.trigger("changecenter", newcenter);
    }
  });
  $(document).bind("mouseup", function(e){
    if (currentlydragging) {
      currentlydragging = false;
    }
  });
})(jQuery);

// The little navigation boxes in the upper left corner are created here:
(function($){
  $.jump.plugins.clickcontroller = {
    start: function(element, options){
      //console.log("clickcontroller.start called", element, options);
      var div = $('<div class="clicknavigation">')
        .css("width", "52px")
        .css("position", "absolute")
        .css("z-index", "10")
        .css("top", "20px")
        .css("left", "20px");
      var a = $('<a class="clicknavigationbox" href="#">')
        .css("width", "21px")
        .css("height", "21px")
        .css("margin", "0")
        .css("background-color", "#FAFAFA")
        .css("border", "1px solid #AAA")
        .css("display", "inline-block")
        .css("text-align", "center")
        .css("font-weight", "bold")
        .css("font-size", "16px")
        .css("text-decoration", "none");
      function trig(event, args) {
        element.trigger(event, args);
        return false;
      }
      var north = a.clone()
        .addClass("gonorth")
        .html("&uarr;")
        .borderradius("15px 15px 0 0")
        .css("margin-left", "12px")
        .bind("click", function() {element.trigger("move", {y: -10});return false});
      var west = a.clone()
        .addClass("gowest")
        .html("&larr;")
        .borderradius("15px 0 0 15px")
        .bind("click", function() {element.trigger("move", {x: -10});return false});
      var east = a.clone()
        .addClass("goeast")
        .html("&rarr;")
        .borderradius("0 15px 15px 0")
        .bind("click", function() {element.trigger("move", {x: 10});return false});
      var south = a.clone()
        .addClass("gosouth")
        .html("&darr;")
        .borderradius("0 0 15px 15px")
        .css("margin-left", "12px")
        .bind("click", function() {element.trigger("move", {y: 10});return false});
      var zoomin = a.clone()
        .addClass("zoomin")
        .html("+")
        .borderradius("15px 15px 0 0")
        .css("margin", "10px 0 0 12px")
        .bind("click", function() {element.trigger("zoomin");return false});
      var zoomout = a.clone()
        .addClass("zoomout")
        .html("-")
        .borderradius("0 0 15px 15px")
        .css("margin-left", "12px")
        .bind("click", function() {element.trigger("zoomout");return false});
      div
        .append(north)
        .append(west)
        .append(east)
        .append(south)
        .append(zoomin)
        .append(zoomout);
      element.append(div);
    }
  }
})(jQuery);

// border radius helper:
(function($){
  $.fn.borderradius = function(options) {
    return this.each(function(){
      $(this)
        .css("border-radius", options)
        .css("-moz-border-radius", options)
        .css("-webkit-border-radius", options);
    });
  };
})(jQuery);

// attribution plugin
(function($){
  $.jump.plugins['attribution'] = {
    start: function(element, options){
      var state = element.data("state");
      var coords = $('<div style="position:absolute;bottom:5px;right:20px;font-family:sans-serif;font-size:12px;z-index:10;">');
      coords.html('Map data CCBYSA <a href="http://openstreetmap.org/">OpenStreetMap.org</a> contributors');
      element.append(coords);
    }
  }
})(jQuery);

// coordinates plugin
(function($){
  $.jump.plugins['coordinates'] = {
    start: function(element, options){
      var state = element.data("state");
      var coords = $('<div style="position:absolute;bottom:20px;right:20px;font-weight:bold;z-index:10;">');
      element.append(coords);
      element.bind("changecenter", function(e, loc) {
      coords.html(
        Math.round(loc.getNewLon()*100000)/100000 + "<br>" +
        Math.round(loc.getNewLat()*100000)/100000);
      });
    }
  }
})(jQuery);
