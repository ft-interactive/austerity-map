###
  This module exports a grunt task function that builds a static TopoJSON file at `app/data/local-authorities-topo.json`.
###

config   = require '../data-config'
mysql    = require 'mysql'
fs       = require 'fs'
path     = require 'path'

INPUT_GEOJSON_FILE   = path.resolve 'data/la-shapes.json'
TEMP_GEOJSON_FILE    = path.resolve '.tmp/local-authorities.json'
OUTPUT_TOPOJSON_FILE = path.resolve 'app/data/local-authorities-topo.json'
TOPOJSON_BINARY_PATH = path.resolve 'node_modules/topojson/bin/topojson'

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
        output_properties = {}
        for own db_field, target_name of config.properties_mapping
          if record[db_field] is undefined
            throw "Field '#{db_field}' defined in config but not found in DB"
          target_name = db_field if not target_name
          output_properties[target_name] = record[db_field]

        output_features.push({
          type       : 'Feature'
          properties : output_properties
          geometry   : input_feature.geometry
        })
      else
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
          topojson_command = "#{TOPOJSON_BINARY_PATH} -o #{OUTPUT_TOPOJSON_FILE} --properties --id-property code #{TEMP_GEOJSON_FILE}"

          grunt.log.ok "Running topojson command..."

          require('child_process').exec topojson_command, (error, stdout, stderr) ->
            console.log topojson_command
            console.log stderr

            if error?
              throw 'TopoJSONconversion failed.'
            else
              grunt.log.ok 'Success.'
              
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
