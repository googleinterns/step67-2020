package com.google.sps.servlets;

import javax.annotation.Generated;

@Generated("com.google.auto.value.processor.AutoValueProcessor")
final class AutoValue_Schema extends Schema {

  private final String columnName;

  private final String schemaType;

  private final String nullable;

  AutoValue_Schema(
      String columnName,
      String schemaType,
      String nullable) {
    if (columnName == null) {
      throw new NullPointerException("Null columnName");
    }
    this.columnName = columnName;
    if (schemaType == null) {
      throw new NullPointerException("Null schemaType");
    }
    this.schemaType = schemaType;
    if (nullable == null) {
      throw new NullPointerException("Null nullable");
    }
    this.nullable = nullable;
  }

  @Override
  String columnName() {
    return columnName;
  }

  @Override
  String schemaType() {
    return schemaType;
  }

  @Override
  String nullable() {
    return nullable;
  }

  @Override
  public String toString() {
    return "Schema{"
        + "columnName=" + columnName + ", "
        + "schemaType=" + schemaType + ", "
        + "nullable=" + nullable
        + "}";
  }

  @Override
  public boolean equals(Object o) {
    if (o == this) {
      return true;
    }
    if (o instanceof Schema) {
      Schema that = (Schema) o;
      return this.columnName.equals(that.columnName())
          && this.schemaType.equals(that.schemaType())
          && this.nullable.equals(that.nullable());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int h$ = 1;
    h$ *= 1000003;
    h$ ^= columnName.hashCode();
    h$ *= 1000003;
    h$ ^= schemaType.hashCode();
    h$ *= 1000003;
    h$ ^= nullable.hashCode();
    return h$;
  }

}
