###
  This module exports a grunt task function that builds the data files in `app/data/` (using source information in `data/` and in the database).

  It builds these JSONP files (which call functions with hard-coded names):
    `app/data/data-properties.js` (the cuts, measures, and presets arrays, which get dynamically added to UKA.config)
    `app/data/data-deviations.js` (the values needed to draw the histogram)
    `app/data/local-authorities-topo.js` (The TopoJSON data)

  These files subsequently get included 
###

config          = require '../config/database-settings'
data_properties = require '../config/data-properties'
mysql           = require 'mysql'
fs              = require 'fs'
path            = require 'path'
_               = require 'underscore'

INPUT_GEOJSON_FILE        = path.resolve 'data/la-shapes.json'
TEMP_GEOJSON_FILE         = path.resolve '.tmp/local-authorities.json'
OUTPUT_TOPOJSON_FILE      = path.resolve 'app/data/local-authorities-topojson.js'
OUTPUT_DATA_FIELDS_FILE   = path.resolve 'app/data/fields.js'
DEVIATIONS_QUERY_FILE     = path.resolve 'data/get-deviations.sql'
OUTPUT_DEVIATIONS_FILE    = path.resolve 'app/data/deviations.js'
TOPOJSON_BINARY_PATH      = path.resolve 'node_modules/topojson/bin/topojson'


cuts = data_properties.cuts
extra_fields = data_properties.extra_fields

connection = mysql.createConnection({
  host     : config.mysql_host
  user     : config.mysql_user
  password : config.mysql_password
  database : config.mysql_database
})

module.exports = (grunt) -> (target) ->
  grunt_task_completed = this.async()

  # Connect to MySQL
  connection.connect()

  buildTopoJson = ->
    ################################################
    # STEP 3: Build app/data/local-authorities-topojson.js
    ################################################

    if target? and target isnt 'topojson'
      grunt.log.ok 'SKIPPING creation of topojson file.'
      grunt_task_completed()
      return

    # Load the JSON file
    input_features = require(INPUT_GEOJSON_FILE).features
    num_features = input_features.length

    output_features = []

    # Loop through it, doing a query thing for each one
    current_index = 0  
    buildNextFeature = ->
      input_feature = input_features[current_index]

      # Fetch using MySQL
      sql = "SELECT * FROM `#{config.mysql_table_name}` WHERE `ONS_Area_code` = '#{input_feature.properties.CODE}' LIMIT 1"

      connection.query sql, (err, rows, fields) ->
        if err?
          grunt.log.error "MySQL query error for query: #{sql}"
          throw err

        record = rows[0]
        if record?
          # Build the feature for this LA record
          output_properties = {}

          # Include the miscellaneous extra database fields for this LA
          for own db_field, target_name of extra_fields
            if record[db_field] is undefined
              throw "Field '#{db_field}' defined in `data/data-properties.coffee` but not found in DB"
            target_name = db_field if not target_name
            output_properties[target_name] = record[db_field]

          # Build an object containing all the cuts:measures data for this LA
          cut_values_for_feature = {}
          for cut in cuts
            cut_key = cut.key
            cut_values_for_feature[cut_key] = {}
            for measure_key in cut.measures
              # Geting the value and bucket number for this cut/measure combo
              field_name = "#{cut_key}_#{measure_key}"

              # Get the value
              value = record[field_name]
              if not value? then throw "DB FIELD NOT FOUND: #{field_name}"

              # Get the bucket 
              bucket_field_name = "#{field_name}_quintile"
              bucket_num = record[bucket_field_name]
              if not bucket_num? then throw "DB FIELD NOT FOUND: #{bucket_field_name}"

              # Add to the object
              cut_values_for_feature[cut.key][measure_key] = [value, bucket_num]

          # Add the cuts object to the `properties` object for this feature
          output_properties.cuts = cut_values_for_feature

          # Add this feature to the list of all the features
          output_features.push({
            type       : 'Feature'
            properties : output_properties
            geometry   : input_feature.geometry
          })

        else
          # Just a warning in the console, as this feature is missing from the database
          grunt.log.error "Not found in DB; skipping: #{input_feature.properties.CODE} - #{input_feature.properties.NAME}"

        current_index++
        if current_index < num_features
          buildNextFeature()
        else
          # All features built.
          connection.end()

          output_geojson = {
            type     : "FeatureCollection"
            features : output_features
          }

          grunt.log.ok "Built GeoJSON with #{output_features.length} features"

          # Write the output geojson to a temp file
          fs.writeFile TEMP_GEOJSON_FILE, JSON.stringify(output_geojson), (err) ->
            if err?
              grunt.log.error "Error writing file: #{TEMP_GEOJSON_FILE}"
              throw err

            grunt.log.ok "Written temporary GeoJSON file"

            # Convert to TopoJSON using CLI
            topojson_command = "#{TOPOJSON_BINARY_PATH} -o #{OUTPUT_TOPOJSON_FILE} --properties --id-property code --simplify-proportion 0.05 #{TEMP_GEOJSON_FILE}"

            grunt.log.ok "Running topojson command..."

            require('child_process').exec topojson_command, (error, stdout, stderr) ->
              console.log topojson_command
              console.log stderr

              if error?
                throw 'TopoJSONconversion failed.'
              else
                grunt.log.ok 'Success.'

                # Prepend and append the file
                fs.writeFileSync(
                  OUTPUT_TOPOJSON_FILE,
                  (
                    ';UKA.loadTopoJson(' +
                    fs.readFileSync(OUTPUT_TOPOJSON_FILE, 'utf8') +
                    ');'
                  )
                )

                grunt.log.ok 'Added JSONP start and end to file.'

                # Delete the temporary TopoJSON file
                fs.unlink TEMP_GEOJSON_FILE, (err) ->
                  if err?
                    grunt.log.error "Error writing file: #{TEMP_GEOJSON_FILE}"
                    throw err

                  grunt.log.ok 'Temporary GeoJSON file removed.'

                  # ALL DONE.
                  grunt_task_completed()

    # Start the loop
    buildNextFeature()

  ################################################
  # STEP 1: Build app/data/fields.js
  ################################################

  if !target? or target is 'fields'
    fs.writeFileSync OUTPUT_DATA_FIELDS_FILE, (
      ';UKA.loadFieldDefinitions(' +
      JSON.stringify(data_properties, null, 2) +
      ');'
    )
    grunt.log.ok 'Built fields file.'
  else
    grunt.log.ok 'SKIPPING creation of fields file.'

  ################################################
  # STEP 2: Build app/data/deviations.js
  ################################################

  if !target? or target is 'deviations'
    sql = fs.readFileSync(DEVIATIONS_QUERY_FILE, 'utf8')
    connection.query sql, (err, rows, fields) ->
      if err?
        grunt.log.error "MySQL query error for query from this file: #{DEVIATIONS_QUERY_FILE}"
        throw err

      deviations = {}

      for row in rows
        deviations[row.var] = {
          min_val: row.minVal
          max_val: row.maxVal
          min: row.min
          max: row.max
          mean: row.mean
          sd: row.sd
        }

      fs.writeFileSync OUTPUT_DEVIATIONS_FILE, (
        ';UKA.loadDeviations(' +
        JSON.stringify(deviations, null, 2) +
        ');'
      )

      grunt.log.ok 'Built deviations file.'

      buildTopoJson()

  else
    grunt.log.ok 'SKIPPING creation of deviations file.'
    buildTopoJson()
