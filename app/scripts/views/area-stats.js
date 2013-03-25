/*
  AreaStats View

  Manages the section under the map showing charts etc. relating to the selected feature.
*/

/*global UKA, Backbone, d3*/

(function () {
  'use strict';

  // Create D3 mapping functions (and other vars for use from multiple methods of this view) on initial execution
  var area_stats_view = null
    , app
  ;

  // Declare the Map View class, to be instantiated after DOM ready
  UKA.Views.AreaStats = Backbone.View.extend({
    initialize: function () {
      if (area_stats_view)
        throw 'Cannot instantiate AreaStats View more than once' ;
      area_stats_view = this ;

      app = UKA.app ;
      
      app.on('change:selected_la', this.render) ;

      return this ;
    },

    render: function () {
      var selected_la = app.get('selected_la') ;

      var new_html = '<ul>' ;
      for (var key in selected_la) {
        new_html += ('<li>' + key + ': <b>' + selected_la[key] + '</b></li>') ;
      }
      new_html += '</ul>' ;

      area_stats_view.$el.html(new_html) ;
      return this ;
    }
  });

})();
