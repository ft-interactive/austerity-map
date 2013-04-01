/*
  App Model class
  Instantiated once only, as UKA.app, the model instance that holds the application's state.
*/

/*global UKA, Backbone*/

(function () {
  'use strict';

  var instantiated = false,
      config = UKA.config;

  UKA.Models.App = Backbone.Model.extend({
    defaults: {
      'map_transform_scale': 1,
      'map_translate_x': 0,
      'map_translate_y': 0,

      'selected_la': null
    },

    initialize: function () {
      if (instantiated)
        throw 'Cannot instantiate App Model more than once';
      instantiated = true;

      return this;
    },

    start: function () {
      // Instantiate and render the main map view
      var map_view = UKA.map_view = new UKA.Views.Map({
        el: document.getElementById('map')
      });
      map_view.render();

      UKA.area_stats_view = new UKA.Views.AreaStats({
        el: document.getElementById('area-stats')
      });

      return this;
    }
  });

})();
