/*global UKA, $, _*/
(function () {
  'use strict';

  UKA.loadFieldDefinitions = function (properties) {
    _.extend(UKA.config, properties);

    // Make a convenient lookup hash out of the config
    var cut_labels = {},
        cuts = UKA.config.cuts,
        cut, i;

    for (i = 0; i < cuts.length; i++) {
      cut = cuts[i];
      cut_labels[cut.key] = cut.label;
    }
    UKA.cut_labels = cut_labels;
  };

  UKA.loadTopoJson = function (data) {
    UKA.data = data;
    $(function () {
      UKA.app = new UKA.Models.App();
      UKA.app.start();
    });
  };

  UKA.loadDeviations = function (data) {
    UKA.deviations = data;
  };

  // Foundation stuff
  $(document).foundation();

  $(function () {
    $(document.body).addClass('loaded');
  });

})();
