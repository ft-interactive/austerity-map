/*
  App Model class
  Instantiated once only, as UKA.app, the model instance that holds the application's state.
*/

/*global UKA, Backbone*/

(function () {
  'use strict' ;

  UKA.Models.App = Backbone.Model.extend({
    initialize: function () {

      // Instantiate and render the main map view
      var map_view = UKA.map_view = new UKA.Views.Map({
        tagName: 'svg',
        el: document.getElementById('map')
      });
      map_view.render();

    }
  });

})();
