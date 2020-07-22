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

  // Construct SQL statement of form SELECT <columns list> FROM <table>
  static Statement constructQueryStatement(Statement.Builder builder, List<ColumnSchema> columnSchemas, String table, HttpServletRequest request) {
    //StringBuilder query = new StringBuilder("SELECT ");
    builder.append("SELECT ");

    int loopCount = 0;
    for (ColumnSchema columnSchema : columnSchemas) {
      if (loopCount != 0) {
        builder.append(", ");
      }
      //query.append(columnSchema.columnName() + ", ");
      builder.append(columnSchema.columnName());
      loopCount++;
    }
    // query.deleteCharAt(query.length() - 1); //Get rid of extra space
    // query.append(" FROM " + table); 
    // query.append(" " + where);

    builder.append(String.format(" FROM %s ", table));
    getWhereStatement(builder, columnSchemas, table, request);
    //return Statement.newBuilder(query.toString()).build();
    Statement s = builder.build();
    System.out.println(s.toString());
    return builder.build();
  }

  //TODO add binding here for condition values
  //TODO deal with types other than int and string
  static String getWhereStatement(Statement.Builder builder, List<ColumnSchema> columnSchemas, String table, HttpServletRequest request) {
    List<String> conditions = new ArrayList<>();
    
    int loopCount = 0;
    for (ColumnSchema colSchema : columnSchemas) {
      String colName = colSchema.columnName();
      String colType = colSchema.schemaType();
      String filterValue = request.getParameter(table + "-" + colName);
      if (filterValue != null && !filterValue.equals("")) {
        if (loopCount == 0) {
          builder.append("WHERE ");
        } else {
          builder.append(" AND ");
        }
        
        if (colType.equals("STRING")) {
          filterValue = "\"" + filterValue + "\"";
        }
        String condition = colName + "=" + filterValue;
        conditions.add(condition);
        String condString = colName + " = @" + colName;
        //builder.append(condString).bind("\"" + colName + "\"").to(filterValue);
        builder.append(condition);
        loopCount++;
      }
    }

    String whereQuerytoString = "WHERE " + String.join(" AND ", conditions);
    if (conditions.size() == 0) {
      return "";
    } else {
      return whereQuerytoString;
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