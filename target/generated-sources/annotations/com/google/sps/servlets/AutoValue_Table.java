package com.google.sps.servlets;

import com.google.common.collect.ImmutableList;
import javax.annotation.Generated;

@Generated("com.google.auto.value.processor.AutoValueProcessor")
final class AutoValue_Table extends Table {

  private final String name;

  private final ImmutableList<ColumnSchema> columnSchemas;

  private final ImmutableList<ImmutableList<String>> dataTable;

  private AutoValue_Table(
      String name,
      ImmutableList<ColumnSchema> columnSchemas,
      ImmutableList<ImmutableList<String>> dataTable) {
    this.name = name;
    this.columnSchemas = columnSchemas;
    this.dataTable = dataTable;
  }

  @Override
  String name() {
    return name;
  }

  @Override
  ImmutableList<ColumnSchema> columnSchemas() {
    return columnSchemas;
  }

  @Override
  ImmutableList<ImmutableList<String>> dataTable() {
    return dataTable;
  }

  @Override
  public String toString() {
    return "Table{"
        + "name=" + name + ", "
        + "columnSchemas=" + columnSchemas + ", "
        + "dataTable=" + dataTable
        + "}";
  }

  @Override
  public boolean equals(Object o) {
    if (o == this) {
      return true;
    }
    if (o instanceof Table) {
      Table that = (Table) o;
      return this.name.equals(that.name())
          && this.columnSchemas.equals(that.columnSchemas())
          && this.dataTable.equals(that.dataTable());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int h$ = 1;
    h$ *= 1000003;
    h$ ^= name.hashCode();
    h$ *= 1000003;
    h$ ^= columnSchemas.hashCode();
    h$ *= 1000003;
    h$ ^= dataTable.hashCode();
    return h$;
  }

  static final class Builder extends Table.Builder {
    private String name;
    private ImmutableList<ColumnSchema> columnSchemas;
    private ImmutableList.Builder<ImmutableList<String>> dataTableBuilder$;
    private ImmutableList<ImmutableList<String>> dataTable;
    Builder() {
    }
    @Override
    Table.Builder setName(String name) {
      if (name == null) {
        throw new NullPointerException("Null name");
      }
      this.name = name;
      return this;
    }
    @Override
    Table.Builder setColumnSchemas(ImmutableList<ColumnSchema> columnSchemas) {
      if (columnSchemas == null) {
        throw new NullPointerException("Null columnSchemas");
      }
      this.columnSchemas = columnSchemas;
      return this;
    }
    @Override
    ImmutableList.Builder<ImmutableList<String>> dataTableBuilder() {
      if (dataTableBuilder$ == null) {
        dataTableBuilder$ = ImmutableList.builder();
      }
      return dataTableBuilder$;
    }
    @Override
    Table build() {
      if (dataTableBuilder$ != null) {
        this.dataTable = dataTableBuilder$.build();
      } else if (this.dataTable == null) {
        this.dataTable = ImmutableList.of();
      }
      String missing = "";
      if (this.name == null) {
        missing += " name";
      }
      if (this.columnSchemas == null) {
        missing += " columnSchemas";
      }
      if (!missing.isEmpty()) {
        throw new IllegalStateException("Missing required properties:" + missing);
      }
      return new AutoValue_Table(
          this.name,
          this.columnSchemas,
          this.dataTable);
    }
  }

}
