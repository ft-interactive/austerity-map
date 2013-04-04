/*
  Map View class
  The view that manages the svg#map element - one instance only, exported as `UKA.map_view`.
*/

/*global UKA, Backbone, d3*/

(function () {
  'use strict';

  // Create D3 mapping functions (and other vars for use from multiple methods of this view) on initial execution
  var map_view,
      app,

      config,

      svg,
      las_group_wrapper,
      las_group,
      la_paths,

      las_group_el,

      width = 972,
      height = 680,

      projection = d3.geo.mercator()
        // .scale( 16000 )
        .center( [0, 55.4] )
        .translate( [(width/2) + 200, height/2] ),

      projectPath = d3.geo.path()
        .projection(projection);

  // Declare the Map View class, to be instantiated after DOM ready
  UKA.Views.Map = Backbone.View.extend({
    initialize: function () {
      if (map_view)
        throw 'Cannot instantiate Map View more than once';

      map_view = this;
      app = UKA.app;
      config = UKA.config;

      // Set the geo scale of the projection function according to config
      projection.scale( config.map_projection_scale );

      // Establish the intial "transform" object for the map
      map_view.las_group_transform = {
        translate_x: 0,
        translate_y: 0,
        scale: 1
      };
    },

    render: function () {
      // Get the SVG and set its dimensions
      svg = d3.select(map_view.el)
        .attr('width', width)
        .attr('height', height)
      ;

      // Append a group element
      las_group_wrapper = svg.append('g').attr('id', 'las-group-wrapper');
      las_group = las_group_wrapper.append('g').attr('id', 'las-group');
      las_group_el = las_group[0][0];

      // Convert TopoJSON to GeoJSON
      var topojson_data = UKA.data,
          geojson_data = topojson.object(
            topojson_data, 
            topojson_data.objects['local-authorities']
          )
      ;

      // Append and draw the features
      la_paths = las_group.selectAll('.la')
        .data(geojson_data.geometries)
        .enter().append('path')
          // .attr('id', function (d) {
          //   return 'la_' + d.properties.CODE;
          // })
          .attr('class', 'la')
          .attr('stroke-width', '1')
          .attr('vector-effect', 'non-scaling-stroke')
          .on('click', function (d, i) {
            app.set('selected_la', d.properties);
          })
          .on('mouseover', function (d, i) {
            // Move hovered LA to end so it appears on top
            las_group_el.appendChild(this);
            this.setAttribute('stroke-width', '2');
          })
          .on('mouseout', function  (d, i) {
            this.setAttribute('stroke-width', '1');
          })
          .attr('d', function (d) {
            return projectPath(d) || '';
          })
      ;

      // Update the fill colours whenever relevant app state properties change
      app.on('change:selected_cut change:selected_measure', function () {
        // If the current combination of cut and measure is valid, update the colours
        $.each(config.cuts, function (i, cut) {
          if (
            cut.key === app.attributes.selected_cut &&
            cut.measures.indexOf(app.attributes.selected_measure) > -1
          ) {
            // This is a valid combination.
            // Update the colours
            map_view.updateMapColours();
            // Break from loop
            return false;
          }
        });
      });

      // Listen for mousewheel, and update app:map_scale property
      map_view.$el.mousewheel(function (event, delta, delta_x, delta_y) {
        event.preventDefault();

        var value = UKA.app.attributes.map_transform_scale + (delta_y*0.1);

        if (value < config.min_map_transform_scale)
          value = config.min_map_transform_scale;

        UKA.app.set('map_transform_scale', value);
      }) ;

      // Listen for mousedown and start a drag interaction
      map_view.$el.on('mousedown', function (mousedown_event) {
        if (mousedown_event.which === 1) {

          mousedown_event.preventDefault();

          var map_view_el = this,
              last_delta_x,
              last_delta_y,
              starting_translate_x = map_view.las_group_transform.translate_x,
              starting_translate_y = map_view.las_group_transform.translate_y;

          new DragSequence({
            initialEvent: mousedown_event,

            dragStart: function () {
            },

            dragMove: function (delta_x, delta_y, ds, move_event) {
              map_view.setLasGroupTransform({
                translate_x: starting_translate_x + delta_x,
                translate_y: starting_translate_y + delta_y
              });

              last_delta_x = delta_x;
              last_delta_y = delta_y;
            },

            dragEnd: function () {
              // console.log('new position', last_delta_x, last_delta_y);
            }
          });
        }
      });

      // Listen for chnages to app:map_scale and update the appearance
      app.on('change:map_transform_scale', (function () {
        var initialised = false,
            base_width,
            base_height
        ;

        return function () {
          // Updates the transform attribute to reflect the current values in the app model.

          // On first call, establish the 'real' size of the #las_group
          if (!initialised) {
            var las_bbox = las_group_el.getBBox();
            base_width = las_bbox.width;
            base_height = las_bbox.height;
            initialised = true;
          }

          // Work out the new translations for the current scale
          var new_scale = app.attributes.map_transform_scale,

              new_width = new_scale * base_width,
              new_height = new_scale * base_height,

              new_translate_x = new_width / 2,
              new_translate_y = new_height / 2
          ;

          // console.log('new_translate_y', new_translate_y, new_height, new_scale);

          map_view.setLasGroupTransform({
            scale: new_scale
          });
        };
      })()) ;

      // Return for chaining
      return this ;
    },


    ////////////////////////////////////////////////////////////
    // METHODS TO CONTROL THE RENDERED MAP
    ////////////////////////////////////////////////////////////

    // adjustLasGroupTransform: function (adjustments) {
    //   // This performs a relative adjustment of the current transform.

    //   console.log('adjustments', adjustments);

    //   var current_transform = map_view.las_group_transform,
    //       new_translate_x = current_transform.translate_x,
    //       new_translate_y = current_transform.translate_y,
    //       new_scale = current_transform.scale;

    //   // Work out adjustments
    //   if (adjustments.translate_x != null)
    //     new_translate_x += adjustments.translate_x;
    //   if (adjustments.translate_y != null)
    //     new_translate_y += adjustments.translate_y;
    //   if (adjustments.scale != null)
    //     new_scale += adjustments.scale;

    //   map_view.setLasGroupTransform({
    //     translate_x: new_translate_x,
    //     translate_y: new_translate_y,
    //     scale: new_scale
    //   });

    //   console.log('current_transform', current_transform);
    // },

    setLasGroupTransform: function (transform) {
      var current_transform = map_view.las_group_transform,
          scale = transform.scale,
          translate_x = transform.translate_x,
          translate_y = transform.translate_y,
          scale_changed = (scale != null),
          translate_changed = (translate_x != null || translate_y != null);

      if (scale == null)
        scale = current_transform.scale;
      if (translate_x == null)
        translate_x = current_transform.translate_x;
      if (translate_y == null)
        translate_y = current_transform.translate_y;

      // Update scale if necessary
      if (scale_changed) {
        var scale_transform_string = 'scale(' + scale + ')';
        las_group.attr('transform', scale_transform_string);

        // Update the stroke - TODO: enable this for when vector-effects property not supported (IE)
        // la_paths.attr('stroke-width', Math.round(config.la_stroke_width * (-scale)));
      }

      // Update the translate if necessary
      if (translate_changed) {
        var translate_transform_string = (
          'translate(' +
            translate_x + ' ' +
            translate_y +
          ')'
        );
        las_group_wrapper.attr('transform', translate_transform_string);
      }
      
      // Update the latest one stored on the map_view
      map_view.las_group_transform = {
        scale: scale,
        translate_x: translate_x,
        translate_y: translate_y
      };
    },

    updateMapColours: function () {
      // console.log('updating map colours');

      la_paths.attr('fill', function (d, i) {
        return map_view.getLaColour(d.properties);
      });
    },

    getLaColour: function (properties) {
      // Returns the correct colour for the given properties.

      // See what property we need to base this on
      var data = properties.cuts[app.get('selected_cut')][app.get('selected_measure')];

      if (!data || data.length !== 2) 
        throw 'Missing data for cut ' + app.get('selected_cut') + ' and measure ' + app.get('selected_measure');

      // Return a number
      var bucket_num = data[1];
      var multiplier = UKA.normaliseBucket(bucket_num, config.num_buckets);

      var divisions = 50 / multiplier;
      var luminosity = 75 - (divisions * bucket_num);

      return 'hsl(0,50%,'+ luminosity +'%)';
    }

  });

})();
