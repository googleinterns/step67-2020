package com.google.sps.servlets; 

import com.google.cloud.spanner.Statement;
import java.util.List;
import java.util.stream.Collectors;

final class QueryFactory {
  
  private static final QueryFactory instance = new QueryFactory();
  private static final String GROUP_BY_TABLE_NAMES = ") group by table_name";

  private QueryFactory() {
    // Private because static class
  }

  static QueryFactory getInstance() {
    return instance;
  }

  static Statement buildSchemaQuery(String table) {
    String query = "SELECT column_name, spanner_type, is_nullable ";
    query += "FROM information_schema.columns WHERE table_name = @name";
    return Statement.newBuilder(query.toString()).bind("name").to(table).build();
  }

  // Construct SQL statement of form SELECT <columns list> FROM <table>
  static Statement constructQueryStatement(List<ColumnSchema> columnSchemas, String table) {
    String columns = String.join(", ", columnSchemas.stream().map(ColumnSchema::columnName).collect(Collectors.toList()));
    String query = String.format("SELECT %s FROM %s", columns, table);

    return Statement.newBuilder(query).build();
  }

  static Statement buildColumnsQuery(String[] listOfTables) {
    String getColumnsSql = "SELECT table_name, ARRAY_AGG(column_name) ";
    getColumnsSql += "FROM information_schema.columns WHERE table_name in(";
    StringBuilder queryBuilder = new StringBuilder(getColumnsSql);

    for (int i = 0; i < listOfTables.length; i++) {
      String selectedTables = "'" + listOfTables[i] + "'";
      queryBuilder.append(selectedTables);
      if (i != listOfTables.length-1) {
        queryBuilder.append(", ");
      } 
    }
    queryBuilder.append(") group by table_name");   
    return Statement.newBuilder(queryBuilder.toString()).build();
  }
}