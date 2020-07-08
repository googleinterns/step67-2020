package com.google.sps.servlets;

import com.google.auto.value.AutoValue;

@AutoValue
abstract class Schema {
  static Schema create(String columnName, String schemaType, String nullable) {
    return new AutoValue_Schema(columnName, schemaType, nullable);
  }

  abstract String columnName();
  abstract String schemaType();
  abstract String nullable();
}
