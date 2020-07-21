package com.google.sps.servlets;

import com.google.auto.value.AutoValue;
import com.google.cloud.ByteArray;
import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import com.google.common.collect.ImmutableList;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;

@WebServlet("/data-from-db")
public class DataFromDatabaseServlet extends HttpServlet {

  DatabaseClient dbClient;
  private String[] selectedTables;
  private Constants constants = new Constants();
  //TODO: (issue 15) get rid of this instance, and instead import constants
    // example: import static com.google.sps.servlets.Constants. GET_COLUMNS_FROM_TABLES;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType(constants.TEXT_TYPE);
    selectedTables = request.getParameterValues(constants.TABLE_SELECT_PARAM);
    String databaseName = request.getParameter(constants.DATABASE_PARAM);
    initDatabaseClient(databaseName);

    List<Table> tables = new ArrayList<>();

    for (String table : selectedTables) {
      String columnQuery = constants.SCHEMA_INFO_SQL + table + "'";

      String[] selectedColsInTable = null;
      if (request.getParameterValues(table) != null) {
        selectedColsInTable = request.getParameterValues(table);
      } 
 
      try (ResultSet resultSet =
        dbClient.singleUse().executeQuery(Statement.of(columnQuery))) {
        ImmutableList<ColumnSchema> columnSchemas = initColumnSchemas(resultSet, selectedColsInTable);

        String whereStatement = getWhereStatement(columnSchemas, table, request);
        
        Table.Builder tableBuilder = Table.builder().setName(table);
        tableBuilder.setColumnSchemas(columnSchemas);
        Statement queryStatement = constructQueryStatement(columnSchemas, table, whereStatement);
        executeTableQuery(tableBuilder, queryStatement, columnSchemas);
        
        Table tableObject = tableBuilder.build();
        tables.add(tableObject);
      }
    }
    String json = new Gson().toJson(tables);
    response.getWriter().println(json);
  }

  //TODO: put this in QueryFactory class once merged
  //TODO: print out a message if there are no rows with this value
  private String getWhereStatement(List<ColumnSchema> columnSchemas, String table, HttpServletRequest request) {
    StringBuilder whereQuery = new StringBuilder("WHERE ");
    
    for (ColumnSchema colSchema : columnSchemas) {
      String colName = colSchema.columnName();
      String colType = colSchema.schemaType();
      String filterValue = request.getParameter(table + "-" + colName);
      if (filterValue != null && !filterValue.equals("")) {
        if (colType.equals("STRING")) {
          filterValue = "\"" + filterValue + "\"";
        }
        whereQuery.append(colName);
        whereQuery.append("=");
        whereQuery.append(filterValue);
        whereQuery.append(",");
      }
    }

    String whereQuerytoString = whereQuery.toString();
    if (whereQuerytoString.equals("WHERE ")) {
      return "";
    } else {
      return whereQuerytoString.substring(0, whereQuerytoString.length() - 1);
    }
  }

  private void checkTableHasColumns(List<ColumnSchema> columnSchemas) {
    // No columns -> throw error
    if (columnSchemas.size() == 0) {
      throw new RuntimeException(constants.EMPTY_TABLE_ERROR);
    }
  } 

  private ImmutableList<ColumnSchema> initColumnSchemas(ResultSet resultSet, String[] selectedColsInTable) {
    ImmutableList.Builder<ColumnSchema> colSchemaBuilder = new ImmutableList.Builder<>();
    
    List<String> selectedCols = new ArrayList<>();
    if (selectedColsInTable != null) 
      selectedCols = Arrays.asList(selectedColsInTable);
    while (resultSet.next()) {
      String colName = resultSet.getString(0);
      if (selectedCols.size() == 0 || selectedCols.contains(colName)) {
        colSchemaBuilder.add(createColumnSchema(resultSet));
      }
    }
    ImmutableList<ColumnSchema> columnSchemas = colSchemaBuilder.build();
    checkTableHasColumns(columnSchemas);
    return columnSchemas;
  }

  private ColumnSchema createColumnSchema(ResultSet resultSet) {
    String columnName = resultSet.getString(0);
    String schemaType = resultSet.getString(1);

    // Remove length in parens (i.e. STRING(MAX) --> STRING)
    int indexOfOpeningParen = schemaType.indexOf("(");
    if (indexOfOpeningParen >= 0) {
      schemaType = schemaType.substring(0, indexOfOpeningParen);
    }

    // Convert YES/NO String to true/false boolean
    String isNullableColumn = resultSet.getString(2);
    boolean isNullable = false;
    if (isNullableColumn.toLowerCase().equals("YES")) {
      isNullable = true;
    }
    return ColumnSchema.create(columnName, schemaType, isNullable);
  }

  // Construct SQL statement of form SELECT <columns list> FROM <table>
  private Statement constructQueryStatement(List<ColumnSchema> columnSchemas, String table, String where) {
    StringBuilder query = new StringBuilder("SELECT ");

    for (ColumnSchema columnSchema : columnSchemas) {
      query.append(columnSchema.columnName() + ", ");
    }
    query.deleteCharAt(query.length() - 1); //Get rid of extra space
    query.append(" FROM " + table); 
    query.append(" " + where);
    Statement statement = Statement.newBuilder(query.toString()).build();
    return statement;
  }

  private void initDatabaseClient(String databaseName) {
    this.dbClient = DatabaseConnector.getInstance().getDbClient(databaseName);
  }

   private void executeTableQuery(Table.Builder tableBuilder, Statement query, List<ColumnSchema> columnSchemas) throws IOException {
    try (ResultSet resultSet =
      dbClient
      .singleUse() 
      .executeQuery(query)) {
        
      int resultCount = 0;
      while (resultSet.next()) {
        resultCount++;
        ImmutableList.Builder<String> rowBuilder = new ImmutableList.Builder<String>();
        for (ColumnSchema columnSchema : columnSchemas) {
          String columnName = columnSchema.columnName();
 
          // If there is a null in this col here, print out NULL for now.
          if (resultSet.isNull(columnName)) {
            rowBuilder.add("NULL");
            continue;
          }

          String dataType = columnSchema.schemaType();
          addDataToRow(dataType, rowBuilder, columnName, resultSet);
        }

        ImmutableList<String> immutableRow = rowBuilder.build();
        tableBuilder.addRow(immutableRow);
      }

      // TODO: if no rows, find out a way to display this info on the screen
      if (resultCount == 0) {  
        System.out.println("No rows in table");
      }
    }
  }

  private void addDataToRow(String dataType, ImmutableList.Builder<String> rowBuilder, String columnName, ResultSet resultSet) {
    switch (dataType) {
      case "STRING":
        rowBuilder.add(resultSet.getString(columnName));
        break;
      case "BOOL":
        rowBuilder.add("" + resultSet.getBoolean(columnName));
        break;
      case "INT64":
        rowBuilder.add("" + resultSet.getLong(columnName));
        break;
      case "BYTES":
        String byteToString = bytesToString(resultSet.getBytes(columnName));
        rowBuilder.add(byteToString);
        break;
      case "TIMESTAMP":
        rowBuilder.add("" + resultSet.getTimestamp(columnName));
        break;
      case "DATE":
        rowBuilder.add("" + resultSet.getDate(columnName));
        break;
      case "ARRAY<INT64>":
        String arrayToString = longArrayToString(resultSet.getLongArray(columnName));
        rowBuilder.add(arrayToString);
        break;
      default:
        rowBuilder.add(constants.UNSUPPORT_ERROR);
    }
  }

  private String longArrayToString(long[] longArray) {
    return "[" + StringUtils.join(longArray, ',') + "]";
  }

  private String bytesToString(ByteArray bytes) {
    try {
      byte[] byteArray = bytes.toByteArray();
      return new String(byteArray, constants.ENCODING_TYPE);
    } catch (UnsupportedEncodingException e) {
      return constants.ENCODING_ERROR;
    }
  }
}