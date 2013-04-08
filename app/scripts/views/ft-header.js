/*
  FTHeader View
*/

/*global UKA, Backbone, _*/

(function () {
  'use strict';

  var view = null,
      app,
      config,
      $el;

  UKA.Views.FTHeader = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate FTHeader View more than once';

      view = this;
      app = UKA.app;

      return this;
    },

    render: function () {
      var new_html = '<div>';
      new_html += '<div class="ftLogo"></div>';
      new_html += '<div class="gTitle">Austerity in the UK</div>';
      new_html += '<div class="linksHolder"></div>';
      new_html += '</div>';
      
      view.$el.html(new_html);
      
      var linksArray=["Blackpool", "Guildford","Overview","Methodology"];

      for(var i=0; i<linksArray.length; i++){
        console.log(i);
        view.$(".linksHolder").append("<div class='headerLinks'><a href=''>" + linksArray[i].toUpperCase() + "</a></div>")
      }
      return this;
    }
  })
})();