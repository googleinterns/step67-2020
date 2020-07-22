package com.google.sps.servlets;

class Constants {
  static final String DATABASE_ERROR = "Database not in list";
  static final String DATABASE_PARAM = "list-databases";
  static final String EMPTY_TABLE_ERROR = "Table is empty.";
  static final String ENCODING_ERROR = "Unable to encode";
  static final String ENCODING_TYPE = "UTF8";
  static final String GET_COLUMNS_FROM_TABLES = "SELECT table_name, ARRAY_AGG(column_name) FROM information_schema.columns WHERE table_name in (";
  static final String GET_TABLE_SQL = "SELECT table_name FROM information_schema.tables WHERE table_catalog = '' and table_schema = ''";
  static final String GROUP_BY_TABLE_NAMES = ") group by table_name ";
  static final String NULL_REDIRECT = "/index.html";
  static final String PROJECT = "play-user-data-beetle";
  static final String SCHEMA_INFO_SQL = "SELECT column_name, spanner_type, is_nullable FROM information_schema.columns WHERE table_name = '";
  static final String TABLE_SELECT_PARAM = "table-select";
  static final String TEST_INSTANCE = "test-instance";
  static final String TEXT_TYPE = "text/html;";
  static final String UNSUPPORT_ERROR = "This type is not currently supported.";
}