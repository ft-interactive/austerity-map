/*global UKA*/

UKA.config = {
  duration: 250,
  map_projection_scale: 2000,

  min_map_transform_scale: 0.7,

  la_stroke_colour: '#fff1e0',
  la_stroke_colour_hover: '#666',
  la_stroke_width: 1,

  default_cut: 'BEDTAX',
  default_measure: 'NO_HH',

  num_buckets: 8,

  // The following "cuts" and "measures" arrays have been manually entered to be the same as those defined in config/data-properties.coffee. They must be kept the same. To do: take these out of the config into a separate file in app/data/ (next to the topojson file) and build it automatically along with the topojson file.
  cuts: [
    {
      "key": "BEDTAX",
      "label": "Under occupancy (bedroom tax)",
      "measures": [
        "NO_HH",
        "£MILL",
        "NO_P10000HH",
        "£PWA"
      ]
    },
    {
      "key": "BENCAP",
      "label": "Household benefit cap",
      "measures": [
        "NO_HH",
        "£MILL",
        "NO_P10000HH",
        "£PWA"
      ]
    },
    {
      "key": "CTB",
      "label": "Council tax benefit ",
      "measures": [
        "NO_HH",
        "£MILL",
        "NO_P10000HH",
        "£PWA"
      ]
    },
    {
      "key": "NONDEP",
      "label": "Non-dependent deduction",
      "measures": [
        "NO_HH",
        "£MILL",
        "NO_P10000HH",
        "£PWA"
      ]
    },
    {
      "key": "CHILDBEN",
      "label": "Child benefit ",
      "measures": [
        "NO_HH",
        "£MILL",
        "NO_P10000HH",
        "£PWA"
      ]
    },
    {
      "key": "TAXCRED",
      "label": "Tax credits",
      "measures": [
        "NO_HH",
        "£MILL",
        "NO_P10000HH",
        "£PWA"
      ]
    },
    {
      "key": "LHA",
      "label": "Local housing allowance ",
      "measures": [
        "NO_HH",
        "£MILL",
        "NO_P10000HH",
        "£PWA"
      ]
    },
    {
      "key": "DLA",
      "label": "Disability living allowance ",
      "measures": [
        "NO_INDIVID",
        "£MILL",
        "NO_P10000INDIVID",
        "£PWA"
      ]
    },
    {
      "key": "IB_ESA",
      "label": "Incapacity benefits",
      "measures": [
        "NO_INDIVID",
        "£MILL",
        "NO_P10000INDIVID",
        "£PWA"
      ]
    },
    {
      "key": "1%UPRATE",
      "label": "1 percent uprating",
      "measures": [
        "£MILL",
        "£PWA"
      ]
    },
    {
      "key": "TOTAL_IMPACT",
      "label": "Overall impact",
      "measures": [
        "£MILL",
        "£PWA"
      ]
    }
  ],

  measures: [
    {
      "key": "NO_HH",
      "label": "Number of households affected"
    },
    {
      "key": "£MILL",
      "label": "Estimated loss per area, £m per year"
    },
    {
      "key": "NO_P10000HH",
      "label": "Number of households affected per 10,000"
    },
    {
      "key": "£PWA",
      "label": "Loss per working age adult, £ per year"
    },
    {
      "key": "NO_P10000INDIVID",
      "label": "Number of individuals affected per 10,000"
    },
    {
      "key": "NO_INDIVID",
      "label": "Number of individuals affected"
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
