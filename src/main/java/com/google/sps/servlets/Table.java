package com.google.sps.servlets;
 
import java.util.ArrayList;
import java.util.List;

public class Table {
  private String name;
  private List<String> columns = new ArrayList<String>();
  private List<List<String>> rows = new ArrayList<List<String>>();
 
  public Table(String name) {
    this.name = name;
  }
 
  public void addColumn(String colName) {
    columns.add(colName);
  }
 
  public List<String> getColumns() {
    return new ArrayList<>(columns);
  }
 
  public void addRow(List<String> row) {
    rows.add(row);
  }
}
