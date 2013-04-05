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
        app.set('zoom_level', app.attributes.zoom_level + 1);
      });
      $('#decrease-zoom').on('click', function (event) {
        app.set('zoom_level', app.attributes.zoom_level - 1);
      });

      return view;
    }
  });

})();
