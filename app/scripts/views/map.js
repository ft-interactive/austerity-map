/*
  Map View class
  Instantiated once only, as UKA.map_view, the view instance that manages the svg#map element.
*/

/*global UKA, Backbone, d3*/

(function () {
  'use strict';

  // Create D3 mapping functions on initial execution
  var width = 972,
      height = 680,

      projection = d3.geo.mercator()
        .scale(16000)
        .center([0, 55.4])
        .translate([width / 2, height / 2]),

      path = d3.geo.path()
        .projection(projection)
  ;

  // Declare the Map View class, to be instantiated after DOM ready
  UKA.Views.Map = Backbone.View.extend({
    render: function () {
      var map_view = this ;

      // Get the SVG and set its dimensions
      var svg = d3.select(map_view.el)
        .attr('width', width)
        .attr('height', height)
      ;

      // Append the features
      svg.selectAll('.la')
        .data(UKA.data.features)
        .enter().append('path')
          .each(function () {
            console.log('each', arguments) ;
          })
          .attr('id', function (d) {
            return 'la_' + d.properties.CODE ;
          })
          .attr('class', 'la')
          .attr('d', path)
      ;

    }
  });

})();
