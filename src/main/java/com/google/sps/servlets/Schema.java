package com.google.sps.servlets;

import com.google.auto.value.AutoValue;

@AutoValue
abstract class Schema {
  static Schema create(String columnName, String schemaType, boolean nullable) {
    return new AutoValue_Schema(columnName, schemaType, nullable);
  }

  //TODO (issue 12): add primary key boolean to the schema?
  abstract String columnName();
  abstract String schemaType();
  abstract boolean nullable();
}