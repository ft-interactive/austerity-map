/*global UKA, $, _*/
(function () {
  //'use strict';

  // Add webkit class for use in CSS hook
  if (/Firefox/.test(navigator.userAgent))
    $('html').addClass('firefox');

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


  // best practice jQuery JSON with JSONP fallback implementation
    var createRequest = function createRequest(url, queryParams, cache) {
        var opts = {
            type: 'GET',
            dataType: 'json',
            cache: !!cache,
            data: queryParams,
            url: url
        };

        //if (($.browser.msie && $.browser.version < 9) || !$.support.cors) {
        opts.dataType = 'jsonp';
        opts.global = false;
        opts.jsonpCallback = 'callback';
        opts.timeout = 9000;
        //}

        return $.ajax(opts);
    };

  // Foundation stuff
  $(document).foundation();

  $(function () {
    $(document.body).addClass('loaded');

    createRequest('http://ft-ig-comment-count.herokuapp.com/', null, false).done(function (data) {

        var count = 0;
        if (data && data.length && data[0].publiccommentcount) {
            count = data[0].publiccommentcount;
        }

        $('#comment-count').text(count);
    });
  });

})();
