/*
  PostcodeForm View
*/

/*global UKA, Backbone, $, UKPostcode*/

(function () {
  //'use strict';

  var view,
      app;

  UKA.Views.PostcodeForm = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate PostcodeForm View more than once';
      view = this;
      app = UKA.app;

      var $postcode_input = $('#postcode-input'),
          $postcode_hint = $('#postcode-hint');

      view.$el.on('submit', function (event) {
        // Prevent page refresh
        event.preventDefault();

        // Get the postcode they entered (and exit if empty)
        var postcode = $postcode_input.select().val();
        if (!postcode.length)
          return;

        // Scroll to map
        UKA.body_view.scrollToMap();

        // Format the postcode correctly
        postcode = (
          (new UKPostcode(postcode))
            .format(true) // get as capitalised string with space in middle
            //.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') // escape any special chars
        );

        if (postcode.indexOf(' ') > -1) {
          // It's a valid two-part postcode.

          // Select the text so they can easily type in a new postcode afterwards
          $postcode_input.val(postcode).select();

          // Work out a unique callback function name for this postcode
          var callback_name = 'postcodeCallback_' + (postcode.split(' ').join(''));

          // Query CartoDB for the postcode's location
          $.ajax({
            url: 'http://ig.ft.com/data/yql/index_4.php?_cf=273&pcode=' + postcode,
            type: 'GET',
            dataType: 'jsonp',
            global: false,
            jsonpCallback: callback_name,
            timeout: 9000,
            cache: true,
            success: function (data) {
              // console.log('data', data);
              var dataset = data.query.results.dataset;
              if (dataset.postcode) {
                var la = dataset.postcode.la;
                app.set('selected_la', UKA.map_view.all_las_properties[la]);
              }
              else {
                // Empty result set from Carto.
                $postcode_hint.text('Postcode not found').show();
                setTimeout(function () {
                  $postcode_hint.fadeOut(200);
                }, 1000);
              }
            }
          });
        }
        else {
          // They either entered an invalid postcode, or just single-section (eg "SE1").
          $postcode_hint.text('Invalid postcode').show();
          $postcode_input.one({
            input: function () {
              $postcode_hint.hide().empty();
            }
          });
        }
      });

      return view;
    }
  });

})();
