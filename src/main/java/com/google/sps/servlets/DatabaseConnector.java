package com.google.sps.servlets;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/* Initialize all database clients */ 
public class DatabaseConnector {

  private static final DatabaseConnector instance = new DatabaseConnector();
  private Map<String, DatabaseClient> databaseNameToClient;
  private List<String> databaseNames;

  private DatabaseConnector() { 
    initDatabaseNames();
    initClients();
  }

  public static DatabaseConnector getInstance() {
    return instance;
  }

  public DatabaseClient getDatabaseClient(String databaseName) {
    if (!databaseNameToClient.containsKey(databaseName)) {
      throw new RuntimeException("Database not in list");
    }
    return databaseNameToClient.get(databaseName);
  }

  private void initClients() {
    databaseNameToClient = new HashMap<>();

    for (String databaseName : databaseNames) {
      Spanner spanner = SpannerOptions.newBuilder().build().getService();
      DatabaseId db = DatabaseId.of(constants.PROJECT, constants.TEST_INSTANCE, databaseName);
      DatabaseClient dbClient = spanner.getDatabaseClient(db);
      databaseNameToClient.put(databaseName, dbClient);
    }
  }

  private void initDatabaseNames() {
    databaseNames = new ArrayList<>();
    databaseNames.add("example-db");
    databaseNames.add("example-db-2");
    databaseNames.add("example-db-3");
    databaseNames.add("example-db-4");
  }
  
}