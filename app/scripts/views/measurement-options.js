/*
  MeasurementOptions View
*/

/*global UKA, Backbone, _, $*/

(function () {
  //'use strict';

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
      app.on('change:selected_measure', view.selectCorrectRadioButton);

      // Update app property when selection changes
      $el.on('change', 'input[name=measurement-option]', function () {
        if (this.checked)
          app.set('selected_measure', this.value);
      });

      // Re-render the whole list whenever the selected cut changes
      app.on('change:selected_cut', function () {
        view.render();
        if ( !$el.find('input:checked').length ) {
          // No radio button selected selected.
          // Just select the first one
          var $first_radio_button = $el.find('input').first();
          $first_radio_button.prop('checked', true);
          app.set('selected_measure', $first_radio_button.val());
        }
      });

      return view;
    },

    selectCorrectRadioButton: function () {
      var $radio_button = $el
        .find('[value=' + app.get('selected_measure') + ']');

      var $radio_label = $el
        .find('[for=' + 'mo_' + app.get('selected_measure') + ']');

      $('#measurement-options .radio-button-wrapper').removeClass('selected');
      // $('#measurement-options div label').addClass('unselected');

      if ($radio_button.length) {
        $radio_button.prop('checked', true);
        $radio_label.find('.radio-button-wrapper').addClass('selected');
      }
    },

    render: function () {
      $el.empty();

      // Set up cut types dropdown menu
      var option, i, id, input_value, input_id, measure, label,
          measures = config.measures
      ;

      // Find measures for the currently selected cut
      var cut = _.find(config.cuts, function (cut) {
        return cut.key === app.get('selected_cut');
      });
      if (!cut)
        throw 'Cut not found: ' + app.get('selected_cut');

      $el.append('<div id="filter-title">REFINE FILTERS</div>');

      for (i=0; i < measures.length; i++) {
        if (cut.measures.indexOf(measures[i].key) > -1) {
          // This cut does use this measure.
          measure = measures[i];
          input_value = measure.key;
          input_id = 'mo_' + input_value;
          label = _.escape(measure.label);
          $el.append(
            '<div>' +
              '<label for="' + input_id + '">' +
                '<span class="radio-button-wrapper">' +
                  '<input type="radio" name="measurement-option" value="' + input_value + '" id="' + input_id + '">' +
                '</span>' +
                '<span class="label-text">' +
                  label +
                '</span>' +
              '</label>' +
            '</div>'
          );
        }
      }

      // Ensure the correct one is selected now
      view.selectCorrectRadioButton();

      return view;
    }
  });

})();
