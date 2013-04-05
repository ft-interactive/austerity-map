/*
  zoomLevelToScale

  Turns a zoom level (1-20) into a transform scale.

  NB this is quite simplistic for now, might be better to do something logarithmy.
*/

window.UKA = window.UKA || {};

window.UKA.zoomLevelToScale = function (zoom_level) {
  'use strict';
  return (zoom_level / 2) + 0.5;
};
