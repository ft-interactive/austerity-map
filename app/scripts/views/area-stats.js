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
	  console.log(selected_la);
      var new_html = '<div>';
	  new_html += ('<div class="laName">' + selected_la.name + '</div>');
      /*for (var key in selected_la) {
        if (key != 'cuts')
          new_html += ('<li>' + key + ': <b>' + selected_la[key] + '</b></li>');
        else {
          new_html += ('<li>DATA: <pre>');
          new_html += JSON.stringify(selected_la.cuts, null, 2);
          new_html += ('</pre></li>');
        }
      }*/
      new_html += '</div>';

      area_stats_view.$el.html(new_html);
      return this;
    }
  });

})();
