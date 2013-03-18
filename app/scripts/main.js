/*global UKA, $*/
(function () {
  'use strict' ;

  // Download the data, then instantiate the app
  $.getJSON('data/britain.json', function (data) {
    UKA.data = data ;
    $(function() {
      UKA.app = new UKA.Models.App();
    });
  }) ;

})();
