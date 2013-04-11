/*global UKA, Backbone*/
(function () {
  //'use strict';

  UKA.Models.Preset = Backbone.Model.extend({
    initialize: function () {
      this.view = new UKA.Views.Preset({
        model: this
      }).render().append();
    }
  });

})();
