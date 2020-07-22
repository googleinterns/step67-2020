
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
import static com.google.sps.servlets.Constants.DATABASE_PARAM;
import static com.google.sps.servlets.Constants.GET_TABLE_SQL;
import static com.google.sps.servlets.Constants.NULL_REDIRECT;
import static com.google.sps.servlets.Constants.TEXT_TYPE;

/** Servlet that returns HTML that contains tables in the example database. */
@WebServlet("/tables-from-db")
public class TablesFromDatabaseServlet extends HttpServlet {

  DatabaseClient dbClient;
  String selectedDatabase;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType(TEXT_TYPE);

    if (request.getParameter(DATABASE_PARAM) != null) {
      selectedDatabase = request.getParameter(DATABASE_PARAM);
    }

    if (selectedDatabase == null || selectedDatabase.equals("")) {
      response.sendRedirect(NULL_REDIRECT);
      return;
    }
    if (!DatabaseConnector.getInstance().databaseIsSupported(selectedDatabase)) {
      throw new RuntimeException(String.format("Database %s not supported", selectedDatabase));
    }
 
    this.dbClient = DatabaseConnector.getInstance().getDbClient(selectedDatabase);
    executeQuery(response);
  }

  private void executeQuery(HttpServletResponse response) throws IOException {
    try (ResultSet resultSet =
        dbClient
            .singleUse() 
            .executeQuery(Statement.of(GET_TABLE_SQL))) {
      List<String> tableNames = new ArrayList<>();
      while (resultSet.next()) {
        tableNames.add(resultSet.getString(0));
      }
      String json = new Gson().toJson(tableNames);
      response.getWriter().println(json);
    }
  }
}