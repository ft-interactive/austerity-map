/*
  Map View class
  The view that manages the svg#map element - one instance only, exported as `UKA.map_view`.
*/

/*global UKA, Backbone, d3, $, topojson, DragSequence, _, numeral*/

(function () {
  'use strict';

  var map_view,
      app,

      config,

      svg,
      las_group_outer,
      las_group_wrapper,
      las_group,
      selected_la_group,
      unselected_las_group,
      la_paths,

      las_group_el,
      selected_la_group_el,
      unselected_las_group_el,
      selected_la_path_el,

      las_natural_width,
      las_natural_height,

      width = 972,
      height = 550,

      projection = d3.geo.mercator()
        // .scale( 16000 )
        .center( [0, 55.4] )
        .translate( [(width/2) + 200, height/2 - 40] ),

      projectPath = d3.geo.path()
        .projection(projection),

      $hover_box,

      hide_hover_box_timeout,
      hover_sequence,
      panning_sequence;


  // Declare the Map View class, to be instantiated after DOM ready
  UKA.Views.Map = Backbone.View.extend({

    all_las_properties: {},

    initialize: function () {
      if (map_view)
        throw 'Cannot instantiate Map View more than once';

      map_view = this;
      app = UKA.app;
      config = UKA.config;

      $hover_box = $(
        '<div id="hover-box">' +
        '</div>'
      ).appendTo('body');

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
        // .attr('width', width)
        // .attr('height', height)
      ;

      // Append group elements
      las_group_outer = svg.append('g').attr('id', 'las-group-outer');
      las_group_wrapper = las_group_outer.append('g').attr('id', 'las-group-wrapper');
      las_group = las_group_wrapper.append('g').attr('id', 'las-group');
      las_group_el = las_group[0][0];

      unselected_las_group = las_group.append('g').attr('id', 'unselected-las-group');
      unselected_las_group_el = unselected_las_group[0][0];
      selected_la_group = las_group.append('g').attr('id', 'selected-la-group');
      selected_la_group_el = selected_la_group[0][0];

      // Add a centre marker (for debugging)
      // svg.append('rect')
      //   .attr('id', 'centre-marker')
      //   .attr('x', width/2-1)
      //   .attr('y', height/2-1)
      //   .attr('width', 2)
      //   .attr('height', 2)
      //   .attr('fill', 'blue')
      // ;

      // Convert TopoJSON to GeoJSON
      var topojson_data = UKA.data,
          geojson_data = topojson.object(
            topojson_data,
            topojson_data.objects['local-authorities']
          )
      ;

      // Append and draw the features
      la_paths = unselected_las_group.selectAll('.la')
        .data(geojson_data.geometries)
        .enter()
        .append('path')
        .attr({
          // 'id': function (d) {
          //   return 'la_' + d.properties.code;
          // },
          'class': 'la',
          'stroke-width': getStrokeWidth(),
          'stroke': config.la_stroke_colour
        })
        .each(function (data) {
          // Add the actual path element to the properties object, for easy access elsewhere.
          // (This is OK because the paths never get redrawn, only their properties are updated as the app changes.)
          data.properties.el = this;

          // Also store it in a convenient lookup hash on the view
          map_view.all_las_properties[data.properties.code] = data.properties;
        })
        .on('click', function (d, i) {
          app.set('selected_la', d.properties);
        })
        .on('mouseover', function (d, i) {
          // Do nothing if this is during a pan
          if (panning_sequence)
            return;

          // Show the hover box regardless
          map_view.showHoverBox(this, d);

          // Unless this LA is actually selected, give it the hover effect
          if (app.attributes.selected_la !== d.properties) {
            unselected_las_group_el.appendChild(this);
            this.setAttribute('stroke-width', 2*getStrokeWidth());
            this.setAttribute('stroke', config.la_stroke_colour_hover);
          }
        })
        .on('mouseout', function  (d, i) {
          if (panning_sequence)
            return;

          if (app.attributes.selected_la === d.properties)
            return;

          this.setAttribute('stroke-width', getStrokeWidth());
          this.setAttribute('stroke', config.la_stroke_colour);

          map_view.hideHoverBox();
        })
        .attr('d', function (d) {
          return projectPath(d) || '';
        })
      ;

      // Note the original dimensions
      var bbox = las_group_wrapper[0][0].getBBox();
      las_natural_width = bbox.width;
      las_natural_height = bbox.height;

      // Update the fill colours whenever relevant app state properties change
      app.on('change:selected_combo', map_view.updateMapColours);

      // Set the stroke on whatever county is selected
      app.on('change:selected_la', function (app, selected_la, options) {

        var stroke_width = getStrokeWidth();

        // Remove thick stroke from previous LA path
        if (selected_la_path_el != null) {
          unselected_las_group_el.appendChild(selected_la_path_el);
          selected_la_path_el.setAttribute('stroke-width', stroke_width);
          selected_la_path_el.setAttribute('stroke', config.la_stroke_colour);
        }

        // Add thick stroke to new one, if any
        selected_la_path_el = selected_la.el;
        if (selected_la_path_el != null) {
          selected_la_group_el.appendChild(selected_la_path_el);
          selected_la_path_el.setAttribute('stroke-width', stroke_width * 2);
          selected_la_path_el.setAttribute('stroke', config.la_stroke_colour_selected);
        }
      });

      // Listen for mousewheel, and update app:map_scale property
      map_view.$el.mousewheel(function (event, delta, delta_x, delta_y) {
        if (!delta_y)
          return;

        event.preventDefault();

        var zoom_adjustment;
        if (delta_y > 0)
          zoom_adjustment = 1;
        else if (delta_y < 0)
          zoom_adjustment = -1;

        // console.log('zooming', zoom_adjustment);

        var old_zoom_level = app.attributes.zoom_level;

        app.set('zoom_level', old_zoom_level + zoom_adjustment);

        // if (app.attributes.zoom_level === old_zoom_level)
        //   return ;
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

          if (hover_sequence)
            hover_sequence.cancel();

          panning_sequence = new DragSequence({
            initialEvent: mousedown_event,

            dragStart: function () {
              // console.log('PAN STARTED');
              map_view.hideHoverBox();
            },

            dragMove: function (delta_x, delta_y, ds, move_event) {
              map_view.setLasGroupTransform({
                translate_x: starting_translate_x + delta_x,
                translate_y: starting_translate_y + delta_y
              });

              last_delta_x = delta_x;
              last_delta_y = delta_y;
            },

            dragEnd: function (ds, mouseup_event) {
              mouseup_event.preventDefault();
              panning_sequence = null;
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

          var new_scale = app.attributes.map_transform_scale;

          map_view.setLasGroupTransform({
            scale: new_scale
          });

        };
      })()) ;

      // Append a little shadow effect along the top
      // svg.append('rect').attr({
      //   id: 'inset-shadow',
      //   x: 0,
      //   y: 0,
      //   width: '100%',
      //   height: 15,
      //   fill: 'url(#inset-shadow-gradient)'
      // });

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

        // Also update the in-between group with the translation to compensate for the scaling
        var extra_width = (las_natural_width * scale) - las_natural_width;
        var extra_height = (las_natural_height * scale) - las_natural_height;
        // console.log('extra_width', extra_width);
        las_group_wrapper.attr(
          'transform',
          'translate(' + (-extra_width)*2 + ' ' + (-extra_height)/2 + ')'
        );

        // Update the stroke thickness of all the paths
        var new_stroke_width = getStrokeWidth();
        la_paths.attr('stroke-width', new_stroke_width);
      }

      // Update the translate if necessary
      if (translate_changed) {
        var translate_transform_string = (
          'translate(' +
            translate_x + ' ' +
            translate_y +
          ')'
        );
        las_group_outer.attr('transform', translate_transform_string);
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
        var sd = d.properties.cuts[app.get('selected_cut')][app.get('selected_measure')][1];
        return map_view.getLaColour(
          sd
        );
      });
    },

    getLaColour: function (sd_unit) {
      // Returns the correct colour for the given SD number.
      var luminosity = app.attributes.luminosities[sd_unit];
      return 'hsl(' + config.hue + ',' + config.saturation + '%,'+ luminosity +'%)';
    },

    // Hover box
    showHoverBox: function (path, data) {
      // console.log(data);
      var left_offset,
          top_offset,
          gap_above_cursor = 70,
          p = data.properties,
          selected_cut = app.attributes.selected_cut,
          selected_measure = app.attributes.selected_measure,
          cut_label = UKA.cut_labels[selected_cut],
          measure = _.where(config.measures, {key: selected_measure})[0],
          measure_label = measure.label,
          figure_code = 'formatted_figure_' + selected_cut + '_' + selected_measure;

      if (data.properties[figure_code] == null) {
        var value_and_sd = data.properties.cuts[selected_cut][selected_measure];
        var figure = value_and_sd[0];
        data.properties[figure_code] = (
          (measure.figure_prefix || '') +
          numeral(figure).format('0,0') +
          (measure.figure_suffix || '')
        ) /*+ ' ::: '+value_and_sd[1]*/;
      }

      hover_sequence = new DragSequence({
        threshold: 0,
        drag: false,

        dragStart: function () {
          // console.log('start');
          clearTimeout(hide_hover_box_timeout);
          $hover_box
            .html(
              '<h3>' + p.name + '</h3>' +
              '<h4>' + cut_label + '</h4>' +
              '<p>' + measure_label + '</p>' +
              '<div class="figure">' + data.properties[figure_code] + '</div>'
            )
            .show();
          left_offset = Math.round($hover_box.outerWidth() / 2) ;
          top_offset = $hover_box.outerHeight() + gap_above_cursor ;
        },

        dragMove: function (delta_x, delta_y, ds, move_event) {
          // console.log('move', move_event.pageX);

          // Just reposition the hover box
          $hover_box.css({
            top: (move_event.pageY - top_offset) + 'px',
            left: (move_event.pageX - left_offset) + 'px'
          });
        },

        dragCancel: function () {
          hover_sequence = null;
          // console.log('CANCELLING HOVER SEQUENCE');
        }
      });
    },

    hideHoverBox: function () {
      if (hover_sequence) {
        // console.log('CANCELLING HOVER SEQUENCE');
        hover_sequence.cancel();
        hover_sequence = null;
      }

      hide_hover_box_timeout = setTimeout(function () {
        $hover_box.fadeOut(100);
      }, 150);
    }
  });

  var getStrokeWidth = (function () {
    var results = [];

    function zoomLevelToStrokeWidth(zoom) {
      // Returns a sensible stroke thickness for the current zoom level, scaled to the inverse of whatever the current map transform scale is.

      var stroke;

      // Pick a sensible pixel thickness
      if (zoom === 1)
        stroke = 0.8;
      else if (zoom < 5)
        stroke = 1;
      else
        stroke = 1.5;

      // Scale it according to the current zoom level
      var scaled_stroke = stroke ;
      if (zoom !== 1)
        scaled_stroke *= ( 1 / UKA.zoomLevelToScale(zoom) );

      return scaled_stroke;
    }

    for (var i = 1; i < 21; i++) {
      results[i] = zoomLevelToStrokeWidth(i);
    }

    return function () {
      return results[app.attributes.zoom_level] /*|| zoomLevelToStrokeWidth(app.attributes.zoom_level)*/;
    };
  })();

})();
