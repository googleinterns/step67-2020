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

    for (String table : selectedTables) {
      String colQuery = "SELECT column_name, spanner_type, is_nullable FROM information_schema.columns WHERE table_name = '" + table + "'";

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
        for (String colName : colnames) {
          query += (colName + ", ");
        }
        query = query.substring(0, query.length() - 2);
        query += " FROM " + table; 

        response.getWriter().println("Table: " + table);

        executeTableQuery(query, colnames, spannerTypes, response);
      }
    }
  }

  private void executeTableQuery(String query, List<String> colnames, List<String> spannerTypes, HttpServletResponse response) throws IOException {
    try (ResultSet rs =
      dbClient
      .singleUse() // Execute a single read or query against Cloud Spanner.
      .executeQuery(Statement.of(query))) {

      while (rs.next()) {
        String row = "";
        int index = 0;
        while (index < colnames.size()) {
          String colName = colnames.get(index);
          row += (" " + colName + ": ");

          // If there is a null in this col here, just print out NULL for now.
          if (rs.isNull(colName)) {
            index++;
            row += "NULL"; 
            continue;
          }

          // Figure out how to make more concise.
          switch (spannerTypes.get(index)) {
            case "STRING(MAX)":
              row += rs.getString(colName);
              break;
            case "STRING(250)":
              row += rs.getString(colName);
              break;
            case "STRING(1024)":
              row += rs.getString(colName);
              break;
            case "TIMESTAMP":
              row += rs.getTimestamp(colName);
              break;
            case "INT64":
              row += rs.getLong(colName);
              break;
            case "BYTES(MAX)":
              ByteArray bytes = rs.getBytes(colName);
              byte[] byteArray = bytes.toByteArray();
          
              for (byte b : byteArray) {
                row += b;
              }
              break;
            case "BYTES":
              row += rs.getBytes(colName);
              break;
            case "ARRAY<INT64>":
              row += "ARRAY HERE";
              break;
            case "DATE":
              row += "DATE HERE";
              break;
            case "BOOL":
              row += rs.getBoolean(colName);
          }
          index++;
        }
        response.getWriter().println(row); 
      }
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    selectedTables = request.getParameterValues("table-select");
    response.sendRedirect("/select-tables.html");
  }
}