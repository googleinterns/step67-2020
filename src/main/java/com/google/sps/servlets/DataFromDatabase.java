package com.google.sps.servlets;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns HTML that contains content from the example database. */
@WebServlet("/CHANGETHISSS")
public class DataFromDatabase extends HttpServlet {

  DatabaseClient dbClient;

  public void init() {
    Spanner spanner = SpannerOptions.newBuilder().build().getService();
    DatabaseId db = DatabaseId.of("play-user-data-beetle", "test-instance", "example-db");
    this.dbClient = spanner.getDatabaseClient(db);
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");

    List<String> tablesToQuery = new ArrayList<>();
    //get the list of strings from some url

    try (ResultSet resultSet =
        dbClient
            .singleUse() // Execute a single read or query against Cloud Spanner.
            .executeQuery(Statement.of("SELECT SingerId, FirstName, LastName FROM Singers"))) {
      while (resultSet.next()) {
        response
            .getWriter()
            .println(
                String.format(
                    "<p>%d %s %s</p>",
                    resultSet.getLong(0),
                    resultSet.isNull(1) ? "" : resultSet.getString(1),
                    resultSet.isNull(2) ? "" : resultSet.getString(2)));
      }
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

  }
}