// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.common.collect.Multimap;
import com.google.common.collect.ArrayListMultimap;
import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import static com.google.sps.servlets.Constants.DATABASE_PARAM;
import static com.google.sps.servlets.Constants.TABLE_SELECT_PARAM;

/** Servlet that returns an HTML list of all the columns of based on the selected tables. */
@WebServlet("/columns-from-tables")
public class ColumnsFromTablesServlet extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      response.setContentType("application/JSON;"); 

      Multimap<String, Object> data = ArrayListMultimap.create();
      Set<String> primaryKeyColumns = new HashSet<>();

      //Parsing the URL for the query parameters
      String[] listOfTables = request.getParameterValues(TABLE_SELECT_PARAM);
      
      String database = request.getParameter(DATABASE_PARAM);
      DatabaseClient dbClient = DatabaseConnector.getInstance().getDbClient(database);
      Statement query = QueryFactory.getInstance().buildFiltersQuery(listOfTables);

      try (ResultSet resultSet =
          dbClient
          .singleUse() 
          .executeQuery(query)) {
        while (resultSet.next()) {
          String tableName = resultSet.getString(0);
          List<String> primaryKeys = resultSet.getStringList(1);
          List<String> columns = resultSet.getStringList(2);
          primaryKeyColumns.addAll(primaryKeys);
          data.put(tableName, columns);
          data.put(tableName, primaryKeys);
        }
      }
      data.put("PrimaryKeys", primaryKeyColumns);
      
      //Converting resultList into JSON data
      String json = convertToJsonUsingGson(data);
      response.getWriter().println(json);
    }

    private String convertToJsonUsingGson(Multimap<String, Object> data) {
      Gson gson = new Gson();
      String json = gson.toJson(data.asMap());
      return json;
    }
}