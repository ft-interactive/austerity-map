/*
  App Model class
  Instantiated once only, as UKA.app, the model instance that holds the application's state.
*/

/*global UKA, Backbone*/

(function () {
  'use strict' ;

  var instantiated = false
    , config = UKA.config
  ;

  UKA.Models.App = Backbone.Model.extend({
    defaults: {
      'map_scale': config.map_scale
    },

    initialize: function () {
      if (instantiated)
        throw 'Cannot instantiate App Model more than once' ;
      instantiated = true ;

      return this ;
    },

    start: function () {
      // Instantiate and render the main map view
      var map_view = UKA.map_view = new UKA.Views.Map({
        tagName: 'svg',
        el: document.getElementById('map')
      });
      map_view.render();

      return this ;
    }
  });

})();
