package com.google.sps.servlets; 

import com.google.cloud.spanner.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;

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

  // Construct SQL statement of form SELECT <columns list> FROM <table> WHERE <conditions>
  static Statement constructQueryStatement(Statement.Builder builder, List<ColumnSchema> columnSchemas, String table, HttpServletRequest request) {
    builder.append("SELECT ");

    int loopCount = 0;
    for (ColumnSchema columnSchema : columnSchemas) {
      if (loopCount != 0) {
        builder.append(", ");
      }
      builder.append(columnSchema.columnName());
      loopCount++;
    }

    builder.append(String.format(" FROM %s ", table));
    getWhereStatement(builder, columnSchemas, table, request);
    Statement statement = builder.build();
    return statement;
  }

  //TODO add binding here for condition values
  //TODO deal with types other than int and string
  static void getWhereStatement(Statement.Builder builder, List<ColumnSchema> columnSchemas, String table, HttpServletRequest request) {
    int loopCount = 0;
    for (ColumnSchema colSchema : columnSchemas) {
      String colName = colSchema.columnName();
      String filterValue = request.getParameter(table + "-" + colName);
      if (filterValue != null && !filterValue.equals("")) {
        if (loopCount == 0) {
          builder.append("WHERE ");
        } else {
          builder.append(" AND ");
        }
        appendCondition(filterValue, builder, colSchema.schemaType(), colName);
        loopCount++;
      }
    }
  }

  private static void appendCondition(String filterValue, Statement.Builder builder, String colType, String colName) {
    String condString = colName + " = @" + colName;
    switch (colType) {
      case "STRING": 
        builder.append(condString).bind(colName).to(filterValue);
        break;
      case "INT64":
        int value = Integer.parseInt(filterValue);
        builder.append(condString).bind(colName).to(value);
        break;
      case "BOOL":
        boolean bool = Boolean.getBoolean(filterValue);
        builder.append(condString).bind(colName).to(bool);
    }
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