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
    //TODO: check to make sure there is userid or deviceid in request
    
    response.setContentType(TEXT_TYPE);
    selectedTables = request.getParameterValues(TABLE_SELECT_PARAM);
    String databaseName = request.getParameter(DATABASE_PARAM);
    initDatabaseClient(databaseName);

    List<Table> tables = new ArrayList<>();
    List<String> queries = new ArrayList<>();
    QueryFactory queryFactory = QueryFactory.getInstance();

    for (String table : selectedTables) {
      //Prevent people trying to see AuditLog
      if (table.toLowerCase().equals("auditlog")) {
        continue;
      }

      String[] selectedColsInTable = null;
      if (request.getParameterValues(table) != null) {
        selectedColsInTable = request.getParameterValues(table);
      } 
      
      Statement columnQuery = queryFactory.buildSchemaQuery(table);
 
      try (ResultSet resultSet =
        dbClient.singleUse().executeQuery(columnQuery)) {
        ImmutableList<ColumnSchema> columnSchemas = initColumnSchemas(resultSet, selectedColsInTable);
        Statement.Builder builder = Statement.newBuilder("");

        Table.Builder tableBuilder = Table.builder().setName(table);
        tableBuilder.setColumnSchemas(columnSchemas);

        Statement queryStatement = queryFactory.constructQueryStatement(builder, columnSchemas, table, request);
        String queryString = queryStatement.toString();
        tableBuilder.setSql(queryString);
        queries.add(queryString);

        executeTableQuery(tableBuilder, queryStatement, columnSchemas);
        
        Table tableObject = tableBuilder.build();
        tables.add(tableObject);
      } catch (RuntimeException e) {
        // Do nothing - ignore (table has no columns or table DNE)
      }
    }

    //TODO(Will): Add auditing here (the list called queries has all the query strings)

    String json = new Gson().toJson(tables);
    response.getWriter().println(json);
  }

  private void checkTableHasColumns(List<ColumnSchema> columnSchemas) {
    // No columns -> throw error
    if (columnSchemas.size() == 0) {
      throw new RuntimeException(EMPTY_TABLE_ERROR);
    }
  } 

  private ImmutableList<ColumnSchema> initColumnSchemas(ResultSet resultSet, String[] selectedColsInTable) {
    ImmutableList.Builder<ColumnSchema> colSchemaBuilder = new ImmutableList.Builder<>();
    
    List<String> selectedCols = new ArrayList<>();
    if (selectedColsInTable != null) 
      selectedCols = Arrays.asList(selectedColsInTable);
    while (resultSet.next()) {
      String colName = resultSet.getString(0);
      if (selectedCols.size() == 0 || selectedCols.contains(colName)) {
        colSchemaBuilder.add(createColumnSchema(resultSet));
      }
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

    boolean isNullable = stringToBoolean(resultSet.getString(2));
    return ColumnSchema.create(columnName, schemaType, isNullable);
  }

  // Convert YES/NO String to true/false boolean
  private boolean stringToBoolean(String isNullableColumn) {
    boolean isNullable = false;
    if (isNullableColumn.toLowerCase().equals("YES")) {
      isNullable = true;
    }
    return isNullable;
  }

  private void initDatabaseClient(String databaseName) {
    this.dbClient = DatabaseConnector.getInstance().getDbClient(databaseName);
  }

   private void executeTableQuery(Table.Builder tableBuilder, Statement query, List<ColumnSchema> columnSchemas) throws IOException {
    try (ResultSet resultSet =
      dbClient
      .singleUse() 
      .executeQuery(query)) {
        
      int resultCount = 0;
      while (resultSet.next()) {
        resultCount++;
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

      if (resultCount == 0) {  
        tableBuilder.setIsEmpty(true);
      } else {
        tableBuilder.setIsEmpty(false);
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