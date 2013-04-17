/*
  ZoomControl View

  Manages the section under the map showing charts etc. relating to the selected feature.
*/

/*global UKA, Backbone, $*/

(function () {
  //'use strict';

  var view,
      app,
      config,
      map;

  UKA.Views.ZoomControl = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate ZoomControl View more than once';
      view = this;

      app = UKA.app;
      map = UKA.map;
      config = UKA.config;

      $('#increase-zoom').on('click', function (event) {
        if (event.which === 1)
          map.zoomIn();
      });
      $('#decrease-zoom').on('click', function (event) {
        if (event.which === 1)
          map.zoomOut();
      });

      $('#reset-map').on('click', function (event) {
        if (event.which === 1) {
          map.setView(
            config.map_centre,
            config.initial_zoom
          );
        }
      });

      return view;
    }
  });

})();
