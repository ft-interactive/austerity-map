/*
  Key View
  Manages the dynamic histogram key.
*/

/*global UKA, Backbone, $, numeral*/

(function () {
  'use strict';

  var view,
      app,
      deviations,
      config,
      $bars;

  UKA.Views.Key = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate Key View more than once';
      view = this;

      app = UKA.app;
      deviations = UKA.deviations;
      config = UKA.config;

      $bars = $('#bars');

      // Render the key once at start, and whenever a new (valid) cut/measure combination is selected
      view.render();
      app.on('change:selected_combo', view.render);

      return view;
    },

    render: function () {
      var values = deviations[app.attributes.selected_cut + '_' + app.attributes.selected_measure],

          min = app.get('clamped_min_sdu'),
          max = app.get('clamped_max_sdu'),
          num_bars = max-min,
          pct_width = (100 / num_bars);

      // Build the bars HTML
      var bars_html   = '<div class="the-bars">';
      for (var i = min; i <= max; i++) {
        // There is no "zero" bar.
        if (i === 0)
          continue;

        var colour = UKA.map_view.getLaColour(i);

        bars_html += (
          '<div class="bar" style="' +
            'width:' + pct_width + '%;' +
            'background-color:' + colour + ';' +
            '"' +
          '>' + /*i +*/ '</div>'
        ) ;
      }
      bars_html   += '</div>';

      // Build the labels HTML
      var labels_html = '<div class="the-labels" style="left:-'+(pct_width/2)+'%">';
      for (i = min; i < max; i++) {
        // Building the label aligned with the left edge of the corresponding bucket.

        var label_value = Math.round(values.mean + (i * values.sd));

        var from = numeral(
          i === min ?
          values.min_val :
          label_value
        ).format('0,0');

        labels_html += (
          '<div class="key-label" style="' +
            'width:' + pct_width + '%;' +
            // (i===0? 'color:blue;' : '') +
          '">'+from+'</div>'
        ) ;
      }
      // Add the extra label at the end
      labels_html += (
        '<div class="key-label" style="' +
          'width:' + pct_width + '%;' +
        '">'+ values.max_val +'</div>'
      ) ;
      labels_html += '</div>';

      // Render
      $bars.empty().append(bars_html).append(labels_html);

      return view;
    }
  });

})();
