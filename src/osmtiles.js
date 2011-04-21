// OpenStreetMap tiles plugin
(function($){
  $.jump.plugins.osmtiles = {
    start: function(options){
      var $this = $(this);
      options = $.extend({}, $.jump.plugins.osmtiles.defaults, options);
      var state = $this.data("state");
      state.tilesize = options.tilesize;
      var tilelist = {};
      function updatetiles() {
        var centertile = {
          y: Math.floor(state.center.x/state.tilesize),
          x: Math.floor(state.center.y/state.tilesize)
        };

        centertile.xTileOffset = state.center.x - state.tilesize * centertile.x;
        centertile.yTileOffset = state.center.y - state.tilesize * centertile.y;

        centertile.xTotalOffset = Math.floor($this.width()/2 - centertile.xTileOffset);
        centertile.yTotalOffset = Math.floor($this.height()/2 - centertile.yTileOffset);

        // the amount of tiles to the left and to the right of the center tile
        var leftCount = Math.ceil(($this.width()/2 - centertile.xTileOffset) / state.tilesize);
        var rightCount = Math.ceil(($this.width()/2 + centertile.xTileOffset) / state.tilesize) - 1;

        // the amount of tiles to the top and to the bottom of the center tile
        var topCount = Math.ceil(($this.height()/2 - centertile.yTileOffset) / state.tilesize);
        var bottomCount = Math.ceil(($this.height()/2 + centertile.yTileOffset) / state.tilesize) - 1;

        // show tiles:
        var i, x, y;
        for (i in tilelist) {
            tilelist[i].data("visible", false);
        }
        var img_template = $("<img/>")
          .css("position", "absolute")
          .css("width", state.tilesize)
          .css("height", state.tilesize);

        for (x = -1 * leftCount; x <= rightCount; x++) {
          for (y = -1 * topCount; y <= bottomCount; y++) {
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
              $this.append(current.img);
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
      $this.bind('updatetiles', updatetiles);
      $this.bind('changecenter', updatetiles);
      $this.bind('zoom', updatetiles);
    }
  }
  $.jump.plugins.osmtiles.defaults = {
    tilesize: 256,
    tileurl: function(zoom,x,y) {
      zoom = Math.floor(zoom);
      var a = String.fromCharCode(97+Math.abs(zoom+x+y)%3); // a is either "a", "b" or "c"
      return "http://"+a+".tile.openstreetmap.org/"+zoom+"/"+x+"/"+y+".png";
      //return "tiles/"+zoom+"/"+x+"/"+y+".png";
    }
  }
})(jQuery);
