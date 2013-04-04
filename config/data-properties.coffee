###
  This file defines all the data properties
###

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


module.exports = JSON.parse JSON.stringify {
  cuts: cuts
  measures: measures
}
