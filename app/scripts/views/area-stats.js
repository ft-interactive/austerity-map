/*
  AreaStats View

  Manages the section under the map showing charts etc. relating to the selected feature.
*/

/*global UKA, Backbone, d3, $*/

(function () {
  'use strict';

  var view = null,
      app,
      pie,
      svg,
      arc,
      color,
      path,
      leftPos;

  $.fn.moveTop = function () {
    for (var i = 0; i < $('.' + $(this).attr('class')).length; i++) {
      $.each(this, function () {
        $(this).before($(this).next());
      });
    }
  };

  UKA.Views.AreaStats = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate AreaStats View more than once';
      view = this;

      app = UKA.app;

      app.on('change:selected_la', this.updateChart);
      return this;
    },

    render: function () {
      var new_html = '<div>';
      new_html += ('<div class="laName"></div>');
      new_html += ('<div class="areaLeftHolder"><div class="donutTitle"></div><div class="donutHolder"></div><div class="donutValue"></div><div class="nutsNote"></div></div>');
      new_html += ('<div class="areaRightHolder"><div class="areaContext">AREA IN CONTEXT</div><div class=politicalHolder><span style="font-size:22px"><i>Political</i></span>');
      new_html += ('<br/>Member(s) of Parliament who represents part or all of this local authority area:<br/>');
      new_html += ('<div class="mps"></div></div></div>');
      new_html += '</div>';
      view.$el.html(new_html);
      return this;
    },

    updateChart: function () {
      var selected_la = app.get('selected_la');
      var selected_measure = app.get('selected_measure');
      var selected_cut = app.get('selected_cut');
      var cuts = selected_la.cuts;
      var cutsLabels = UKA.config.cuts;
      var donut_values =[];
      var donut_labels =[];
      view.$('.laName').text(selected_la.name);
      view.$('.donutTitle').html('Annual impact<br/>per working<br/>age adult');
      view.$('.areaRightHolder').css('visibility','visible');
      if (selected_la.nutsNote == null) {
        view.$('.nutsNote').empty();
      } else {
        view.$('.nutsNote').text(selected_la.nutsNote);
      }

      view.$('.mps').text(selected_la.mpList);

      for (var cut in cuts) {
        var dVal = +(cuts[cut]['£PWA'][0]);
        donut_values.push(dVal);
      }

      var totalFig = Math.round(donut_values[donut_values.length-1]);

      view.$('.donutValue').html('<span style="font-size:18px">Total</span></br>£' + totalFig);

      donut_values.pop();

      for (var cutLabels in cutsLabels) {
        donut_labels.push(cutsLabels[cutLabels].label);
      }

      //donut creator
      view.$('.donutHolder').empty();
      var width = 235,
          height = 235,
          radius = Math.min(width, height) / 2;

      color = [ '#91BDAF', '#E9B099', '#E45C51', '#A3514F', '#613A23', '#4A4233', '#02665E', '#439D91', '#B3C9C3', '#DFDFDF' ];

      pie = d3.layout.pie()
          .sort(null);

      arc = d3.svg.arc()
          .innerRadius(radius - 54)
          .outerRadius(radius - 6);

      svg = d3.select('.donutHolder').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

      path = svg.selectAll('path')
        .data(pie(donut_values))
        .enter().append('path')
        .attr('fill', function(d, i) { return color[i]; })
        .attr('stroke', function(d, i) { return '#fff'; })
        .attr('class', 'dSeg' )
        .attr('d', arc)
        .each(function(d) { this._current = d; }) // store the initial values
        .on('mouseover', function donutOver(d, i) {
          leftPos = $('#cont').offset();
          $('.toolTip').show();
          $('.toolTip').empty();
          d3.select(this).style('stroke', '#000');
          $(this).moveTop();
          $('.toolTip').append('<div class="regionName"><b>' + donut_labels[i] + '</b><br/><div class="bigNumber">£' + Math.round(donut_values[i]) + '</div>');
          $('.toolTip').stop().animate(
            { opacity:1 },
            500
          );
        })
        .on('mouseout', function donutOut(d, i) {
          d3.select(this).style('stroke', '#fff');
          $('.toolTip').stop().animate(
            { opacity:0 },
            500
          );
        });

      $('#cont').bind('mousemove', function hoverHandler(e){
        //console.log(e);
        $('.toolTip').css('left', e.pageX + (20-leftPos.left)).css('top', e.pageY -60);
      });

      //change();

      // function change() {
      //   path = path.data(pie(donut_values)); // update the data
      //   path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
      // }

      // Store the displayed angles in _current.
      // Then, interpolate from _current to the new angles.
      // During the transition, _current is updated in-place by d3.interpolate.
      // function arcTween(a) {
      //   var i = d3.interpolate(this._current, a);
      //   this._current = i(0);
      //   return function(t) {
      //     return arc(i(t));
      //   };
      // }
    }
  });

})();
