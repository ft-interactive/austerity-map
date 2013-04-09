/*
  Key View
  Manages the dynamic histogram key.
*/

/*global UKA, Backbone, $*/

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

      console.log('KEY', view.el, UKA.deviations);

      // Set up key


      // Refresh the key whenever a new (valid) cut/measure combination is selected
      app.on('change:selected_cut change:selected_measure', function () {
        // If the current combination of cut and measure is valid, update the key
        $.each(config.cuts, function (i, cut) {
          if (
            cut.key === app.attributes.selected_cut &&
            cut.measures.indexOf(app.attributes.selected_measure) > -1
          ) {
            view.refresh();
            return false;
          }
        });
      });


      view.refresh();


      return view;
    },

    refresh: function () {
      var values = deviations[app.attributes.selected_cut + '_' + app.attributes.selected_measure];
      console.log('Refreshing key', values);

      var bars_html   = '<div class="the-bars">';
      var labels_html = '<div class="the-labels">';

      var min = (values.min < -4? -4 : values.min) ;
      var max = (values.max >  4?  4 : values.max) ;

      var num_bars = max - min ;
      var pct_width = (100 / num_bars) + '%';
      console.log('num_bars', num_bars);

      for (var i = min; i < max; i++) {
        console.log(i, values.mean + (i * values.sd));

        var from = Math.round(values.mean + (i * values.sd));
        var to = Math.round(values.mean + ((i+1) * values.sd));

        var colour = UKA.map_view.getLaColour(i);

        bars_html += (
          '<div class="bar" style="' +
            'width:' + pct_width + ';' +
            // 'height:10px;' +
            'background-color:' + colour + ';' +
          '" title="'+ from + ' - ' + to +'"></div>'
        ) ;

      }

      bars_html   += '</div>';
      labels_html += '</div>';

      // First, 

      $bars.empty().append(bars_html);
    }
  });

})();
