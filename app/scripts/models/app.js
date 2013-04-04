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

      'selected_la': null,
      'selected_measure': config.default_measure,
      'selected_cut': config.default_cut
    },

    initialize: function () {
      if (app)
        throw 'Cannot instantiate App Model more than once';
      app = this;

      // Establish the bucket ranges for each of the four measurement options
      // var measurement_options = config.measurement_options,
      //     option, i;
      // for (i = measurement_options.length - 1; i >= 0; i--) {
      //   option = measurement_options[i];
      //   console.log('option', option);
      // }

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
      });

      // Set up the cut types dropdown
      new UKA.Views.CutTypesDropdown({
        el: document.getElementById('cut-types-dropdown')
      }).render();

      // Set up the measurement options radio buttons
      new UKA.Views.MeasurementOptions({
        el: document.getElementById('measurement-options')
      }).render();

      return this;
    }
  });

})();
