/*
  Map View class
  The view that manages the svg#map element - one instance only, exported as `UKA.map_view`.
*/

/*global UKA, Backbone, d3*/

(function () {
  'use strict';

  // Create D3 mapping functions (and other vars for use from multiple methods of this view) on initial execution
  var instantiated = false
    , map_view
    , app

    , svg
    , las_group
    , la_paths

    , width = 972
    , height = 680

    , projection = d3.geo.mercator()
        .scale( 16000 )
        .center( [0, 55.4] )
        .translate( [(width/2) + 200, height/2] )

    , projectPath = d3.geo.path()
        .projection(projection)
  ;

  // Declare the Map View class, to be instantiated after DOM ready
  UKA.Views.Map = Backbone.View.extend({
    initialize: function () {
      if (instantiated)
        throw 'Cannot instantiate Map View more than once' ;
      instantiated = true ;

      map_view = this ;
      app = UKA.app ;
    },

    render: function () {
      // Get the SVG and set its dimensions
      svg = d3.select(map_view.el)
        .attr('width', width)
        .attr('height', height)
      ;

      // Append a group element
      las_group = svg.append('g').attr('id', 'las-group') ;
      // Convert TopoJSON to GeoJSON
      var topojson_data = UKA.data,
          geojson_data = topojson.object(
            topojson_data, 
            topojson_data.objects['local-authorities']
          )
      ;

      // Append the features (without actually drawing their paths yet)
      la_paths = las_group.selectAll('.la')
        .data(geojson_data.geometries)
        .enter().append('path')
          .attr('id', function (d) {
            return 'la_' + d.properties.CODE ;
          })
          .attr('class', 'la')
          .on('click', function (d, i) {
            app.set('selected_la', d.properties) ;
          })
      ;
      
      // Draw the map
      map_view.drawPaths() ;

      // Listen for mousewheel, and update app:map_scale property
      map_view.$el.mousewheel(function (event, delta, delta_x, delta_y) {
        event.preventDefault() ;

        var value = UKA.app.attributes.map_scale + (delta_y * 5000) ;
        if (value < 5000)
          value = 5000 ;

        UKA.app.set('map_scale', value) ;
      }) ;

      // Listen for chnages to app:map_scale and update the appearance
      app.on('change:map_scale', function () {
        // Transition the map using the `#las_group[transform]` attribute - NB. this will run drawPaths at the end of the transition duration, which clears the transform and redraws everything geographically
        map_view.transitionMap() ;
      }) ;

      return this ;
    },


    ////////////////////////////////////////////////////////////
    // METHODS TO CONTROL THE RENDERED MAP
    ////////////////////////////////////////////////////////////
    updateProjector: function () {
      // This updates the projector function to reflect current `map_scale` and `map_centre` attributes of `app`.

      projection.scale( app.attributes.map_scale );
      return this ;
    },

    transitionMap: function (duration) {
      // This transitions the `transform` attribute of the #las_group to reflect the current app attributes 'map_scale' and 'map_centre'.

      if (typeof duration !== 'number')
        duration = UKA.config.duration ;

      // FOR NOW: use a D3 transition (slow - tweens all the paths in JS)
      this.updateProjector() ;
      var t = la_paths.transition().duration(duration);
      t.attr('d', function (d) {
        return projectPath(d) || '' ;
      });

      return this ;
    },

    drawPaths: function () {
      this.updateProjector() ;

      // Clear the `transform` from the #las_group
      // TODO

      // var startTime = Date.now() ;

      // Compute and set all the paths
      la_paths.attr('d', function (d) {
        return projectPath(d) || '' ;
      });

      // console.log('Drawn map in ' + (Date.now() - startTime) + ' ms') ;

      return this ;
    },


    ////////////////////////////////////////////////////////////
    // EVENT LISTENERS
    ////////////////////////////////////////////////////////////
    events: {
      'mousedown': 'mousedown',
      'mousemove': 'mousemove',
      'mouseup': 'mouseup'
    },

    mousedown: function (e) {
      // console.log('dragStart', e) ;
      this.dragging = true ;
    },

    mousemove: function (e) {
      if (this.dragging) {
        console.log('dragMove', e) ;
      }
    },

    mouseup: function (e) {
      // console.log('dragEnd', e) ;
      this.dragging = false ;
    }
  });

})();
