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

  private static final String COMMA = ", ";
  private static final String DATABASE_PARAM = "list-databases";
  private static final String EMPTY_STRING = "";
  private static final String ENCODING_TYPE = "UTF8";
  private static final String ENDING_APOSTROPHE = "'";
  private static final String FROM = " FROM ";
  private static final String NULL = "NULL";
  private static final String PROJECT = "play-user-data-beetle";
  private static final String SCHEMA_INFO_SQL = "SELECT column_name, spanner_type, is_nullable FROM information_schema.columns WHERE table_name = '";
  private static final String SELECT = "SELECT ";
  private static final String TABLE_SELECT_PARAM = "table-select";
  private static final String TEST_INSTANCE = "test-instance";
  private static final String TEXT_TYPE = "text/html;";

  DatabaseClient dbClient;
  private String[] selectedTables;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    selectedTables = request.getParameterValues(TABLE_SELECT_PARAM);
    String databaseName = request.getParameter(DATABASE_PARAM);
    initializeDatabase(databaseName);

    response.setContentType(TEXT_TYPE);
    List<Table> tables = new ArrayList<>();

     for (String table : selectedTables) {
      String columnQuery = SCHEMA_INFO_SQL + table + ENDING_APOSTROPHE;
 
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
    String nullable = resultSet.getString(2);
    return Schema.create(columnName, schemaType, nullable);
  }

  private String constructQueryString(List<Schema> schemas, Table tableObject, String table) {
    String query = SELECT;
    for (Schema schema : schemas) {
      String columnName = schema.columnName();
      query += (columnName + COMMA);
      tableObject.addColumn(columnName);
    }
    query = query.substring(0, query.length() - 2);
    query += FROM + table; 
    return query;
  }

  private void initializeDatabase(String databaseName) {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of(PROJECT, TEST_INSTANCE, databaseName);
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
            rowObject.addData(columnName, NULL);
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
    switch (dataType) {
      case "STRING(MAX)":
      case "STRING(250)":
      case "STRING(1024)":
        rowObject.addData(columnName, resultSet.getString(columnName));
        break;
      case "TIMESTAMP":
        rowObject.addData(columnName, EMPTY_STRING + resultSet.getTimestamp(columnName));
        break;
      case "INT64":
        rowObject.addData(columnName, EMPTY_STRING + resultSet.getLong(columnName));
        break;
      case "BYTES(MAX)":
      case "BYTES":
        String byteToString = bytesToString(resultSet.getBytes(columnName));
        rowObject.addData(columnName, byteToString);
        break;
      case "ARRAY<INT64>":
        String arrayToString = longArrayToString(resultSet.getLongArray(columnName));
        rowObject.addData(columnName, arrayToString);
        break;
      case "DATE":
        rowObject.addData(columnName, EMPTY_STRING + resultSet.getDate(columnName));
        break;
      case "BOOL":
        rowObject.addData(columnName, EMPTY_STRING + resultSet.getBoolean(columnName));
    }
  }

  private String longArrayToString(long[] longArray) {
    String arrayToString = "[";
    for (long l : longArray) {
      arrayToString += l + COMMA;
    }
    arrayToString = arrayToString.substring(0, arrayToString.length() - 2);
    arrayToString += "]";
    return arrayToString;
  }

  private String bytesToString(ByteArray bytes) {
    try {
      byte[] byteArray = bytes.toByteArray();
      return new String(byteArray, ENCODING_TYPE);
    } catch (UnsupportedEncodingException e) {
      return "Unable to encode";
    }
  }

}