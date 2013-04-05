/*
  AreaStats View

  Manages the section under the map showing charts etc. relating to the selected feature.
*/

/*global UKA, Backbone, d3*/

(function () {
  'use strict';

  var area_stats_view = null,
      app;

  UKA.Views.AreaStats = Backbone.View.extend({
    initialize: function () {
      if (area_stats_view)
        throw 'Cannot instantiate AreaStats View more than once';
      area_stats_view = this;

      app = UKA.app;
      
      app.on('change:selected_la', this.render);

      return this;
    },

    render: function () {
      var selected_la = app.get('selected_la');
	  var selected_measure = app.get('selected_measure');
	  var selected_cut = app.get('selected_cut');
	  console.log(selected_la);
	  console.log(UKA.config.cuts[0].label)
	  
	  var cuts = selected_la.cuts
	  var donut_values =[];
	       for (var cut in cuts) {
	         donut_values.push(cuts[cut]['£PWA'][0]);
	       }
	       console.log(donut_values);
      var new_html = '<div>';
      new_html += ('<div class="laName">' + selected_la.name + '</div>');
      new_html += '</div>';

      area_stats_view.$el.html(new_html);
      return this;
    }
  });

})();
