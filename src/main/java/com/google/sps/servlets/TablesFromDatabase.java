
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

/** Servlet that returns HTML that contains tables in the example database. */
@WebServlet("/tables-from-db")
public class TablesFromDatabase extends HttpServlet {

  DatabaseClient dbClient;

  public void init() {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();

    //TODO: change "example-db" to the database that Millennia passes in from the db selection
    DatabaseId db = DatabaseId.of("play-user-data-beetle", "test-instance", "example-db"); //project id, args, args
    this.dbClient = spanner.getDatabaseClient(db);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");

    try (ResultSet resultSet =
        dbClient
            .singleUse() // Execute a single read or query against Cloud Spanner.
            .executeQuery(Statement.of("SELECT table_name FROM information_schema.tables WHERE table_catalog = '' and table_schema = ''"))) {
      List<String> tables = new ArrayList<>();
      while (resultSet.next()) {
        tables.add(resultSet.getString(0));
      }
      String json = new Gson().toJson(tables);
      response.getWriter().println(json);
    }
  }
}