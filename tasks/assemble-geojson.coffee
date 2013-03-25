###
  This module exports a grunt task function that builds a static GeoJSON file at `app/data/local-authorities.json`.
###

config = require '../data-config'
mysql  = require 'mysql'
fs     = require 'fs'
path   = require 'path'

INPUT_GEOJSON_FILE  = path.resolve 'data/la-shapes.json'
OUTPUT_GEOJSON_FILE = path.resolve 'app/data/local-authorities.json'

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

        output_geojson_string = JSON.stringify({
          type     : "FeatureCollection"
          features : output_features
        })

        grunt.log.ok "Built GeoJSON with #{output_features.length} features"

        # Write the output geojson to a file.
        fs.writeFile OUTPUT_GEOJSON_FILE, output_geojson_string, (err) ->
          if err?
            grunt.log.error "Error writing file: #{OUTPUT_GEOJSON_FILE}"
            throw err

          grunt.log.ok "Written GeoJSON to file: #{OUTPUT_GEOJSON_FILE}"
          grunt_task_completed()

  # Start the loop
  buildNextFeature()
