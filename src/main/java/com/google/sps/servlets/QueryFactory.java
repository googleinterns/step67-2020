package com.google.sps.servlets; 

import com.google.cloud.Date;
import com.google.cloud.spanner.Statement;
import com.google.cloud.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
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
    List<String> columnsList = columnSchemas.stream()
        .map(ColumnSchema::columnName)
        .collect(Collectors.toList());
    String columns = String.join(", ", columnsList);
    String query = String.format("SELECT %s FROM %s", columns, table);
    builder.append(query);
    getWhereStatement(builder, columnSchemas, table, request);

    return builder.build();
  }

  static void getWhereStatement(Statement.Builder builder, List<ColumnSchema> columnSchemas, String table, HttpServletRequest request) {
    int loopCount = 0;
    for (ColumnSchema colSchema : columnSchemas) {
      String colName = colSchema.columnName();
      if (colName.equals("UserId")) {
        String idString = request.getParameter("user_id");
        loopCount = addWhere(idString, loopCount, builder, colName, colSchema);
      } else if (colName.equals("DeviceId")) {
        String idString = request.getParameter("device_id");
        loopCount = addWhere(idString, loopCount, builder, colName, colSchema);
      } else {
        String filterValue = request.getParameter(table + "-" + colName);
        loopCount = addWhere(filterValue, loopCount, builder, colName, colSchema);

        // Deal with primary keys
        String primaryKey = request.getParameter(colName);
        loopCount = addWhere(primaryKey, loopCount, builder, colName, colSchema);
      }
    }
  }

  private static int addWhere(String value, int loopCount, Statement.Builder builder, String colName, ColumnSchema colSchema) {
    if (value != null && !value.equals("")) {
      if (loopCount == 0) {
        builder.append(" WHERE ");
      } else {
        builder.append(" AND ");
      }
      appendCondition(value, builder, colSchema.schemaType(), colName);
      loopCount++;
    }
    return loopCount;
  }

  //TODO: add/fix: array, bytes, struct
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
      case "FLOAT64":
        double floatVal = Double.parseDouble(filterValue);
        builder.append(condString).bind(colName).to(floatVal);
        break;
      case "BOOL":
        boolean bool = Boolean.getBoolean(filterValue);
        builder.append(condString).bind(colName).to(bool);
        break;
      case "DATE":
        Date date = Date.parseDate(filterValue);
        builder.append(condString).bind(colName).to(date);
        break;
      case "TIMESTAMP":
        Timestamp timestamp = Timestamp.parseTimestamp(filterValue);
        builder.append(condString).bind(colName).to(timestamp);
        break;
      case "ARRAY<INT64>":
        long[] longArray = stringToLongArray(filterValue);
        builder.append(condString).bind(colName).toInt64Array(longArray);
        break;
    }
  } 

  private static long[] stringToLongArray(String value) {
    String[] valueArray = value.split(",");
    long[] longArray = new long[valueArray.length];

    for (int index = 0; index < valueArray.length; index++) {
      long number = Long.parseLong(valueArray[index]);
      longArray[index] = number;
    }

    return longArray;
  }

  static Statement buildColumnsQuery(String[] listOfTables) {
    String getColumnsSql = "SELECT table_name, ARRAY_AGG(column_name) ";
    getColumnsSql += "FROM information_schema.columns WHERE table_name in(%s) group by table_name";
    
    List<String> tablesList = 
        Arrays.stream(listOfTables)
            .map(table -> String.format("'%s'", table))
            .collect(Collectors.toList());
    String tables = String.join(", ", tablesList);
  
    return Statement.newBuilder(String.format(getColumnsSql, tables)).build();
  }
} 