package com.google.sps.servlets;

import java.util.HashMap;
import java.util.Map;

public class Row {
  private Map<String, String> row = new HashMap<>(); //Map of col name to data inside col

  public void addData(String colName, String data) {
    row.putIfAbsent(colName, data);
  }

  public Map<String, String> getRow() {
    return new HashMap<>(row);
  }
}