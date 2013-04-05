/*global UKA, $*/
(function (window) {
  'use strict';

  // Instantiate the app when data downloaded

  window.loadBritainJSON = function (data) {
    UKA.data = data;
    $(function () {
      UKA.app = new UKA.Models.App();
      UKA.app.start();
    });
  };

  $.getJSON('data/local-authorities-topo.json', window.loadBritainJSON);

})(window);
