package com.google.sps.servlets; 

import com.google.cloud.spanner.Statement;
import java.util.List;

final class QueryFactory {
  
  private static final QueryFactory instance = new QueryFactory();
  private static final String GET_COLUMNS_FROM_TABLES = "SELECT table_name, ARRAY_AGG(column_name) FROM information_schema.columns WHERE table_name in(";
  private static final String GROUP_BY_TABLE_NAMES = ") group by table_name";
  private static final String SCHEMA_INFO_SQL = "SELECT column_name, spanner_type, is_nullable FROM information_schema.columns WHERE table_name = '";

  private QueryFactory() {
    // Private because static class
  }

  static QueryFactory getInstance() {
    return instance;
  }

  static String buildSchemaQuery(String table) {
    return SCHEMA_INFO_SQL + table + "'";
  }

  // Construct SQL statement of form SELECT <columns list> FROM <table>
  static Statement constructQueryStatement(List<ColumnSchema> columnSchemas, String table) {
    StringBuilder query = new StringBuilder("SELECT ");

    for (ColumnSchema columnSchema : columnSchemas) {
      query.append(columnSchema.columnName() + ", ");
    }
    query.deleteCharAt(query.length() - 1); //Get rid of extra space
    query.append(" FROM " + table); 
    Statement statement = Statement.newBuilder(query.toString()).build();
    return statement;
  }

  static String buildColumnsQuery(String[] listOfTables) {
    StringBuilder queryBuilder = new StringBuilder(GET_COLUMNS_FROM_TABLES);
    for (int i = 0; i < listOfTables.length; i++) {
      //TODO: check if backslash is actually needed here
      String selectedTables = "\'" + listOfTables[i] + "\'";
      queryBuilder.append(selectedTables);
      if (i != listOfTables.length-1) {
        queryBuilder.append(", ");
      } 
    }
    queryBuilder.append(GROUP_BY_TABLE_NAMES);   
    return queryBuilder.toString();
  }
}