/*
  Map View class
  The view that manages the svg#map element - one instance only, exported as `UKA.map_view`.
*/

/*global UKA, Backbone, d3, $, L, topojson, DragSequence, _, numeral*/

(function () {
  //'use strict';

  var map_view,
      app,

      config,

      is_ie,

      map,

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

      $hover_box,

      hide_hover_box_timeout,
      hover_sequence;

  function zoomLevelToSvgScale(zoom_level) {
    if (zoom_level == null)
      zoom_level = UKA.map.getZoom();
    return Math.pow(0.5, UKA.config.max_zoom - zoom_level);
  }

  // Declare the Map View class, to be instantiated after DOM ready
  UKA.Views.Map = Backbone.View.extend({

    all_las_properties: {},

    resetView: function () {
      map.setView(config.map_centre, config.initial_zoom);
    },

    initialize: function () {
      if (map_view)
        throw 'Cannot instantiate Map View more than once';

      map_view = this;
      app = UKA.app;
      config = UKA.config;

      is_ie = (navigator.appName === 'Microsoft Internet Explorer');

      $hover_box = $(
        '<div id="hover-box">' +
        '</div>'
      ).appendTo('body');

      // Establish the intial "transform" object for the map
      map_view.las_group_transform = {
        translate_x: 0,
        translate_y: 0,
        scale: 1
      };
    },

    render: function () {
      // Render Leaflet map

      // Initialise the Leaflet map
      UKA.map = map = new L.Map(map_view.el, {
        attributionControl: false,
        center: config.map_centre,
        minZoom: config.min_zoom,
        maxZoom: config.max_zoom,
        zoom: config.max_zoom, // not a mistake
        zoomAnimation: false,
        zoomControl: false,
        scrollWheelZoom: false
      });

      // // Add a tile layer (just for use in development)
      // var tile_layer = new L.TileLayer('http://ft.cartodb.com/tiles/uk_coastline/{z}/{x}/{y}.png?cache_policy=persist&cartodb_cache_buster=123', {
      //   opacity: 1
      // });
      // map.addLayer(tile_layer);

      // Create the SVG
      svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg','svg'));

      // Create the first (outermost) group element, which will be scaled to reflect Leaflet's zoom level
      var g1 = svg.append('g')
        .attr('id', 'g1');

      // Create the second group element, which will be translated (just once, at the start) to pull it into the SVG viewport
      var g2 = g1.append('g')
        .attr('id', 'g2');

      // Create group structure for the paths (all inside g2)
      las_group = g2.append('g').attr('id', 'las-group');
      unselected_las_group = las_group.append('g').attr('id', 'unselected-las-group');
      selected_la_group = las_group.append('g').attr('id', 'selected-la-group');

      // Also grab references to the actual <g> elements
      unselected_las_group_el = unselected_las_group[0][0];
      selected_la_group_el = selected_la_group[0][0];

      // Use Leaflet to implement a D3 geographic projector function
      function projectPoint(x) {
        var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
        return [point.x, point.y];
      }

      // Convert TopoJSON to GeoJSON
      var topojson_data = UKA.data,
          geojson_data = topojson.feature(
            topojson_data,
            topojson_data.objects['local-authorities']
          );
      topojson_data = null;

      // Establish geo bounds
      var bounds = d3.geo.bounds(geojson_data);

      // Append the SVG element to Leaflet's overlayPane div
      map.getPanes().overlayPane.appendChild(svg[0][0]);

      // Append and draw the features
      var last_path_mousedown_x, last_path_mousedown_y;
      la_paths = unselected_las_group.selectAll('.la')
        .data(geojson_data.features)
        .enter()
        .append('path')
        .attr({
          // 'id': function (d) {
          //   return 'la_' + d.properties.code;
          // },
          'class': 'la',
          'stroke-width': getStrokeWidth(config.initial_zoom),
          'stroke': config.la_stroke_colour
        })
        .each(function (data) {
          // Add the actual path element to the properties object, for easy access elsewhere.
          // (This is OK because the paths never get redrawn, only their properties are updated as the app changes.)
          data.properties.el = this;

          // And store its geometry on the properties object, for easy centroid calculation later
          data.properties.geometry = data.geometry;

          // Also store it in a convenient lookup hash on the view
          map_view.all_las_properties[data.properties.code] = data.properties;
        })
        .on('mousedown', function (d, i) {
          last_path_mousedown_x = d3.event.pageX;
          last_path_mousedown_y = d3.event.pageY;
        })
        .on('mouseup', function (d, i) {
          if (last_path_mousedown_x != null) {
            var threshold = 4,
                delta_x = Math.abs(last_path_mousedown_x - d3.event.pageX),
                delta_y = Math.abs(last_path_mousedown_y - d3.event.pageY),
                past_threshold = (delta_x > threshold || delta_y > threshold);

            if (!past_threshold) {
              // Mouse hasn't moved (much) since the mousedown.
              // Treat this as a deliberate click, i.e. select the clicked LA
              app.set('selected_la', d.properties);
            }

            last_path_mousedown_x = null;
            last_path_mousedown_y = null;
          }
        })
        .on('mouseover', function (d, i) {
          // Do nothing if this is during a pan
          if (is_ie)
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
          if (is_ie)
            return;

          if (app.attributes.selected_la === d.properties)
            return;

          this.setAttribute('stroke-width', getStrokeWidth());
          this.setAttribute('stroke', config.la_stroke_colour);

          map_view.hideHoverBox();
        })
      ;
      
      // Set the initial size and offset of the SVG element
      var orig_bottom_left = projectPoint(bounds[0]),
          orig_top_right = projectPoint(bounds[1]),
          orig_x = orig_bottom_left[0],
          orig_y = orig_top_right[1],
          orig_w = orig_top_right[0] - orig_x,
          orig_h = orig_bottom_left[1] - orig_y;
      svg
        .attr('width', orig_w)
        .attr('height', orig_h)
        .style({
          'position': 'absolute',
          'left': orig_x + 'px',
          'top': orig_y + 'px'
        });

      // Translate the inner group element so it aligns with the SVG viewport
      g2.attr('transform', 'translate(' + -orig_x + ',' + -orig_y + ')');

      // Set all the `d` properties of all the paths
      var drawPath = d3.geo.path().projection(projectPoint);
      la_paths.attr('d', drawPath);

      // Function to scale the map to whatever the current Leaflet zoom level is
      var scaleMap = function () {
        var bottom_left = projectPoint(bounds[0]),
            top_right = projectPoint(bounds[1]),
            x = bottom_left[0],
            y = top_right[1],
            w = top_right[0] - x,
            h = bottom_left[1] - y,
            scale = zoomLevelToSvgScale();

        // Reposition the SVG
        svg
          .attr('width', w)
          .attr('height', h)
          .style({
            'position': 'relative',
            'left': x + 'px',
            'top': y + 'px'
          });

        // Scale the outer group
        g1.attr('transform', 'scale(' + scale + ')');

        // Redraw the strokes
        la_paths.attr({
          'stroke-width': getStrokeWidth()
        });

        var selected_la = app.get('selected_la');
        if (selected_la)
          selected_la.el.setAttribute('stroke-width', 2 * getStrokeWidth());
      };

      // Scale the map whenever the view is reset (ie. once after each zoom step)
      map.on('viewreset', scaleMap);

      // Zoom the map out to the initial zoom level (as it was first created at the max zoom level to enable detailed drawing of the SVG paths)
      map.setZoom(config.initial_zoom);

      // Update the fill colours whenever relevant app state properties change
      app.on('change:selected_combo', map_view.updateMapColours);

      // Set the stroke on whatever county is selected, and zoom to it
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

        // Zoom to the county
        if (selected_la.bounds == null) {
          var bounds = d3.geo.bounds(selected_la.geometry);

          // Reverse them, as Leaflet uses opposite lat/lon order from D3
          bounds[0] = bounds[0].reverse();
          bounds[1] = bounds[1].reverse();

          selected_la.bounds = bounds;
        }

        var old_zoom = map.getZoom();
        map.fitBounds(selected_la.bounds);
        var new_zoom = map.getZoom();
        if (old_zoom > new_zoom)
          map.setZoom(old_zoom);
        else if (map.getZoom() > 8)
          map.setZoom(8);
      });

      // Return for chaining
      return this ;
    },


    ////////////////////////////////////////////////////////////
    // METHODS TO CONTROL THE RENDERED MAP
    ////////////////////////////////////////////////////////////

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
      if (zoom === 5)
        stroke = 0.8;
      else if (zoom < 8)
        stroke = 1;
      else
        stroke = 1.5;

      // Scale it according to the current zoom level
      var scaled_stroke = stroke ;
      if (zoom !== 1)
        scaled_stroke *= ( 1 / zoomLevelToSvgScale(zoom) );

      return scaled_stroke;
    }

    for (var i = 5; i < 11; i++) {
      results[i] = zoomLevelToStrokeWidth(i);
    }

    return function (zoom_level) {
      if (zoom_level == null)
        zoom_level = map.getZoom();

      return results[zoom_level] /*|| zoomLevelToStrokeWidth(app.attributes.zoom_level)*/;
    };
  })();

})();
