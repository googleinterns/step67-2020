package com.google.sps.servlets;

import javax.annotation.Generated;

@Generated("com.google.auto.value.processor.AutoValueProcessor")
final class AutoValue_ColumnSchema extends ColumnSchema {

  private final String columnName;

  private final String schemaType;

  private final boolean nullable;

  AutoValue_ColumnSchema(
      String columnName,
      String schemaType,
      boolean nullable) {
    if (columnName == null) {
      throw new NullPointerException("Null columnName");
    }
    this.columnName = columnName;
    if (schemaType == null) {
      throw new NullPointerException("Null schemaType");
    }
    this.schemaType = schemaType;
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
  boolean nullable() {
    return nullable;
  }

  @Override
  public String toString() {
    return "ColumnSchema{"
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
    if (o instanceof ColumnSchema) {
      ColumnSchema that = (ColumnSchema) o;
      return this.columnName.equals(that.columnName())
          && this.schemaType.equals(that.schemaType())
          && this.nullable == that.nullable();
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
    h$ ^= nullable ? 1231 : 1237;
    return h$;
  }

}
