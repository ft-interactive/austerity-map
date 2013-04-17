/*
  App Model class
  Instantiated once only, as UKA.app, the model instance that holds the application's state.
*/

/*global UKA, Backbone, $*/

(function () {
  //'use strict';

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

      return this;
    },

    start: function () {
      // Set up the presets
      var presets = config.presets;
      UKA.preset_models = {};
      for (var i=0, l=presets.length; i<l; i++) {
        UKA.preset_models[presets[i].id] = new UKA.Models.Preset(presets[i]);
      }

      // Set up the body view
      UKA.body_view = new UKA.Views.Body({
        el: document.body
      });

      // Set up the main map view
      var map_view = UKA.map_view = new UKA.Views.Map({
        el: document.getElementById('map')
      });
      map_view.render().updateMapColours();

      // Set up area stats panel (under map)
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


      function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
          }
        }
        // console.log('Query variable %s not found', variable);
      }

      var replace_state_supported = ('replaceState' in history);

      // Convert the hash preset into a GET parameter
      var hash = location.hash;
      if (hash && hash.length > 1) {
        var new_url = location.pathname + '?preset='+ hash.substring(1);
        if (replace_state_supported)
          history.replaceState( {} , '', new_url);
        else
          location.href = new_url;
      }

      // Handle GET query parameters
      var postcode_param = getQueryVariable('postcode'),
          gss_param = getQueryVariable('gss'),
          preset_param = getQueryVariable('preset');

      if (!gss_param && !postcode_param && !preset_param) {
        // No query param; just select the default LA at the start
        app.set('selected_la', UKA.map_view.all_las_properties[config.default_la]);
        UKA.map_view.resetView();
      }

      // From now on, update the URL with the GSS whenever the selected_la changes
      if (replace_state_supported) {
        app.on('change:selected_la', function (app, new_la) {
          history.replaceState( {} , '', location.pathname + '?gss=' + new_la.code);
        });
      }

      if (gss_param) {
        // Simply select the specified LA then scroll to the map
        app.set('selected_la', UKA.map_view.all_las_properties[gss_param]);
        UKA.body_view.scrollToMap();
      }
      else if (postcode_param) {
        // Fill in the postcode form and submit it
        $('#postcode-input').val(postcode_param);
        $('#postcode-form').submit();
      }
      else if (preset_param) {
        // Click the preset (this will result in the URL being changed to the chosen LA)
        $('#presets').find('[data-preset=' + preset_param + ']').trigger('click');
      }

      // If loaded on a landscape-oriented device, alert to suggest switching to portrait mode
      var orientation = window.orientation;
      if (orientation === -90 || orientation === 90)
        window.alert('This map is best viewed in portrait mode.');


      // Return for chaining
      return this;
    }
  });

})();
