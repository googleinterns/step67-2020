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
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/data-from-db")
public class DataFromDatabase extends HttpServlet {

  DatabaseClient dbClient;
  private String[] selectedTables;

  public void init() {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of("play-user-data-beetle", "test-instance", "example-db");
    this.dbClient = spanner.getDatabaseClient(db);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    List<Table> tables = new ArrayList<>();

    for (String table : selectedTables) {
      String colQuery = "SELECT column_name, spanner_type, is_nullable FROM information_schema.columns WHERE table_name = '" + table + "'";
      Table tableObject = new Table(table);

      try (ResultSet resultSet =
        dbClient.singleUse().executeQuery(Statement.of(colQuery))) {

        List<String> colnames = new ArrayList<>();
        List<String> spannerTypes = new ArrayList<>();
        List<String> nullables = new ArrayList<>();

        while (resultSet.next()) {
          colnames.add(resultSet.getString(0));
          spannerTypes.add(resultSet.getString(1));
          nullables.add(resultSet.getString(2));
        }

        String query = "SELECT ";
        String columnNamesString = "Columns: ";
        for (String colName : colnames) {
          query += (colName + ", ");
          columnNamesString += (colName + ", ");
          tableObject.addColumn(colName);
        }
        query = query.substring(0, query.length() - 2);
        query += " FROM " + table; 

        executeTableQuery(tableObject, query, colnames, spannerTypes, response);
        tables.add(tableObject);
      }
    }
    String json = new Gson().toJson(tables);
    response.getWriter().println(json);
  }

  private void executeTableQuery(Table tableObject, String query, List<String> colnames, List<String> spannerTypes, HttpServletResponse response) throws IOException {
    try (ResultSet rs =
      dbClient
      .singleUse() // Execute a single read or query against Cloud Spanner.
      .executeQuery(Statement.of(query))) {

      while (rs.next()) {
        Row rowObject = new Row();
        int index = 0;
        while (index < colnames.size()) {
          String colName = colnames.get(index);

          // If there is a null in this col here, just print out NULL for now.
          if (rs.isNull(colName)) {
            index++;
            rowObject.addData(colName, "NULL");
            continue;
          }

          // Figure out how to make more concise.
          switch (spannerTypes.get(index)) {
            case "STRING(MAX)":
            case "STRING(250)":
            case "STRING(1024)":
              rowObject.addData(colName, rs.getString(colName));
              break;
            case "TIMESTAMP":
              rowObject.addData(colName, "" + rs.getTimestamp(colName));
              break;
            case "INT64":
              rowObject.addData(colName, "" + rs.getLong(colName));
              break;
            case "BYTES(MAX)":
            case "BYTES":
              ByteArray bytes = rs.getBytes(colName);
              byte[] byteArray = bytes.toByteArray();
              String byteToString = "";
              for (byte b : byteArray) {
                byteToString += b;
              }
              rowObject.addData(colName, byteToString);
              break;
            case "ARRAY<INT64>":
              long[] longArray = rs.getLongArray(colName);
              String arrayToString = "";
              for (long l : longArray) {
                arrayToString += l + " ";
              }
              rowObject.addData(colName, "ARRAY HERE");
              break;
            case "DATE":
              rowObject.addData(colName, "DATE HERE");
              break;
            case "BOOL":
              rowObject.addData(colName, "" + rs.getBoolean(colName));
          }
          index++;
        }
        tableObject.addRow(rowObject);
      }
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    selectedTables = request.getParameterValues("table-select");
    response.sendRedirect("/select-tables.html");
  }
}