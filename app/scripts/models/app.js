/*
  App Model class
  Instantiated once only, as UKA.app, the model instance that holds the application's state.
*/

/*global UKA, Backbone*/

(function () {
  'use strict';

  var app,
      config = UKA.config;

  UKA.Models.App = Backbone.Model.extend({
    defaults: {
      'map_transform_scale': 1,
      'map_translate_x': 0,
      'map_translate_y': 0,
      'zoom_level': 1,

      'selected_la': null,
      'selected_measure': config.default_measure,
      'selected_cut': config.default_cut
    },

    initialize: function () {
      if (app)
        throw 'Cannot instantiate App Model more than once';
      app = this;

      // Update zoom level to reflect scale
      // 10 is an acceptable maximum scale
      app.on('change:zoom_level', function () {

        // Clamp zoom level between 1 and 20
        var zoom_level = app.attributes.zoom_level;
        if (zoom_level < 1 || !zoom_level)
          zoom_level = 1;
        else if (zoom_level > 20)
          zoom_level = 20;
        app.attributes.zoom_level = zoom_level;

        // Calculate and set new transform scale
        var map_transform_scale = UKA.zoomLevelToScale(zoom_level);
        // console.log('changing scale from ' + app.attributes.map_transform_scale + ' to ' + map_transform_scale);
        app.set('map_transform_scale', map_transform_scale);
      });

      return this;
    },

    start: function () {
      // Instantiate and render the main map view
      var map_view = UKA.map_view = new UKA.Views.Map({
        el: document.getElementById('map')
      });
      map_view.render().updateMapColours();

      UKA.area_stats_view = new UKA.Views.AreaStats({
        el: document.getElementById('area-stats')
      }).render();

      // Set up the cut types dropdown
      new UKA.Views.CutTypesDropdown({
        el: document.getElementById('cut-types-dropdown')
      }).render();

      // Set up the measurement options radio buttons
      new UKA.Views.MeasurementOptions({
        el: document.getElementById('measurement-options')
      }).render();

      // Set up zoom control
      new UKA.Views.ZoomControl({
        el: document.getElementById('zoom-control')
      });

      return this;
    }
  });

})();
