// touch controller:
(function($){
  $.jump.plugins.touchcontroller = {
    start: function(options){
      var $this = $(this);
      var state = $this.data("state");
      // Start dragging the map around:
      function touchstart(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        var touches = e.originalEvent.touches;
        if (touches.length == 1) {
          state.dragging = {};
          state.dragging.start = {
            x: touches[0].clientX,
            y: touches[0].clientY
          }
          state.dragging.original_x = state.center.x;
          state.dragging.original_y = state.center.y;
          $(document).bind("touchmove", touchmove);
          $(document).bind("touchend", touchend);
          
          // set up double tap detection:
          if (!state.dbltap) {
            state.dbltap = setTimeout(function() {
              state.dbltap = false;
            }, 500);
          } else {
            clearTimeout(state.dbltap);
            state.dbltap = false;
            //var dblTapEvent = jQuery.Event("dbltap");
            //dblTapEvent.mapPosition = $.extend({},e.mapPosition,true);
            var dblTapEvent = $.extend({}, e, true);
            dblTapEvent.type = "dbltap";
            $this.trigger(dblTapEvent);
           }
        } else {
          // it's a 2 finger gesture
          touchend(e);
        }
      }; 
      $this.bind("touchstart", touchstart);
      function touchmove(e){
        state.dragging.dragOffset = {
          x: e.originalEvent.touches[0].clientX - state.dragging.start.x,
          y: e.originalEvent.touches[0].clientY - state.dragging.start.y
        }
        var newcenter = {
          x: state.dragging.original_x - state.dragging.dragOffset.x,
          y: state.dragging.original_y - state.dragging.dragOffset.y
        }
        $this.trigger("changecenter", newcenter);
      };
      function touchend(e){
        var touches = e.originalEvent.touches;
        $(document).unbind("touchmove", touchmove);
        $(document).unbind("touchend", touchend);
      };
      function gesturestart(e) {
        var centerpos = {};
        state.twoFingerTap = setTimeout(function() {
          state.twoFingerTap = false;
        }, 500);
      }
      $this.bind("gesturestart", gesturestart);
      function gestureend(e) {
        var centerpos = {};
        if (state.twoFingerTap) {
          clearTimeout(state.twoFingerTap);
          state.twoFingerTap = false;
          var twoFingerTapEvent = $.extend({}, e, true);
          twoFingerTapEvent.type = "twofingertap";
          $this.trigger(twoFingerTapEvent);
        }
      }
      $this.bind("gestureend", gestureend);
      function gesturechange(e) {
        var centerpos = {};
        //$this.triggerHandler('zoom', state.zoom - 1 + e.originalEvent.scale);
        if (e.originalEvent.scale < 0.75) {
          $this.triggerHandler('zoomout', centerpos);
        }
        if (e.originalEvent.scale > 1.25) {
          $this.triggerHandler('zoomin', centerpos);
        }
      }
      $this.bind("gesturechange", gesturechange);
      function dbltap(e){
        state.center.x = e.mapPosition.x;
        state.center.y = e.mapPosition.y;
        $this.triggerHandler("zoomin");
      }
      $this.bind("dbltap", dbltap);
      function twofingertap(e){
        //state.center.x = e.mapPosition.x;
        //state.center.y = e.mapPosition.y;
        $this.triggerHandler("zoomout");
      }
      $this.bind("twofingertap", twofingertap);
    }
  }
  // These functions work on the document, because
  // dragging should still work when the mouse is not over the map element
})(jQuery);

