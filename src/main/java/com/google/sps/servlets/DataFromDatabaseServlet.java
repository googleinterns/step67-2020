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
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
        List<Schema> schemas = new ArrayList<>();
        while (resultSet.next()) {
          schemas.add(createSchema(resultSet));
        }
 
        // No columns -> throw error
        if (schemas.size() == 0) {
          throw new RuntimeException("Table is empty.");
        }
 
        //Table tableObject = new Table(table);
        Table.Builder tableBuilder = Table.builder().setName(table);

        List<String> columnNames = new ArrayList<>();
        Statement queryStatement = constructQueryStatement(schemas, columnNames, table);
        tableBuilder.setColumns(columnNames);

        executeTableQuery(tableBuilder, queryStatement, schemas);
        
        Table tableObject = tableBuilder.build();
        tables.add(tableObject);
      }
    }
    String json = new Gson().toJson(tables);
    response.getWriter().println(json);
  }

  private Schema createSchema(ResultSet resultSet) {
    String columnName = resultSet.getString(0);
    String schemaType = resultSet.getString(1);
    int indexOfOpeningParen = schemaType.indexOf("(");
    if (indexOfOpeningParen >= 0) {
      schemaType = schemaType.substring(0, indexOfOpeningParen);
    }
    String nullable = resultSet.getString(2);
    return Schema.create(columnName, schemaType, nullable);
  }

  private Statement constructQueryStatement(List<Schema> schemas, List<String> columnNames, String table) {
    StringBuilder query = new StringBuilder(constants.SELECT);
    for (Schema schema : schemas) {
      String columnName = schema.columnName();
      query.append(columnName + constants.COMMA);
      columnNames.add(columnName);
    }
    query.deleteCharAt(query.length() - 1);
    query.append(constants.FROM + table); 
    Statement statement = Statement.newBuilder(query.toString()).build();
    return statement;
  }

  private void initializeDatabase(String databaseName) {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of(constants.PROJECT, constants.TEST_INSTANCE, databaseName);
    this.dbClient = spanner.getDatabaseClient(db);
  }

   private void executeTableQuery(Table.Builder tableBuilder, Statement query, List<Schema> schemas) throws IOException {
    try (ResultSet resultSet =
      dbClient
      .singleUse() 
      .executeQuery(query)) {
 
      while (resultSet.next()) {
        List<String> row = new ArrayList<>();
        for (Schema schema : schemas) {
          String columnName = schema.columnName();
 
          // If there is a null in this col here, just print out NULL for now.
          if (resultSet.isNull(columnName)) {
            row.add(constants.NULL);
            continue;
          }
 
          String dataType = schema.schemaType();
          System.out.println(dataType);
          addDataToRow(dataType, row, columnName, resultSet);
        }

        ImmutableList<String> immutableRow = ImmutableList.copyOf(row);
        tableBuilder.addRow(immutableRow);
      }
    }
  }

  private void addDataToRow(String dataType, List<String> row, String columnName, ResultSet resultSet) {
    switch (dataType) {
      case "STRING":
        row.add(resultSet.getString(columnName));
        break;
      case "BOOL":
        row.add(constants.EMPTY_STRING + resultSet.getBoolean(columnName));
        break;
      case "INT64":
        row.add(constants.EMPTY_STRING + resultSet.getLong(columnName));
        break;
      case "BYTES":
        String byteToString = bytesToString(resultSet.getBytes(columnName));
        row.add(byteToString);
        break;
      case "TIMESTAMP":
        row.add(constants.EMPTY_STRING + resultSet.getTimestamp(columnName));
        break;
      case "DATE":
        row.add(constants.EMPTY_STRING + resultSet.getDate(columnName));
        break;
      case "ARRAY<INT64>":
        String arrayToString = longArrayToString(resultSet.getLongArray(columnName));
        row.add(arrayToString);
        break;
      default:
        row.add(constants.UNSUPPORT_ERROR);
    }
  }

  private String longArrayToString(long[] longArray) {
    StringBuilder arrayToStringBuilder = new StringBuilder(constants.OPEN_BRACKET);
    for (long l : longArray) {
      arrayToStringBuilder.append(l + constants.COMMA);
    }

    arrayToStringBuilder.deleteCharAt(arrayToStringBuilder.length() - 1);
    arrayToStringBuilder.append(constants.CLOSE_BRACKET);
    return arrayToStringBuilder.toString();
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