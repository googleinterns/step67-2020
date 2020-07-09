
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
public class TablesFromDatabaseServlet extends HttpServlet {

  private static final String DATABASE_PARAM = "list-databases";
  private static final String EMPTY_STRING = "";
  private static final String GET_TABLE_SQL = "SELECT table_name FROM information_schema.tables WHERE table_catalog = '' and table_schema = ''";
  private static final String NULL_REDIRECT = "/index.html";
  private static final String PROJECT_NAME = "play-user-data-beetle";
  private static final String TEST_INSTANCE = "test-instance";
  private static final String TEXT_TYPE = "text/html;";
  DatabaseClient dbClient;
  String selectedDatabase;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType(TEXT_TYPE);

    if (request.getParameter(DATABASE_PARAM) != null) {
      selectedDatabase = request.getParameter(DATABASE_PARAM);
    }

    if (selectedDatabase == null || selectedDatabase.equals(EMPTY_STRING)) {
      response.sendRedirect(NULL_REDIRECT);
      return;
    }
 
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of(PROJECT_NAME, TEST_INSTANCE, selectedDatabase); 
    this.dbClient = spanner.getDatabaseClient(db);

    try (ResultSet resultSet =
        dbClient
            .singleUse() 
            .executeQuery(Statement.of(GET_TABLE_SQL))) {
      List<String> tables = new ArrayList<>();
      while (resultSet.next()) {
        tables.add(resultSet.getString(0));
      }
      String json = new Gson().toJson(tables);
      response.getWriter().println(json);
    }
  }

}