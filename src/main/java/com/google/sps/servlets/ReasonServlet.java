package com.google.sps.servlets;

import static com.google.cloud.spanner.TransactionRunner.TransactionCallable;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ReadOnlyTransaction;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import com.google.cloud.spanner.TransactionContext;
import com.google.gson.Gson;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that writes Audit to database*/
@WebServlet("/reason")
public final class ReasonServlet extends HttpServlet {

  DatabaseClient dbClient;
  String queryString;
  String selectedDatabase;
  private Constants constants = new Constants();

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType(constants.TEXT_TYPE);
    String reason = request.getParameter("reason");
    String account = request.getParameter("account");
    String query = request.getParameter("query");
    queryString = request.getParameter("queryString");
    selectedDatabase = "example-db";
    this.dbClient = DatabaseConnector.getInstance().getDbClient(selectedDatabase);
    insertUsingDml(reason,account,query,response);
  }

  private void insertUsingDml(String reason, String account, String query, HttpServletResponse response) {
    Instant timestamp = Instant.now();
    String timeString = timestamp.toString();
    dbClient
    .readWriteTransaction()
    .run(
        new TransactionCallable<Void>() {
            @Override
            public Void run(TransactionContext transaction) throws Exception {
              String sql =
                  "INSERT INTO AuditLog (Account, Query, Reason, Timestamp) "
                      + String.format(" VALUES ('%s', '%s', '%s', '%s')",account,query,reason,timeString);
              long rowCount = transaction.executeUpdate(Statement.of(sql));
              response.sendRedirect("/main-page.html" + queryString);
              return null;
            }
        });
  }

  private String getParameter(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if (value == null) {
      return defaultValue;
    }
    return value;
  } 
}