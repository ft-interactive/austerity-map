/*
  normaliseBucket

  Turns a standard deviation number (e.g. -2, -1, +1, +2) into a natural number.

  Example:
    If num_buckets is 8,
      - inputs can be -4 to +4 (not including 0)
      - output can be 1 to 8
*/

window.UKA = window.UKA || {};

window.UKA.normaliseBucket = function (bucket_num, num_buckets) {
  'use strict';

  var half, multiplier;

  multiplier = bucket_num;
  half = num_buckets / 2;

  // Normalise so e.g. -1 becomes 0, -2 becomes -1
  if (multiplier < 0) {
    multiplier += 1;
  }

  // Add half
  multiplier += half;

  // Clamp to between 1 and num_buckets
  if (multiplier > num_buckets)
    multiplier = num_buckets;
  else if (multiplier < 1)
    multiplier = 1;

  return multiplier;
};
