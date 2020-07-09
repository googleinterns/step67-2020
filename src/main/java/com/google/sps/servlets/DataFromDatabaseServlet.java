package com.google.sps.servlets;

import com.google.cloud.ByteArray;
import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
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
 
        Table tableObject = new Table(table);
        String query = constructQueryString(schemas, tableObject, table);
        executeTableQuery(tableObject, query, schemas);
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

  private String constructQueryString(List<Schema> schemas, Table tableObject, String table) {
    StringBuilder query = new StringBuilder(constants.SELECT);
    for (Schema schema : schemas) {
      String columnName = schema.columnName();
      query.append(columnName + constants.COMMA);
      tableObject.addColumn(columnName);
    }
    query.deleteCharAt(query.length() - 1);
    query.append(constants.FROM + table); 
    return query.toString();
  }

  private void initializeDatabase(String databaseName) {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of(constants.PROJECT, constants.TEST_INSTANCE, databaseName);
    this.dbClient = spanner.getDatabaseClient(db);
  }

   private void executeTableQuery(Table tableObject, String query, List<Schema> schemas) throws IOException {
    try (ResultSet resultSet =
      dbClient
      .singleUse() 
      .executeQuery(Statement.of(query))) {
 
      while (resultSet.next()) {
        Row rowObject = new Row();
        for (Schema schema : schemas) {
          String columnName = schema.columnName();
 
          // If there is a null in this col here, just print out NULL for now.
          if (resultSet.isNull(columnName)) {
            rowObject.addData(columnName, constants.NULL);
            continue;
          }
 
          String dataType = schema.schemaType();
          addDataToRowObject(dataType, rowObject, columnName, resultSet);
        }
        tableObject.addRow(rowObject);
      }
    }
  }

  private void addDataToRowObject(String dataType, Row rowObject, String columnName, ResultSet resultSet) {
    System.out.println(dataType);
    switch (dataType) {
      case "STRING":
        rowObject.addData(columnName, resultSet.getString(columnName));
        break;
      case "BOOL":
        rowObject.addData(columnName, constants.EMPTY_STRING + resultSet.getBoolean(columnName));
      case "INT64":
        rowObject.addData(columnName, constants.EMPTY_STRING + resultSet.getLong(columnName));
        break;
      case "BYTES":
        String byteToString = bytesToString(resultSet.getBytes(columnName));
        rowObject.addData(columnName, byteToString);
        break;
      case "TIMESTAMP":
        rowObject.addData(columnName, constants.EMPTY_STRING + resultSet.getTimestamp(columnName));
        break;
      case "DATE":
        rowObject.addData(columnName, constants.EMPTY_STRING + resultSet.getDate(columnName));
        break;
      case "ARRAY<INT64>":
        String arrayToString = longArrayToString(resultSet.getLongArray(columnName));
        rowObject.addData(columnName, arrayToString);
        break;
      default:
        rowObject.addData(columnName, "This type is not currently supported.");
    }
  }

  private String longArrayToString(long[] longArray) {
    StringBuilder arrayToStringBuilder = new StringBuilder("[");
    for (long l : longArray) {
      arrayToStringBuilder.append(l + constants.COMMA);
    }

    arrayToStringBuilder.deleteCharAt(arrayToStringBuilder.length() - 1);
    arrayToStringBuilder.append("]");
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