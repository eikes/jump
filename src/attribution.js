// attribution plugin
(function($){
  $.jump.plugins['attribution'] = {
    start: function(options){
      var coords = $('<div style="position:absolute;bottom:5px;right:20px;font-family:sans-serif;font-size:12px;z-index:10;">');
      coords.html('Map data CCBYSA <a href="http://openstreetmap.org/">OpenStreetMap.org</a> contributors');
      $(this).append(coords);
    }
  }
})(jQuery);
