/*global UKA, $*/
(function (window) {
  'use strict';

  // Make a convenient lookup hash out of the config
  var cut_labels = {},
      cuts = UKA.config.cuts,
      cut, i;
  for (i = 0; i < cuts.length; i++) {
    cut = cuts[i];
    cut_labels[cut.key] = cut.label;
  };
  UKA.cut_labels = cut_labels;

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
