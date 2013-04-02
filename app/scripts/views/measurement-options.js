/*
  MeasurementOptions View
*/

/*global UKA, Backbone*/

(function () {
  'use strict';

  var view = null,
      app,
      config,
      $el;

  UKA.Views.MeasurementOptions = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate MeasurementOptions View more than once';

      view = this;
      app = UKA.app;
      config = UKA.config;
      $el = view.$el;
      
      // Update selection when app property changes
      app.on('change:selected_measurement_option', view.selectCorrectRadioButton);

      // Update app property when selection changes
      $el.on('change', 'input[name=measurement-option]', function () {
        if (this.checked)
          app.set('selected_measurement_option', this.value);
      });

      return view;
    },

    selectCorrectRadioButton: function () {
      $el
        .find('[value=' + app.get('selected_measurement_option') + ']')
        .prop('checked', true);
    },

    render: function () {
      $el.empty();

      // Set up cut types dropdown menu
      var option, i, id, input_value, input_id;
      for (i=0; i < config.measurement_options.length; i++) {
        option = config.measurement_options[i];
        input_value = option.value;
        input_id = 'mo_' + input_value;

        $el.append(
          '<div>' +
            '<label for="' + input_id + '">' +
              '<input type="radio" name="measurement-option" value="' + input_value + '" id="' + input_id + '">' +
              '<span>' +
                (option.label.replace(/&/g,'&amp;').replace(/</g,'&lt;')) +
              '</span>' +
            '</label>' +
          '</div>'
        );

        view.selectCorrectRadioButton();
      }

      return view;
    }
  });

})();
