/*
  Preset View

  Manages the section under the map showing charts etc. relating to the selected feature.
*/

/*global UKA, Backbone, $, _*/

(function () {
  'use strict';

  var app,
      $presets;

  UKA.Views.Preset = Backbone.View.extend({
    className: 'preset',

    initialize: function () {
      app = UKA.app;
      $presets = $('#presets');

      return this;
    },

    render: function () {
      var a = this.model.attributes;

      this.$el.html(
        '<img src="' + a.image_url + '">' +
        '<h4>' + _.escape(a.title) + '</h4>' +
        '<p>' + _.escape(a.description) + '</p>'
      );

      return this;
    },

    append: function () {
      this.$el.appendTo($presets);
    },

    events: {
      click: function (event) {
        if (event.which === 1) {
          // event.preventDefault();
          app.set('preset', this.model.attributes);
        }
      }
    }
  });

})();
