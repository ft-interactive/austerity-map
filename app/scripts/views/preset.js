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
        '<img src="' + a.image_url + '" draggable="false">' +
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
          var preset = this.model.attributes;

          if (preset.translate_x) {
            app.set('zoom_level', preset.zoom);
            UKA.map_view.setLasGroupTransform({
              translate_x: preset.translate_x,
              translate_y: preset.translate_y
            });
          }

          if (preset.select_la != null)
            app.set('selected_la', UKA.map_view.all_las_properties[preset.select_la]);
          if (preset.select_cut != null)
            app.set('selected_cut', preset.select_cut);
          if (preset.select_measure != null)
            app.set('selected_measure', preset.select_measure);
        }
      }
    }
  });

})();
