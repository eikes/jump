// coordinates plugin
(function($){
  $.jump.plugins['coordinates'] = {
    start: function(options){
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
