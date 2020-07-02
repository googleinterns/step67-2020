package com.google.sps.servlets;

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

/** Servlet that returns HTML that contains content from the example database. */
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

    if (selectedTables == null) {
      throw new RuntimeException("Selected tables is null");
    }

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

        try (ResultSet rs =
          dbClient
          .singleUse() // Execute a single read or query against Cloud Spanner.
          .executeQuery(Statement.of(query))) {

          while (rs.next()) {
            String row = "";
            int index = 0;
            while (index < colnames.size()) {
              String colName = colnames.get(index);
              System.out.println(colName + " " + spannerTypes.get(index));
              row += (" " + colName + ": ");

              //TODO: make sure to check for nulls, split up into different methods
              switch (spannerTypes.get(index)) {
                case "STRING(MAX)":
                  if (rs.getString(colName) != null) {
                    row += rs.getString(colName);
                  } else {
                    row += "NULL";
                  }
                  break;
                case "STRING(250)":
                  if (rs.getString(colName) != null) {
                    row += rs.getString(colName);
                  } else {
                    row += "NULL";
                  }
                  break;
                case "STRING(1024)":
                  if (rs.getString(colName) != null) {
                    row += rs.getString(colName);
                  } else {
                    row += "NULL";
                  }
                  break;
                case "TIMESTAMP":
                 if (rs.getTimestamp(colName) != null) {
                    row += rs.getTimestamp(colName);
                  } else {
                    row += "NULL";
                  }
                  break;
                case "INT64":
                  if (rs.getLong(colName) != null) {
                    row += rs.getLong(colName);
                  } else {
                    row += "NULL";
                  }
                  row += rs.getLong(colName);
                  break;
                case "BYTES(MAX)":
                  if (rs.getBytes(colName) != null) {
                    row += rs.getBytes(colName);
                  } else {
                    row += "NULL";
                  }
                  break;
                case "BYTES":
                  if (rs.getBytes(colName) != null) {
                    row += rs.getBytes(colName);
                  } else {
                    row += "NULL";
                  }
                  break;
                case "ARRAY<INT64>":
                  row += "ARRAY HERE";
                  break;
                case "DATE":
                  row += "DATE HERE";
                  break;
                case "BOOL":
                  if (rs.getBoolean(colName) != null) {
                    row += rs.getBoolean(colName);
                  } else {
                    row += "NULL";
                  }

              }
              index++;
            }
            System.out.println(row);
            response.getWriter().println(row); 
          }
          response.getWriter().println("Done printing this table.");
        }
      }
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    selectedTables = request.getParameterValues("table-select");
    for (String table : selectedTables) {
      System.out.println("Selected table = " + table);
    }

    response.sendRedirect("/select-tables.html");
  }
}