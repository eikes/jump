// mouse controller:
(function($){
  $.jump.plugins.mousecontroller = {
    start: function(options){
      var $this = $(this);
      var state = $this.data("state");
      
      // Mousewheel handling:
      function mousescroll(e) {
        e.preventDefault();
        var delta = 0;
        e.type = "mousewheel";
        if ( event.wheelDelta ) delta = event.wheelDelta/120;
        if ( event.detail     ) delta = -event.detail/3;
        var mousepos = {
          x: e.pageX - $this.offset().top,
          y: e.pageY - $this.offset().left,
        }
        if (delta > 0) {
          $this.triggerHandler('zoomin', mousepos);
        }
        if (delta < 0) {
          $this.triggerHandler('zoomout', mousepos);
        }
      }
      $this.bind('mousewheel', mousescroll);
      $this.bind('DOMMouseScroll', mousescroll);
      $this.onmousewheel = mousescroll;
      
      // Start dragging the map around:
      function mousedown(e){
        e.preventDefault();
        state.dragging = {};
        state.dragging.start = {
          x: e.pageX,
          y: e.pageY
        }
        state.dragging.original_x = state.center.x;
        state.dragging.original_y = state.center.y;
        $(document).bind("mousemove", mousemove);
        $(document).bind("mouseup", mouseup);
      }
  // These functions work on the document, because
  // dragging should still work when the mouse is not over the map $this
      function mousemove(e){
        e.preventDefault();
        state.dragging.dragOffset = {
            x: e.pageX - state.dragging.start.x,
            y: e.pageY - state.dragging.start.y
        }
        var newcenter = {
            x: state.dragging.original_x - state.dragging.dragOffset.x,
            y: state.dragging.original_y - state.dragging.dragOffset.y
        }
        $this.trigger("changecenter", newcenter);
      }
      function mouseup(e){
        $(document).unbind("mousemove", mousemove);
        $(document).unbind("mouseup", mouseup);
      }
      $this.bind("mousedown", mousedown);
      function dblclick(e){
        state.center.x = e.mapPosition.x;
        state.center.y = e.mapPosition.y;
        $this.triggerHandler("zoomin");
      }
      $this.bind("dblclick", dblclick);
    }
  }
})(jQuery);

