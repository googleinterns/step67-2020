package com.google.sps.servlets;
 
import java.util.ArrayList;
import java.util.List;

public class Table {
  private String name;
  private List<String> columns = new ArrayList<String>();
  private List<Row> rows = new ArrayList<Row>();
 
  public Table(String name) {
    this.name = name;
  }
 
  public void addColumn(String colName) {
    columns.add(colName);
  }
 
  public List<String> getColumns() {
    return new ArrayList<>(columns);
  }
 
  public void addRow(Row row) {
    rows.add(row);
  }
}
