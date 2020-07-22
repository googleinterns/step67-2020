package com.google.sps.servlets;

import com.google.auto.value.AutoValue;
import com.google.cloud.ByteArray;
import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import com.google.common.collect.ImmutableList;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import static com.google.sps.servlets.Constants.DATABASE_PARAM;
import static com.google.sps.servlets.Constants.EMPTY_TABLE_ERROR;
import static com.google.sps.servlets.Constants.ENCODING_ERROR;
import static com.google.sps.servlets.Constants.ENCODING_TYPE;
import static com.google.sps.servlets.Constants.TABLE_SELECT_PARAM;
import static com.google.sps.servlets.Constants.TEXT_TYPE;
import static com.google.sps.servlets.Constants.UNSUPPORT_ERROR;

@WebServlet("/data-from-db")
public class DataFromDatabaseServlet extends HttpServlet {

  DatabaseClient dbClient;
  private String[] selectedTables;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType(TEXT_TYPE);
    selectedTables = request.getParameterValues(TABLE_SELECT_PARAM);
    String databaseName = request.getParameter(DATABASE_PARAM);
    initDatabaseClient(databaseName);

    List<Table> tables = new ArrayList<>();

    for (String table : selectedTables) {
      Statement columnQuery = QueryFactory.getInstance().buildSchemaQuery(table);
 
      try (ResultSet resultSet =
        dbClient.singleUse().executeQuery(columnQuery)) {
        ImmutableList<ColumnSchema> columnSchemas = initColumnSchemas(resultSet);
        
        Table.Builder tableBuilder = Table.builder().setName(table);
        tableBuilder.setColumnSchemas(columnSchemas);
        Statement queryStatement = QueryFactory.getInstance().constructQueryStatement(columnSchemas, table);
        System.out.println(queryStatement.toString());
        tableBuilder.setSql(queryStatement.toString());
        
        executeTableQuery(tableBuilder, queryStatement, columnSchemas);
        
        Table tableObject = tableBuilder.build();
        tables.add(tableObject);
      }
    }
    String json = new Gson().toJson(tables);
    response.getWriter().println(json);
  }

  private void checkTableHasColumns(List<ColumnSchema> columnSchemas) {
    // No columns -> throw error
    if (columnSchemas.size() == 0) {
      throw new RuntimeException(EMPTY_TABLE_ERROR);
    }
  } 

  private ImmutableList<ColumnSchema> initColumnSchemas(ResultSet resultSet) {
    ImmutableList.Builder<ColumnSchema> colSchemaBuilder = new ImmutableList.Builder<>();
    while (resultSet.next()) {
      colSchemaBuilder.add(createColumnSchema(resultSet));
    }
    ImmutableList<ColumnSchema> columnSchemas = colSchemaBuilder.build();
    checkTableHasColumns(columnSchemas);
    return columnSchemas;
  }

  private ColumnSchema createColumnSchema(ResultSet resultSet) {
    String columnName = resultSet.getString(0);
    String schemaType = resultSet.getString(1);

    // Remove length in parens (i.e. STRING(MAX) --> STRING)
    int indexOfOpeningParen = schemaType.indexOf("(");
    if (indexOfOpeningParen >= 0) {
      schemaType = schemaType.substring(0, indexOfOpeningParen);
    }

    // Convert YES/NO String to true/false boolean
    String isNullableColumn = resultSet.getString(2);
    boolean isNullable = false;
    if (isNullableColumn.toLowerCase().equals("YES")) {
      isNullable = true;
    }
    return ColumnSchema.create(columnName, schemaType, isNullable);
  }

  private void initDatabaseClient(String databaseName) {
    this.dbClient = DatabaseConnector.getInstance().getDbClient(databaseName);
  }

   private void executeTableQuery(Table.Builder tableBuilder, Statement query, List<ColumnSchema> columnSchemas) throws IOException {
    try (ResultSet resultSet =
      dbClient
      .singleUse() 
      .executeQuery(query)) {
        
      while (resultSet.next()) {
        ImmutableList.Builder<String> rowBuilder = new ImmutableList.Builder<String>();
        for (ColumnSchema columnSchema : columnSchemas) {
          String columnName = columnSchema.columnName();

          // If there is a null in this col here, print out NULL for now.
          if (resultSet.isNull(columnName)) {
            rowBuilder.add("NULL");
            continue;
          }

          String dataType = columnSchema.schemaType();
          addDataToRow(dataType, rowBuilder, columnName, resultSet);
        }

        ImmutableList<String> immutableRow = rowBuilder.build();
        tableBuilder.addRow(immutableRow);
      }
    }
  }

  private void addDataToRow(String dataType, ImmutableList.Builder<String> rowBuilder, String columnName, ResultSet resultSet) {
    switch (dataType) {
      case "STRING":
        rowBuilder.add(resultSet.getString(columnName));
        break;
      case "BOOL":
        rowBuilder.add("" + resultSet.getBoolean(columnName));
        break;
      case "INT64":
        rowBuilder.add("" + resultSet.getLong(columnName));
        break;
      case "BYTES":
        String byteToString = bytesToString(resultSet.getBytes(columnName));
        rowBuilder.add(byteToString);
        break;
      case "TIMESTAMP":
        rowBuilder.add("" + resultSet.getTimestamp(columnName));
        break;
      case "DATE":
        rowBuilder.add("" + resultSet.getDate(columnName));
        break;
      case "ARRAY<INT64>":
        String arrayToString = longArrayToString(resultSet.getLongArray(columnName));
        rowBuilder.add(arrayToString);
        break;
      default:
        rowBuilder.add(UNSUPPORT_ERROR);
    }
  }

  private String longArrayToString(long[] longArray) {
    return "[" + StringUtils.join(longArray, ',') + "]";
  }

  private String bytesToString(ByteArray bytes) {
    try {
      byte[] byteArray = bytes.toByteArray();
      return new String(byteArray, ENCODING_TYPE);
    } catch (UnsupportedEncodingException e) {
      return ENCODING_ERROR;
    }
  }
}