/*
  App Model class
  Instantiated once only, as UKA.app, the model instance that holds the application's state.
*/

/*global UKA, Backbone, $*/

(function () {
  'use strict';

  var app,
      config = UKA.config;

  function getLuminosities() {
    // Returns a hash with all the current SDUs as keys (even the ones outside the range) and all the valid things.

    var attributes      = app.attributes,
        num_buckets     = attributes.num_buckets,
        min_sdu         = attributes.min_sdu,
        max_sdu         = attributes.max_sdu,
        clamped_min_sdu = attributes.clamped_min_sdu,
        clamped_max_sdu = attributes.clamped_max_sdu,

        min_luminosity  = config.min_luminosity,
        max_luminosity  = config.max_luminosity,

        output = {},
        k;

    // Make an array of luminosity steps
    var luminosities = [];
    var lum_range = max_luminosity - min_luminosity;
    var step = ( lum_range / num_buckets );
    for (var i = 0; i <= num_buckets; i++) {
      luminosities.push(
        min_luminosity + (i * step)
      );
    }

    // Define the clamped ones
    for (k = clamped_min_sdu; k <= clamped_max_sdu; k++) {
      output[k] = luminosities.pop();
    }

    // Add values outside the range (as the clamped ones)
    for (k = min_sdu; k < clamped_min_sdu; k++) {
      output[k] = output[clamped_min_sdu];
    }
    for (k = clamped_max_sdu+1; k <= max_sdu; k++) {
      output[k] = output[clamped_max_sdu];
    }

    return output;
  }

  function updateKeyRelatedAttributes() {
    // This simply updates the num_buckets attribute to the correct number, reflecting the current selected_combo.
    // The app model automatically runs this once at start and again whenever the seelcted_combo is updated,
    // therefore you can always call app.get('num_buckets') and it will be correct for the current selection.

    var values = UKA.deviations[ app.get('selected_combo').join('_') ];

    var min = values.min,
        max = values.max,
        num_buckets = max - min,
        max_buckets = config.max_buckets;

    // Clamp it to ensure there's no more than max_buckets between them
    if (num_buckets > max_buckets) {
      if (max > -min)
        max = min + max_buckets;
      else
        min = max - max_buckets;

      num_buckets = max - min;
    }

    app.set({
      num_buckets: num_buckets,
      clamped_min_sdu: min,
      clamped_max_sdu: max,
      min_sdu: values.min,
      max_sdu: values.max
    });

    app.set('luminosities', getLuminosities());

    // console.log('Before: ', values.min, 'to', values.max, 'range', values.max-values.min);
    // console.log('After:', min, 'to', max, 'range', num_buckets);
    // console.log(app.get('luminosities'));
  }

  UKA.Models.App = Backbone.Model.extend({
    defaults: {
      'map_transform_scale': 1,
      'zoom_level': 1,

      'selected_la': null,
      'selected_measure': config.default_measure,
      'selected_cut': config.default_cut
    },

    initialize: function () {
      if (app)
        throw 'Cannot instantiate App Model more than once';
      app = this;

      // Set selected_combo and update it whenever a new VALID cut/measure combination is selected
      app.set('selected_combo', [app.attributes.selected_cut, app.attributes.selected_measure]);
      app.on('change:selected_cut change:selected_measure', function () {
        $.each(config.cuts, function (i, cut) {
          if (
            cut.key === app.attributes.selected_cut &&
            cut.measures.indexOf(app.attributes.selected_measure) > -1
          ) {
            app.set('selected_combo', [app.attributes.selected_cut, app.attributes.selected_measure]);
            return false;
          }
        });
      });

      // Update all the key-related stuff (luminosities, etc) once at start, and whenever the selected combo changes
      updateKeyRelatedAttributes();
      app.on('change:selected_combo', updateKeyRelatedAttributes);

      // Update zoom level to reflect scale
      // 10 is an acceptable maximum scale
      app.on('change:zoom_level', function () {

        // Clamp zoom level between 1 and 20
        var zoom_level = app.attributes.zoom_level;
        if (zoom_level < 1 || !zoom_level)
          zoom_level = 1;
        else if (zoom_level > 20)
          zoom_level = 20;
        app.attributes.zoom_level = zoom_level;

        // Calculate and set new transform scale
        var map_transform_scale = UKA.zoomLevelToScale(zoom_level);
        // console.log('changing scale from ' + app.attributes.map_transform_scale + ' to ' + map_transform_scale);
        app.set('map_transform_scale', map_transform_scale);
      });

      return this;
    },

    start: function () {
      // Set up the presets
      var presets = config.presets;
      UKA.preset_models = {};
      for (var i=0, l=presets.length; i<l; i++) {
        UKA.preset_models[presets[i].id] = new UKA.Models.Preset(presets[i]);
      }

      // Set up the main map view
      var map_view = UKA.map_view = new UKA.Views.Map({
        el: document.getElementById('map')
      });
      map_view.render().updateMapColours();

      UKA.area_stats_view = new UKA.Views.AreaStats({
        el: document.getElementById('area-stats')
      }).render();


      // Set up the cut types dropdown
      new UKA.Views.CutTypesDropdown({
        el: document.getElementById('cut-types-dropdown')
      }).render();

      // Set up the measurement options radio buttons
      new UKA.Views.MeasurementOptions({
        el: document.getElementById('measurement-options')
      }).render();

      // Set up zoom control
      new UKA.Views.ZoomControl({
        el: document.getElementById('zoom-control')
      });

      // Set up postcode form
      new UKA.Views.PostcodeForm({
        el: document.getElementById('postcode-form')
      });

      // Set up histogram-style key
      new UKA.Views.Key({
        el: document.getElementById('key')
      });

      // Select an LA at the start
      app.set('selected_la', UKA.map_view.all_las_properties[config.default_la]);

      // Handle postcode query string parameter OR preset id in hash

      function getQueryVariable(variable) {
          var query = window.location.search.substring(1);
          var vars = query.split('&');
          for (var i = 0; i < vars.length; i++) {
              var pair = vars[i].split('=');
              if (decodeURIComponent(pair[0]) == variable) {
                  return decodeURIComponent(pair[1]);
              }
          }
          // console.log('Query variable %s not found', variable);
      }

      function clickPresetToReflectHash() {
        var hash = location.hash;
        if (hash && hash.length > 1) {
          var $preset = $('#presets').find('[data-preset=' + hash.substring(1) + ']');
          // console.log('preset el', $preset[0]);
          $preset.trigger('click');

          if ('replaceState' in history) {
            // console.log('replacing');
            history.replaceState( {} , '', location.pathname);
          }
        }
      }

      var postcode_query = getQueryVariable('postcode');
      // console.log('postcode_query',postcode_query);
      if (postcode_query) {
        $('#postcode-input').val(postcode_query);
        $('#postcode-form').submit();
      }
      else {
        // Handle hash changes for preset
        // if ('onhashchange' in window)
        //   window.addEventListener('hashchange', clickPresetToReflectHash, false);
        clickPresetToReflectHash();
      }

      return this;
    }
  });

})();
