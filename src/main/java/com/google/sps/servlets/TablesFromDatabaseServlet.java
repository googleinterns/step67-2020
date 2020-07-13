
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

  DatabaseClient dbClient;
  String selectedDatabase;
  private Constants constants = new Constants();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType(constants.TEXT_TYPE);

    if (request.getParameter(constants.DATABASE_PARAM) != null) {
      selectedDatabase = request.getParameter(constants.DATABASE_PARAM);
    }

    if (selectedDatabase == null || selectedDatabase.equals(constants.EMPTY_STRING)) {
      response.sendRedirect(constants.NULL_REDIRECT);
      return;
    }
    if (!DatabaseConnector.getInstance().databaseIsSupported(selectedDatabase)) {
      throw new RuntimeException("Database " + selectedDatabase + " not supported");
    }
 
    this.dbClient = DatabaseConnector.getInstance().getDbClient(selectedDatabase);
    executeQuery(response);
  }

  private void executeQuery(HttpServletResponse response) throws IOException {
    try (ResultSet resultSet =
        dbClient
            .singleUse() 
            .executeQuery(Statement.of(constants.GET_TABLE_SQL))) {
      List<String> tables = new ArrayList<>();
      while (resultSet.next()) {
        tables.add(resultSet.getString(0));
      }
      String json = new Gson().toJson(tables);
      response.getWriter().println(json);
    }
  }
}