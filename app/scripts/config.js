/*global UKA*/

UKA.config = {
  duration: 250,
  map_projection_scale: 2000,

  min_map_transform_scale: 0.7,

  la_stroke_colour: '#fff1e0',
  la_stroke_colour_hover: '#666',
  la_stroke_width: 1,

  default_cut_type: 'BEDTAX',
  default_measurement_option: 'NO_HH',

  map_bucket_colours: [
    '662222',
    '993F3C',
    'D17C70',
    'DF9C92',
    'EBBCB3'
  ],

  cut_types: [
    {
      value: 'BEDTAX',
      label: 'Spare bedroom tax'
    },
    {
      value: 'BENCAP',
      label: 'Housing benefit cap'
    },
    {
      value: 'CTB',
      label: 'Council tax benefit cut'
    },
    {
      value: 'NONDEP',
      label: 'Non-dependent deductions'
    }
  ],

  measurement_options: [
    {
      value: 'NO_HH',
      label: 'Number of households affected'
    },
    {
      value: 'NO_P10000HH',
      label: 'Number of people in affected households per 10,000'
    },
    {
      value: '£MILL',
      label: 'Total financial loss for local authority area'
    },
    {
      value: '£PWA',
      label: 'Financial loss per working adult'
    }
  ],

  presets: [
    {
      id: 'bedroom-tax',
      title: 'Bedroom tax in the Shetlands',
      description: 'A little blurb about the bedroom tax thing',
      map_centre: [50,1],
      map_scale: 8
    }
  ]
};
