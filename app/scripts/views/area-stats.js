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

  function addCommas(nStr)
    {
      nStr += '';
      var x = nStr.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
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
      new_html += ('<div class="areaLeftHolder"><div class="donutTitle"></div><div class="donutHolder"></div><div class="donutValue"></div>');
      new_html += ('<div class= "imdNote"><span style="font-size:20px">Deprivation</span>');
      new_html += ('<div class="imd"></div></div></div>');
      new_html += ('<div class="areaRightHolder"><div class="areaContext">AREA IN CONTEXT</div><div class="politicalHolder"><span style="font-size:20px"><i>Political</i></span>');
      new_html += ('<br/>Member(s) of Parliament who represents part or all of this local authority area:');
      new_html += ('<div class="mps"></div>');
      new_html += ('<div class= "politicalHolder"><span style="font-size:20px"><i>Economics</i></span>');
      new_html += ('<div class="eco-fig1"></div></div>');     
      new_html += '</div></div>';
      view.$el.html(new_html);
      return this;
    },
	
	updateChart: function(){
    var selected_la = app.get('selected_la');
	  var selected_measure = app.get('selected_measure');
	  var selected_cut = app.get('selected_cut');
	  var cuts = selected_la.cuts
	  var cutsLabels = UKA.config.cuts
	  var donut_values =[];
	  var donut_labels =[];
    // console.log(selected_la)
    view.$(".laName").text(selected_la.name);
    view.$(".donutTitle").html("Annual impact per working age adult");
    view.$(".areaRightHolder").css("visibility","visible")
    view.$(".areaLeftHolder").css("visibility","visible")
    view.$(".mps").text(selected_la.mpList);
    var nVal = Number(selected_la.nuts3gdhi);
    var tVal = Number(selected_la.nuts3TotalImpact);
    var dVal;
    var nNote = selected_la.nutsNote;

    if(nVal > 1000){
      nVal = Math.round(nVal/100)/10;
      dVal="bn";
    }else{
      nVal = nVal.toFixed(1);
      dVal = "m"
    }
    if(nNote==null){
      nNote="";
    }
    if(selected_la.nuts3_impactPerGdhi ==null){
      view.$(".eco-fig1").text(nNote);
    }else{
      view.$(".eco-fig1").html("The " + selected_la.nuts3name + " NUTS3 region had a gross domestic household income of <span class='claret-value'>£" + nVal + dVal + "</span> in 2010. The total <span class='claret-value'>£" + tVal.toFixed(1) + "m</span> in benefit changes the region faces amount to <span class='claret-value'>" + selected_la.nuts3_impactPerGdhi + "</span> per cent of the region's disposable income, or approximately <span class='claret-value'>" + selected_la.nuts3avgYrsText + "</span> of regional growth. <br/><br/>" + nNote);
    }
    view.$(".eco-fig2").text(selected_la.nuts3_impactPerGdhi +"%");
    view.$(".eco-fig3").text(selected_la.nuts3_impactPerGdhi);
    if(Number(selected_la["GB_IMD_20%_ most_deprived_LSOAs"])==0){
      view.$(".imd").html('In ' +selected_la.name + ', <span class="claret-value">None</span> of the neighbourhoods are among the poorest 20% in Britain. The average for local authorities in Great Britain is <span class="claret-value">15.1%</span>.');
    }else{
      view.$(".imd").html('In ' +selected_la.name + ', <span class="claret-value">' + selected_la["GB_IMD_20%_ most_deprived_LSOAs"].toFixed(1) +'%</span> of neighbourhoods are among the poorest 20% in Britain. The average for local authorities in Great Britain is <span class="claret-value">15.1%</span>.');
    }

    for (var cut in cuts) {
      var dVal = Number(cuts[cut]['£PWA'][0]) 
      donut_values.push(dVal);
    }
	  var totalFig = Math.round(donut_values[donut_values.length-1]);
	  
	  view.$(".donutValue").html("<span style='font-size:20px'>Total</span></br>£" + totalFig);
  	  
	  donut_values.pop();
      
	  for (var cutLabels in cutsLabels) {
  	      donut_labels.push(cutsLabels[cutLabels].label);
  	  }

	  //donut creator
	  view.$(".donutHolder").empty();
	  var width = 250,
	      height = 250,
	      radius = Math.min(width, height) / 2;

	  color = [ "#91BDAF", "#E9B099", "#E45C51", "#A3514F", "#613A23", "#4A4233", "#02665E", "#439D91", "#B3C9C3", "#DFDFDF" ];

	  pie = d3.layout.pie()
	      .sort(null);

	  arc = d3.svg.arc()
	      .innerRadius(radius - 60)
	      .outerRadius(radius - 6);

	  svg = d3.select(".donutHolder").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	  path = svg.selectAll("path")
      .data(pie(donut_values))
      .enter().append("path")
      .attr("fill", function(d, i) { return color[i]; })
      .attr("stroke", function(d, i) { return "#fff"; })
      .attr("class", "dSeg" )
      .attr("d", arc)
      .each(function(d) { this._current = d; }) // store the initial values
      .on("mouseover", donutOver)
      .on("mouseout", donutOut);
			  
		  function donutOver(d, i) {
		  	  leftPos = $('#cont').offset();
			  $(".toolTip").show();
			  $(".toolTip").empty();
			  d3.select(this).style("stroke", function(d, i) { return "#000"; });
			  $(this).moveTop();
			  $(".toolTip").append("<div class='regionName'><b>" + donut_labels[i] + "</b><br/><div class='bigNumber' >£" + Math.round(donut_values[i]) + "</div>");
			  $(".toolTip").stop().animate(
				{
					opacity:1
				},
				500
				);
		  }
			  
		  function donutOut(d, i) {
			  d3.select(this).style("stroke", function(d, i) { return "#fff"; });
				$(".toolTip").stop().animate(
				{
					opacity:0
				},
				500
				);
		  }
			  
		  $('#area-stats').bind("mousemove", hoverHandler);
	
		  function hoverHandler(e){
			  //console.log(e);
			  $('.toolTip').css("left", e.pageX + Number(20 - leftPos.left)).css("top", e.pageY -60);
		  }

	 //change();

	  function change() {
	    path = path.data(pie(donut_values)); // update the data
	    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
	  }

	  // Store the displayed angles in _current.
	  // Then, interpolate from _current to the new angles.
	  // During the transition, _current is updated in-place by d3.interpolate.
	  function arcTween(a) {
	    var i = d3.interpolate(this._current, a);
	    this._current = i(0);
	    return function(t) {
	      return arc(i(t));
	    };
	  }
		
	}

  });

})();
