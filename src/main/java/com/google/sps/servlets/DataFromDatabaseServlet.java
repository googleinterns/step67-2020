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
    selectedTables = request.getParameterValues(constants.TABLE_SELECT_PARAM);
    String databaseName = request.getParameter(constants.DATABASE_PARAM);
    initializeDatabase(databaseName);

    response.setContentType(constants.TEXT_TYPE);
    List<Table> tables = new ArrayList<>();

    for (String table : selectedTables) {
      String columnQuery = constants.SCHEMA_INFO_SQL + table + constants.ENDING_APOSTROPHE;
 
      try (ResultSet resultSet =
        dbClient.singleUse().executeQuery(Statement.of(columnQuery))) {
        List<ColumnSchema> columnSchemas = new ArrayList<>();
        while (resultSet.next()) {
          columnSchemas.add(createColumnSchema(resultSet));
        }
 
        // No columns -> throw error
        if (columnSchemas.size() == 0) {
          throw new RuntimeException(constants.EMPTY_TABLE_ERROR);
        }
 
        Table.Builder tableBuilder = Table.builder().setName(table);

        Statement queryStatement = constructQueryStatement(columnSchemas, table);
        executeTableQuery(tableBuilder, queryStatement, columnSchemas);
        
        tableBuilder.setColumns(createColumnNamesList(columnSchemas));
        Table tableObject = tableBuilder.build();
        tables.add(tableObject);
      }
    }
    String json = new Gson().toJson(tables);
    response.getWriter().println(json);
  }

  //TODO (issue 15): get rid of the list of columns for table, because it's already in the ColumnSchema
  private ImmutableList<String> createColumnNamesList(List<ColumnSchema> columnSchemas) {
    ImmutableList.Builder<String> columnNamesBuilder = new ImmutableList.Builder<String>();
    for (ColumnSchema colSchema : columnSchemas) {
      columnNamesBuilder.add(colSchema.columnName());
    }
    return columnNamesBuilder.build();
  }

  private ColumnSchema createColumnSchema(ResultSet resultSet) {
    String columnName = resultSet.getString(0);
    String schemaType = resultSet.getString(1);

    // Remove length in parens (i.e. STRING(MAX) --> STRING)
    int indexOfOpeningParen = schemaType.indexOf("(");
    if (indexOfOpeningParen >= 0) {
      schemaType = schemaType.substring(0, indexOfOpeningParen);
    }
    String isNullableColumn = resultSet.getString(2);
    boolean isNullable = false;
    if (isNullableColumn.toLowerCase().equals("YES")) {
      isNullable = true;
    }
    return ColumnSchema.create(columnName, schemaType, isNullable);
  }

  private Statement constructQueryStatement(List<ColumnSchema> columnSchemas, String table) {
    StringBuilder query = new StringBuilder(constants.SELECT);

    for (ColumnSchema columnSchema : columnSchemas) {
      String columnName = columnSchema.columnName();
      query.append(columnName + constants.COMMA);
    }
    query.deleteCharAt(query.length() - 1);
    query.append(constants.FROM + table); 
    Statement statement = Statement.newBuilder(query.toString()).build();
    return statement;
  }

  //TODO (issue 15): will get rid of this through DatabaseConnector class
  private void initializeDatabase(String databaseName) {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of(constants.PROJECT, constants.TEST_INSTANCE, databaseName);
    this.dbClient = spanner.getDatabaseClient(db);
  }

   private void executeTableQuery(Table.Builder tableBuilder, Statement query, List<ColumnSchema> columnSchemas) throws IOException {
    try (ResultSet resultSet =
      dbClient
      .singleUse() 
      .executeQuery(query)) {
 
      while (resultSet.next()) {
        ImmutableList.Builder<String> rowBuilder = new ImmutableList.Builder<String>();
        for (ColumnSchema schema : columnSchemas) {
          String columnName = schema.columnName();
 
          // If there is a null in this col here, just print out NULL for now.
          if (resultSet.isNull(columnName)) {
            rowBuilder.add(constants.NULL);
            continue;
          }
 
          String dataType = schema.schemaType();
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
        rowBuilder.add(constants.EMPTY_STRING + resultSet.getBoolean(columnName));
        break;
      case "INT64":
        rowBuilder.add(constants.EMPTY_STRING + resultSet.getLong(columnName));
        break;
      case "BYTES":
        String byteToString = bytesToString(resultSet.getBytes(columnName));
        rowBuilder.add(byteToString);
        break;
      case "TIMESTAMP":
        rowBuilder.add(constants.EMPTY_STRING + resultSet.getTimestamp(columnName));
        break;
      case "DATE":
        rowBuilder.add(constants.EMPTY_STRING + resultSet.getDate(columnName));
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