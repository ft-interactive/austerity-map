/*global UKA, $*/
(function () {
  'use strict' ;

  // Instantiate the app when data downloaded

  window.loadBritainJSON = function (data) {
    UKA.data = data ;
    $(function() {
      UKA.app = new UKA.Models.App();
      UKA.app.start();
    }) ;
  } ;

  // $.getJSON('data/britain.json', loadBritainJSON) ;
  // (Just loads in via a script tag, for now.)

})();
