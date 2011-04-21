// coordinates plugin
(function($){
  $.jump.plugins['coordinates'] = {
    start: function(options){
      $this = $(this);
      function getOffset(lon, lat) {
        var result = {
          x: $.jump.lon2x(lon, state.zoom, state.tilesize) -
              (state.center.x - Math.floor($this.width()/2)),
          y: $.jump.lat2y(lat, state.zoom, state.tilesize) -
              (state.center.y - Math.floor($this.height()/2))
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
        $this.append(el);
        $this.bind("zoom changecenter", function(event, level) {
          position = getOffset(loc.lon, loc.lat);
          el.css("left", position.x + off.x);
          el.css("top", position.y + off.y);
        });
      }
      $this.bind('addElement', addElement);
      
      function addMarker(event, options) {
        options = $.extend({
          color: "red",
          content: false,
          offset: {x:-9, y: -9}
        }, options);
        var popup = $('<div>')
          .css("border", "1px solid grey")
          .css("background-color", "white")
          .css("z-index", 11)
          .addClass("popupContent")
          .html(options.content)
          .mouseover(function() {
              $(this).show();
            })
          .mouseout(function() {
              $(this).hide();
            })
          .hide();
          
        var el = $('<div>')
          .css("border", "4px solid "+options.color)
          .css("height", "10")
          .css("width", "10")
          .css("z-index", 10)
          .borderradius("10px")
          .mouseover(function() {
              popup.show();
            })
          .mouseout(function() {
              popup.hide();
            });
        $this.trigger('addElement', {
          element: popup,
          location: options.location
        });
        $this.trigger('addElement', {
          element: el,
          offset: options.offset,
          location: options.location
        });
      }
      $this.bind('addMarker', addMarker);
    
    var $this = $(this);
      var state = $this.data("state");
      var coords = $('<div style="position:absolute;bottom:20px;right:20px;font-weight:bold;z-index:10;">');
      $this.append(coords);
      $this.bind("changecenter", function(e, loc) {
      coords.html(
        Math.round(loc.getNewLon()*100000)/100000 + "<br>" +
        Math.round(loc.getNewLat()*100000)/100000);
      });
    }
  }
})(jQuery);
