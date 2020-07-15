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

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType(constants.TEXT_TYPE);
    selectedTables = request.getParameterValues(constants.TABLE_SELECT_PARAM);
    String databaseName = request.getParameter(constants.DATABASE_PARAM);
    initDatabaseClient(databaseName);

    List<Table> tables = new ArrayList<>();

    for (String table : selectedTables) {
      String columnQuery = constants.SCHEMA_INFO_SQL + table + "'";
 
      try (ResultSet resultSet =
        dbClient.singleUse().executeQuery(Statement.of(columnQuery))) {
          
        ImmutableList<ColumnSchema> columnSchemas = initColumnSchemas(resultSet);
        
        Table.Builder tableBuilder = Table.builder().setName(table);
        tableBuilder.setColumnSchemas(columnSchemas);
        Statement queryStatement = constructQueryStatement(columnSchemas, table);
        executeTableQuery(tableBuilder, queryStatement, columnSchemas);
        
        Table tableObject = tableBuilder.build();
        tables.add(tableObject);
      }
    }
    String json = new Gson().toJson(tables);
    response.getWriter().println(json);
  }

  private void checkTableHasColumns(ImmutableList<ColumnSchema> columnSchemas) {
    // No columns -> throw error
    if (columnSchemas.size() == 0) {
      throw new RuntimeException(constants.EMPTY_TABLE_ERROR);
    }
  } 

  private ImmutableList<ColumnSchema> initColumnSchemas(ResultSet resultSet) {
    ImmutableList.Builder<ColumnSchema> colSchemaBuilder = new ImmutableList.Builder<>();
    while (resultSet.next()) {
      colSchemaBuilder.add(createColumnSchema(resultSet));
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
  private Statement constructQueryStatement(List<ColumnSchema> columnSchemas, String table) {
    StringBuilder query = new StringBuilder("SELECT ");

    for (ColumnSchema columnSchema : columnSchemas) {
      query.append(columnSchema.columnName() + ", ");
    }
    query.deleteCharAt(query.length() - 1); //Get rid of extra space
    query.append(" FROM " + table); 
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
        
      while (resultSet.next()) {
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