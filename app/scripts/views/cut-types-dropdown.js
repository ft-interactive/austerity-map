/*
  CutTypesDropdown View

  Manages the <select> element containing all the cut types (bedroom tax, housing benefit, etc).
*/

/*global UKA, Backbone*/

(function () {
  'use strict';

  var view = null,
      app,
      config,
      $el;

  UKA.Views.CutTypesDropdown = Backbone.View.extend({
    initialize: function () {
      if (view)
        throw 'Cannot instantiate CutTypesDropdown View more than once';

      view = this;
      app = UKA.app;
      config = UKA.config;
      $el = view.$el;
      
      // Update selection when app property changes
      app.on('change:selected_cut', view.selectCorrectOption);

      // Update app property when selection changes
      $el.on('change', function () {
        app.set('selected_cut', $el.val());
      });

      return view;
    },

    selectCorrectOption: function () {
      $el.val(app.get('selected_cut'));
      return view;
    },

    render: function () {
      $el.empty();

      var cut_type, i;
      for (i=0; i < config.cut_types.length; i++) {
        cut_type = config.cut_types[i];
        $('<option></option>')
          .attr('value', cut_type.value)
          .text(cut_type.label)
          .appendTo($el);
      }

      view.selectCorrectOption();
      
      return view;
    }
  });

})();
