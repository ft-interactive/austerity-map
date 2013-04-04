config = {
  mysql_host: '127.0.0.1'
  mysql_user: 'root'
  mysql_password: ''
  mysql_table_name: 'uk_austerityV4'
  mysql_database: 'interactive'
  properties_mapping: {
    # Not including actual data properties such as "BEDTAX_NO_HH".
    # '' (empty string) means "just use the same name as in the database".
    # To exclude a property, just remove it from this list.
    'ORDER_HBCTB_FINAL'       : ''
    'Region'                  : 'region'
    # 'LA_NAME'                 : 'name'
    'ftDisplayName'           : 'name'
    'ONS_Area_code'           : 'code'
    'CENSUS_COD'              : ''
  }
}

# Export the object
module.exports = config
