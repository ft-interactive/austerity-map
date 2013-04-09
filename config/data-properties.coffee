# Define the standard four measures
default_measures = [
  'NO_HH', '£MILL', 'NO_P10000HH', '£PWA'
]


# Define the list of different benefit cut types
cuts = [
  {
    key   : 'BEDTAX'
    label : 'Under occupancy (bedroom tax)'
  }
  {
    key   : 'BENCAP'
    label : 'Household benefit cap'
  }
  {
    key   : 'CTB'
    label : 'Council tax benefit '
  }
  {
    key   : 'NONDEP'
    label : 'Non-dependent deduction'
  }
  {
    key   : 'CHILDBEN'
    label : 'Child benefit '
  }
  {
    key   : 'TAXCRED'
    label : 'Tax credits'
  }
  {
    key   : 'LHA'
    label : 'Local housing allowance '
  }
  {
    key   : 'DLA'
    label : 'Disability living allowance '
    measures: ['NO_INDIVID', '£MILL', 'NO_P10000INDIVID', '£PWA']
  }
  {
    key   : 'IB_ESA'
    label : 'Incapacity benefits'
    measures: ['NO_INDIVID', '£MILL', 'NO_P10000INDIVID', '£PWA']
  }
  {
    key   : '1%UPRATE'
    label : '1 percent uprating'
    measures: ['£MILL', '£PWA']
  }
  {
    key   : 'TOTAL_IMPACT'
    label : 'Overall impact'
    measures: ['£MILL', '£PWA']
  }
]


# Add the default "measures" array to any missing measures
for cut in cuts
  if not cut.measures?
    cut.measures = default_measures


# Define the different kinds of measures
measures = [
  {
    key   : 'NO_HH'
    label : 'Number of households affected'
  }
  {
    key   : '£MILL'
    label : 'Estimated loss per area, £m per year'
  }
  {
    key   : 'NO_P10000HH'
    label : 'Number of households affected per 10,000'
  }
  {
    key   : '£PWA'
    label : 'Loss per working age adult, £ per year'
  }
  {
    key   : 'NO_P10000INDIVID'
    label : 'Number of individuals affected per 10,000'
  }
  {
    key   : 'NO_INDIVID'
    label : 'Number of individuals affected'
  }
]


# Define the four presets
presets = [
  id          : "blackpool"
  title       : "Blackpool"
  description : "Overall most affected area"
  map_centre  : [50, 1]
  map_scale   : 8
  image_url   : "images/icon1.png"
  select_la   : "E06000009"
  translate_x : 1323
  translate_y : -1013
  zoom        : 20
,
  id          : "london"
  title       : "London"
  description : "Housing benefit cap"
  map_centre  : [50, 1]
  map_scale   : 8
  image_url   : "images/icon2.png"
  select_la   : "E09000033"
  translate_x : 223
  translate_y : -2435
  zoom        : 20
,
  id          : "neath-port-talbot"
  title       : "Neath Port Talbot"
  description : "Incapacity benefit"
  map_centre  : [50, 1]
  map_scale   : 8
  image_url   : "images/icon3.png"
  select_la   : "W06000012"
  translate_x : 499
  translate_y : -920
  zoom        : 7
,
  id          : "st-albans"
  title       : "St Albans"
  description : "Child benefit"
  map_centre  : [50, 1]
  map_scale   : 8
  image_url   : "images/icon4.png"
  select_la   : "E07000240"
  translate_x : 96
  translate_y : -1500
  zoom        : 13
]


# Export everything
module.exports = JSON.parse JSON.stringify {
  cuts: cuts
  measures: measures
  presets: presets
  extra_fields:
    # Miscellaneous database fields (per LA) to include in the JSON.
    # Key is the database field name; value is the name to use in the output JSON. A value of '' (empty string) means "use the same name as in the database".
    'ORDER_HBCTB_FINAL'               : ''
    'Region'                          : 'region'
    # 'LA_NAME'                       : 'name'
    'ftDisplayName'                   : 'name'
    'ONS_Area_code'                   : 'code'
    'CENSUS_COD'                      : ''
    'nuts3name'                       : ''
    'nuts3gdhi'                       : ''
    'nuts3_impactPerGdhi'             : ''
    'nutsNote'                        : ''
    'nuts3avgYrsText'                 : ''
    'nuts3TotalImpact'                : ''
    'mpList'                          : ''
    'GB_IMD_20%_ most_deprived_LSOAs' : ''
}
