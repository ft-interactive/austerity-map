;UKA.loadFieldDefinitions({
  "cuts": [
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
  "measures": [
    {
      "key": "NO_HH",
      "label": "Number of households affected"
    },
    {
      "key": "£MILL",
      "label": "Estimated loss per area, £m per year",
      "figure_prefix": "£",
      "figure_suffix": "m"
    },
    {
      "key": "NO_P10000HH",
      "label": "Number of households affected per 10,000"
    },
    {
      "key": "£PWA",
      "label": "Loss per working age adult, £ per year",
      "figure_prefix": "£"
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
  "presets": [
    {
      "id": "blackpool",
      "title": "Blackpool",
      "description": "The seaside town will be hardest hit overall, losing £914 per working-age adult, nearly 5 per cent of local disposable income.",
      "map_centre": [
        50,
        1
      ],
      "map_scale": 8,
      "image_url": "images/icon1.png",
      "select_la": "E06000009",
      "translate_x": 1323,
      "translate_y": -1013,
      "zoom": 20
    },
    {
      "id": "london",
      "title": "London",
      "description": "The household benefit cap will be felt largely in the capital. London boroughs take the top five places for the worst affected areas.",
      "map_centre": [
        50,
        1
      ],
      "map_scale": 8,
      "image_url": "images/icon2.png",
      "select_la": "E09000033",
      "translate_x": 223,
      "translate_y": -2435,
      "zoom": 20
    },
    {
      "id": "neath-port-talbot",
      "title": "Neath Port Talbot",
      "description": "Incapacity benefit changes be felt most in the Welsh Valleys. Neath Port Talbot stands to lose £256 per working age each year.",
      "map_centre": [
        50,
        1
      ],
      "map_scale": 8,
      "image_url": "images/icon3.png",
      "select_la": "W06000012",
      "translate_x": 499,
      "translate_y": -920,
      "zoom": 7
    },
    {
      "id": "st-albans",
      "title": "St Albans",
      "description": "Limiting child benefit for higher-rate taxpayers is one change that will hit wealthy areas.St Albans will lose £102 for each working-age adult.",
      "map_centre": [
        50,
        1
      ],
      "map_scale": 8,
      "image_url": "images/icon4.png",
      "select_la": "E07000240",
      "translate_x": 96,
      "translate_y": -1500,
      "zoom": 13
    }
  ],
  "extra_fields": {
    "ORDER_HBCTB_FINAL": "",
    "Region": "region",
    "ftDisplayName": "name",
    "ONS_Area_code": "code",
    "CENSUS_COD": "",
    "nuts3name": "",
    "nuts3gdhi": "",
    "nuts3_impactPerGdhi": "",
    "nutsNote": "",
    "nuts3avgYrsText": "",
    "nuts3TotalImpact": "",
    "mpList": "",
    "GB_IMD_20%_ most_deprived_LSOAs": ""
  }
});