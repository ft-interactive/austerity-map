/*
  Body View

  Manages page scrolling (and anything else that might apply to whole page).
*/

/*global UKA, Backbone, $*/

(function () {
  //'use strict';

  var view,
      app,
      $page,
      $map_cont,
      $nav_container;

  UKA.Views.Body = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate Body View more than once';
      view = this;

      app = UKA.app;

      $page = $('html, body');
      $map_cont = $('#map-cont');
      $nav_container = $('#nav-container');

      return view;
    },

    scrollToMap: function () {
      $page.animate({
        scrollTop: ($map_cont.offset().top - $nav_container.outerHeight()) + 'px'
      }, 400);
    }
  });

})();
