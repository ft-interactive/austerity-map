/*
  Preset View

  Manages the section under the map showing charts etc. relating to the selected feature.
*/

/*global UKA, Backbone, $*/

(function () {
  'use strict';

  var app,
      $presets;

  UKA.Views.Preset = Backbone.View.extend({
    className: 'preset',

    initialize: function () {
      app = UKA.app;
      $presets = $('#presets');

      console.log('instantiating preset view', this, this.model);

      return this;
    },
    render: function () {
      var a = this.model.attributes;

      this.$el.html(
        '<img src="' + a.image_url + '">' +
        '<h4>' + a.title + '</h4>'
      );

      return this;
    },
    append: function () {
      this.$el.appendTo($presets);

    }
  });

})();
