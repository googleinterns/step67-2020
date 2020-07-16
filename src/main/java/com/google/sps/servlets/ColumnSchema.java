package com.google.sps.servlets;

import com.google.auto.value.AutoValue;

@AutoValue
abstract class ColumnSchema {
  static ColumnSchema create(String columnName, String schemaType, boolean nullable) {
    return new AutoValue_ColumnSchema(columnName, schemaType, nullable);
  }

  abstract String columnName();
  abstract String schemaType();
  abstract boolean nullable();
}