
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
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns HTML that contains tables in the example database. */
@WebServlet("/tables-from-db")
public class TablesFromDatabase extends HttpServlet {

  DatabaseClient dbClient;
  String selectedDatabase;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");

    if (request.getParameter("list-databases") != null) {
      selectedDatabase = request.getParameter("list-databases");
    }

    if (selectedDatabase == null || selectedDatabase.equals("")) {
      response.sendRedirect("/index.html");
      return;
    }
 
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of("play-user-data-beetle", "test-instance", selectedDatabase); 
    this.dbClient = spanner.getDatabaseClient(db);

    try (ResultSet resultSet =
        dbClient
            .singleUse() 
            .executeQuery(Statement.of("SELECT table_name FROM information_schema.tables WHERE table_catalog = '' and table_schema = ''"))) {
      List<String> tables = new ArrayList<>();
      while (resultSet.next()) {
        tables.add(resultSet.getString(0));
      }
      String json = new Gson().toJson(tables);
      response.getWriter().println(json);
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    if (request.getParameter("list-databases") != null)
      selectedDatabase = request.getParameter("list-databases");
    else
      System.out.println("is null");
    response.sendRedirect("/index.html");
  }
}