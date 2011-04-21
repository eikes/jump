// The little navigation boxes in the upper left corner are created here:
(function($){
  $.jump.plugins.clickcontroller = {
    start: function(options){
      var $this = $(this);
      //console.log("clickcontroller.start called", $this, options);
      var div = $('<div class="clicknavigation">')
        .css("width", "60px")
        .css("position", "absolute")
        .css("z-index", "10")
        .css("top", "20px")
        .css("left", "20px");
      var a = $('<a class="clicknavigationbox" href="#">')
        .css("width", "25px")
        .css("height", "25px")
        .css("margin", "0")
        .css("background-color", "#FAFAFA")
        .css("border", "1px solid #AAA")
        .css("display", "inline-block")
        .css("text-align", "center")
        .css("font-weight", "bold")
        .css("font-size", "18px")
        .css("text-decoration", "none");
      function trig(event, args) {
        $this.trigger(event, args);
        return false;
      }
      var north = a.clone()
        .addClass("gonorth")
        .html("&uarr;")
        .borderradius("15px 15px 0 0")
        .css("margin-left", "12px")
        .bind("touchstart click", function(e) {$this.trigger("move", {y: -10});return false});
      var west = a.clone()
        .addClass("gowest")
        .html("&larr;")
        .borderradius("15px 0 0 15px")
        .bind("touchstart click", function(e) {$this.trigger("move", {x: -10});return false});
      var east = a.clone()
        .addClass("goeast")
        .html("&rarr;")
        .borderradius("0 15px 15px 0")
        .bind("touchstart click", function(e) {$this.trigger("move", {x: 10});return false});
      var south = a.clone()
        .addClass("gosouth")
        .html("&darr;")
        .borderradius("0 0 15px 15px")
        .css("margin-left", "12px")
        .bind("touchstart click", function(e) {$this.trigger("move", {y: 10});return false});
      var zoomin = a.clone()
        .addClass("zoomin")
        .html("+")
        .borderradius("15px 15px 0 0")
        .css("margin", "10px 0 0 12px")
        .bind("touchstart click", function(e) {$this.trigger("zoomin");return false});
      var zoomout = a.clone()
        .addClass("zoomout")
        .html("-")
        .borderradius("0 0 15px 15px")
        .css("margin-left", "12px")
        .bind("touchstart click", function(e) {$this.trigger("zoomout");return false});
      div
        .append(north)
        .append(west)
        .append(east)
        .append(south)
        .append(zoomin)
        .append(zoomout);
      $this.append(div);
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
