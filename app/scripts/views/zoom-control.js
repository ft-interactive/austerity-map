/*
  ZoomControl View

  Manages the section under the map showing charts etc. relating to the selected feature.
*/

/*global UKA, Backbone, $*/

(function () {
  'use strict';

  var view,
      app;

  UKA.Views.ZoomControl = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate ZoomControl View more than once';
      view = this;

      app = UKA.app;

      $('#increase-zoom').on('click', function (event) {
        if (event.which === 1)
          app.set('zoom_level', app.attributes.zoom_level + 2);
      });
      $('#decrease-zoom').on('click', function (event) {
        if (event.which === 1)
          app.set('zoom_level', app.attributes.zoom_level - 2);
      });

      $('#reset-map').on('click', function (event) {
        if (event.which === 1) {
          app.set('zoom_level', 1);
          UKA.map_view.setLasGroupTransform({
            translate_x: 0,
            translate_y: 0
          });
        }
      });

      return view;
    }
  });

})();
