package com.google.sps.servlets;
 
import com.google.auto.value.AutoValue;
import com.google.common.collect.ImmutableList;
import java.util.ArrayList;
import java.util.List;

@AutoValue
abstract class Table {
  abstract String name();
  abstract List<String> schemas();
  abstract ImmutableList<String> columns();
  abstract ImmutableList<ImmutableList<String>> dataTable();

  static Builder builder() {
    return new AutoValue_Table.Builder();
  }

  @AutoValue.Builder
  abstract static class Builder {
    abstract Builder setName(String name);
    abstract Builder setSchemas(List<String> schemas);
    abstract Builder setColumns(ImmutableList<String> columns);
    abstract ImmutableList.Builder<ImmutableList<String>> dataTableBuilder();

    public Builder addRow(ImmutableList<String> row) {
      dataTableBuilder().add(row);
      return this;
    }

    abstract Table build();
  }
}
